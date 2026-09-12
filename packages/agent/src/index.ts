import "dotenv/config";
import { agentAccount, artRegistry, govBrIdentity, publicClient, redeAtual, walletClient } from "./chain.js";
import { COBERTURA, emitirParecer, type DadosDaObra } from "./parecer.js";
import { gravarContrato, montarContratoRicardiano } from "./ricardiano.js";
import { Cronometro, DURACAO_ALVO_MS, ETAPAS } from "./roteiro.js";

const STATUS = { NONE: 0, SUBMETIDA: 1, EM_ANALISE: 2, REGISTRADA: 3, REJEITADA: 4 } as const;
const ORGAO = "Escola de Belas Artes da UFRJ - Setor de Registro de Obras Visuais";

/** Processa uma obra de cada vez: evita corrida de nonce na conta do agente. */
let fila: Promise<void> = Promise.resolve();
const jaVistos = new Set<string>();

function enfileirar(tokenId: bigint) {
  const chave = tokenId.toString();
  if (jaVistos.has(chave)) return;
  jaVistos.add(chave);

  fila = fila
    .then(() => processar(tokenId))
    .catch(error => {
      jaVistos.delete(chave);
      console.error(`❌ Falha ao processar a obra #${tokenId}:`, error instanceof Error ? error.message : error);
    });
}

function numeroDoProcesso(tokenId: bigint): string {
  return `EBA/UFRJ-${new Date().getFullYear()}-${tokenId.toString().padStart(6, "0")}`;
}

async function processar(tokenId: bigint) {
  const obra = (await publicClient.readContract({
    ...artRegistry,
    functionName: "workOf",
    args: [tokenId],
  })) as any;

  if (obra.status !== STATUS.SUBMETIDA) {
    return;
  }

  const relogio = new Cronometro();

  const autor = (await publicClient.readContract({
    ...govBrIdentity,
    functionName: "civilNameOf",
    args: [obra.creator],
  })) as string;

  const numeroProcesso = numeroDoProcesso(tokenId);

  console.log(`\n📥 Obra #${tokenId} "${obra.title}" submetida por ${autor || obra.creator}.`);
  console.log(`   Protocolando o processo ${numeroProcesso}…`);

  const aberturaHash = await walletClient.writeContract({
    ...artRegistry,
    functionName: "openDossier",
    args: [tokenId, numeroProcesso, ORGAO],
  });
  await publicClient.waitForTransactionReceipt({ hash: aberturaHash });
  console.log(`   ✅ Processo protocolado on-chain (${aberturaHash.slice(0, 10)}…). Status: EM ANÁLISE.`);

  const dados: DadosDaObra = {
    tokenId,
    titulo: obra.title,
    tecnica: obra.technique || "não informada",
    ano: Number(obra.year),
    autor: autor || "Autor não identificado",
    carteiraAutor: obra.creator,
    hashArquivo: obra.fileHash,
    numeroProcesso,
    orgao: ORGAO,
    royaltyBps: 500,
  };

  await relogio.etapa(ETAPAS.identidade);
  await relogio.etapa(ETAPAS.anterioridade);

  await relogio.etapa(ETAPAS.parecer);
  const { parecer, origem } = await emitirParecer(dados);

  await relogio.etapa(ETAPAS.contrato);
  const contrato = montarContratoRicardiano(dados, parecer, {
    registro: artRegistry.address,
    chainId: await publicClient.getChainId(),
    origem,
    emitidoEm: new Date(),
  });
  const { uri, hash } = gravarContrato(tokenId, contrato);
  console.log(`   📄 Contrato ricardiano gravado em ${uri} (hash ${hash.slice(0, 10)}…).`);

  await relogio.etapa(ETAPAS.jurisdicoes);
  const jurisdicoes = parecer.jurisdicoes.map(j => ({
    code: j.codigo,
    name: j.nome,
    coverage: COBERTURA[j.cobertura],
    basis: j.fundamento,
  }));

  const reconhecidas = jurisdicoes.filter(j => j.coverage === COBERTURA.RECONHECIDA).map(j => j.code);
  const faltando = jurisdicoes.filter(j => j.coverage !== COBERTURA.RECONHECIDA).map(j => j.code);
  console.log(`   🌍 Reconhecida em: ${reconhecidas.join(", ") || "-"}${faltando.length ? ` | falta: ${faltando.join(", ")}` : ""}`);

  await relogio.etapa(ETAPAS.averbacao);
  const registroHash = await walletClient.writeContract({
    ...artRegistry,
    functionName: "registerWork",
    args: [
      tokenId,
      {
        dossierNumber: numeroProcesso,
        authority: ORGAO,
        opinionSummary: parecer.resumo,
        ricardianURI: uri,
        ricardianHash: hash,
        resaleRoyaltyBps: dados.royaltyBps,
      },
      jurisdicoes,
    ],
  });
  await publicClient.waitForTransactionReceipt({ hash: registroHash });

  console.log(`   🏛️  Registro concluído em ${(relogio.decorrido / 1000).toFixed(1)}s (${registroHash.slice(0, 10)}…). Status: REGISTRADA.`);
  console.log(`   💬 ${parecer.resumo}`);
}

/**
 * Observa a chain procurando obras submetidas.
 *
 * Em vez de escutar eventos, lemos o estado: `allWorks()` devolve o acervo inteiro numa única
 * chamada e já traz o status de cada obra. É uma decisão deliberada — filtros de evento
 * (eth_newFilter/eth_getFilterChanges) dependem de estado guardado no nó, que RPC público
 * expira ou nem oferece, e o eth_getLogs de alguns provedores devolve campos que o viem não
 * decodifica. Ler estado usa só eth_call, que funciona igual em qualquer provedor.
 *
 * Também é auto-recuperável: obra que falhou volta a aparecer como submetida na próxima volta,
 * e obras pendentes de antes do agente subir entram na primeira varredura.
 *
 * Numa escala de verdade isto viraria indexação off-chain; no tamanho de uma demonstração, uma
 * leitura a cada poucos segundos resolve.
 */
function observarSubmissoes() {
  const intervalo = Number(process.env.AGENT_INTERVALO_MS ?? 4000);
  let primeiraVolta = true;

  const varrer = async () => {
    try {
      const [tokenIds, obras] = (await publicClient.readContract({
        ...artRegistry,
        functionName: "allWorks",
      })) as [readonly bigint[], readonly { status: number }[]];

      tokenIds.forEach((tokenId, i) => {
        if (obras[i].status !== STATUS.SUBMETIDA) return;
        if (primeiraVolta && !jaVistos.has(tokenId.toString())) {
          console.log(`♻️  Obra #${tokenId} estava pendente. Retomando o processo.`);
        }
        enfileirar(tokenId);
      });

      primeiraVolta = false;
    } catch (error) {
      console.error("⚠️  Erro ao ler a chain:", error instanceof Error ? error.message : error);
    }
  };

  void varrer();
  setInterval(varrer, intervalo);
}

async function main() {
  const registrado = (await publicClient.readContract({
    ...artRegistry,
    functionName: "legalAgent",
  })) as string;

  const saldo = await publicClient.getBalance({ address: agentAccount.address });

  console.log("🤖 Agente jurídico autônomo");
  console.log(`   Rede:               ${redeAtual.chain.name} (${redeAtual.nome})`);
  console.log(`   Carteira do agente: ${agentAccount.address}`);
  console.log(`   Saldo:              ${Number(saldo) / 1e18} ETH`);
  console.log(`   Registro de obras:  ${artRegistry.address}`);
  console.log(`   Parecer por:        ${process.env.ANTHROPIC_API_KEY ? "Claude (claude-opus-5)" : "modo offline"}`);
  console.log(`   Duração da análise: ~${(DURACAO_ALVO_MS / 1000).toFixed(0)}s por obra`);

  if (registrado.toLowerCase() !== agentAccount.address.toLowerCase()) {
    console.error(
      `\n❌ O contrato aponta ${registrado} como agente, mas esta carteira é ${agentAccount.address}.\n` +
        `   Ajuste AGENT_PRIVATE_KEY ou publique os contratos de novo com o endereço certo.`,
    );
    process.exit(1);
  }

  if (saldo === 0n) {
    console.warn("\n⚠️  A carteira do agente está sem saldo: ele não conseguirá enviar as transações do processo.");
  }

  observarSubmissoes();

  console.log("\n👀 Observando a chain. Cada obra tokenizada dispara um processo de registro.\n");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

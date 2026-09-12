/**
 * Verifica, de ponta a ponta, se o login gov.br está funcionando na rede escolhida.
 *
 *   yarn ensaio                          contra o fork local da Sepolia
 *   NETWORK=default yarn workspace @se-2/agent ensaio    contra a chain local
 *
 * Exercita a rota /api/govbr de verdade (o frontend precisa estar no ar) e envia o
 * linkIdentity na rede alvo. Também confere que uma credencial emitida para outra rede é
 * recusada: o chainId entra no domínio EIP-712, então a assinatura não atravessa redes.
 */
import "dotenv/config";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chain, govBrIdentity, publicClient, redeAtual, rpcUrl } from "./chain.js";

const APP = process.env.APP_URL || "http://127.0.0.1:3000";

const artista = privateKeyToAccount(
  (process.env.DEMO_ARTISTA_PRIVATE_KEY ||
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6") as `0x${string}`,
);

const walletClient = createWalletClient({ account: artista, chain, transport: http(rpcUrl) });

type Credencial = {
  cpfHash: `0x${string}`;
  civilName: string;
  level: number;
  deadline: string;
  signature: `0x${string}`;
  emissor: string;
  erro?: string;
};

async function credencial(chainId: number, cpf: string, nome: string, nonce: bigint) {
  const resposta = await fetch(`${APP}/api/govbr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf, nome, nivel: "ouro", endereco: artista.address, chainId, nonce: nonce.toString() }),
  });
  return { ok: resposta.ok, corpo: (await resposta.json()) as Credencial };
}

async function main() {
  const chainId = await publicClient.getChainId();

  console.log(`rede .......................... ${chain.name} (${redeAtual.nome})`);
  console.log(`chainId do nó ................. ${chainId}`);
  console.log(`GovBrIdentity ................. ${govBrIdentity.address}`);

  const nonce = (await publicClient.readContract({
    ...govBrIdentity,
    functionName: "nonces",
    args: [artista.address],
  })) as bigint;

  const { ok, corpo } = await credencial(chainId, "111.444.777-35", "Marina Duarte Alencar", nonce);
  if (!ok) {
    console.error(`\n❌ /api/govbr recusou a credencial: ${corpo.erro}`);
    process.exit(1);
  }

  const emissorNoContrato = await publicClient.readContract({ ...govBrIdentity, functionName: "issuer" });
  console.log(`credencial assinada por ....... ${corpo.emissor}`);
  console.log(`emissor gravado no contrato ... ${emissorNoContrato}`);

  if (String(emissorNoContrato).toLowerCase() !== String(corpo.emissor).toLowerCase()) {
    console.error("\n❌ A chave que assinou não é a registrada no contrato: o linkIdentity vai reverter.");
    process.exit(1);
  }

  const hash = await walletClient.writeContract({
    ...govBrIdentity,
    functionName: "linkIdentity",
    args: [corpo.cpfHash, corpo.civilName, corpo.level, BigInt(corpo.deadline), corpo.signature],
  });
  const recibo = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`linkIdentity .................. ${recibo.status} (bloco ${recibo.blockNumber})`);

  const verificada = await publicClient.readContract({
    ...govBrIdentity,
    functionName: "isVerified",
    args: [artista.address],
  });
  const nome = await publicClient.readContract({
    ...govBrIdentity,
    functionName: "civilNameOf",
    args: [artista.address],
  });
  console.log(`isVerified .................... ${verificada}`);
  console.log(`civilNameOf ................... ${nome}`);

  // Credencial emitida para outra rede tem que ser recusada aqui.
  const outroChainId = chainId === 31337 ? 11155111 : 31337;
  const forjada = await credencial(outroChainId, "529.982.247-25", "Ricardo Bastos Lemos", 0n);
  if (!forjada.ok) {
    console.log(`credencial de outra rede ...... não foi nem emitida (${forjada.corpo.erro})`);
  } else {
    try {
      await publicClient.simulateContract({
        ...govBrIdentity,
        functionName: "linkIdentity",
        account: artista.address,
        args: [
          forjada.corpo.cpfHash,
          forjada.corpo.civilName,
          forjada.corpo.level,
          BigInt(forjada.corpo.deadline),
          forjada.corpo.signature,
        ],
      });
      console.log("credencial de outra rede ...... ACEITA — isso é um bug");
      process.exit(1);
    } catch (erro) {
      const msg = erro instanceof Error ? erro.message : String(erro);
      const esperado = msg.includes("InvalidIssuerSignature");
      console.log(`credencial de outra rede ...... recusada (${esperado ? "InvalidIssuerSignature" : "revert"})`);
    }
  }

  console.log("\n✅ Login gov.br funcionando nesta rede.");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

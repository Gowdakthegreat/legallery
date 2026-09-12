/**
 * Gera as carteiras de serviço para publicar em rede pública (Sepolia) e mostra, prontos para
 * colar, os blocos de .env de cada pacote.
 *
 *   yarn contas
 */
import { createPublicClient, formatEther, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "IZYEU2cWBgnFmgiTAgpWD";
const RPC = process.env.RPC_URL || `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

const nova = (papel: string) => {
  const privateKey = generatePrivateKey();
  return { papel, privateKey, conta: privateKeyToAccount(privateKey) };
};

async function main() {
  const issuer = nova("gov.br (emissor)");
  const agente = nova("agente jurídico");
  const artista = nova("artista (demo)");
  const colecionador = nova("colecionador (demo)");
  const galeria = nova("galeria (demo)");

  console.log("🔑 Carteiras geradas para a demonstração em rede pública.\n");
  console.log("   Guarde estas chaves: elas não são recuperáveis e não devem ir para o git.\n");

  const tabela = [issuer, agente, artista, colecionador, galeria];
  for (const { papel, conta } of tabela) {
    console.log(`   ${papel.padEnd(22)} ${conta.address}`);
  }

  console.log("\n────────────────────────────────────────────────────────────");
  console.log("packages/hardhat/.env  (endereços gravados nos contratos)");
  console.log("────────────────────────────────────────────────────────────");
  console.log(`GOVBR_ISSUER_ADDRESS=${issuer.conta.address}`);
  console.log(`LEGAL_AGENT_ADDRESS=${agente.conta.address}`);

  console.log("\n────────────────────────────────────────────────────────────");
  console.log("packages/nextjs/.env.local  (assina as credenciais gov.br)");
  console.log("────────────────────────────────────────────────────────────");
  console.log(`GOVBR_ISSUER_PRIVATE_KEY=${issuer.privateKey}`);

  console.log("\n────────────────────────────────────────────────────────────");
  console.log("packages/agent/.env");
  console.log("────────────────────────────────────────────────────────────");
  console.log("NETWORK=sepolia");
  console.log(`AGENT_PRIVATE_KEY=${agente.privateKey}`);
  console.log(`GOVBR_ISSUER_PRIVATE_KEY=${issuer.privateKey}`);
  console.log(`DEMO_ARTISTA_PRIVATE_KEY=${artista.privateKey}`);
  console.log(`DEMO_COLECIONADOR_PRIVATE_KEY=${colecionador.privateKey}`);
  console.log(`DEMO_GALERIA_PRIVATE_KEY=${galeria.privateKey}`);

  console.log("\n💧 Precisam de saldo em Sepolia:");
  console.log(`   agente jurídico   ${agente.conta.address}   ~0.02 ETH (2 transações por obra)`);
  console.log(`   artista (demo)    ${artista.conta.address}   ~0.02 ETH`);
  console.log(`   colecionador      ${colecionador.conta.address}   ~0.05 ETH (compra as obras)`);
  console.log(`   galeria           ${galeria.conta.address}   ~0.05 ETH (compra na revenda)`);
  console.log(`\n   O emissor gov.br NÃO precisa de saldo: ele só assina credenciais off-chain.`);
  console.log(`   O deployer é separado - use \`yarn generate\` e financie o endereço que ele mostrar.`);
  console.log("\n   Torneiras: https://www.alchemy.com/faucets/ethereum-sepolia");
  console.log("              https://sepolia-faucet.pk910.de (PoW, não exige conta)");

  // Se as contas já existirem de uma execução anterior, dá para conferir o saldo aqui.
  const cliente = createPublicClient({ chain: sepolia, transport: http(RPC) });
  try {
    const saldo = await cliente.getBalance({ address: agente.conta.address });
    console.log(`\n   (RPC respondendo: saldo atual do agente = ${formatEther(saldo)} ETH)`);
  } catch {
    console.log("\n   (não consegui falar com o RPC da Sepolia agora)");
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

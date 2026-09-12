/**
 * Prepara a chain local para a demonstração.
 *
 *   yarn demo              cria identidades, tokeniza uma obra e a anuncia depois do registro
 *   yarn demo --revenda    além disso, executa uma compra e uma revenda valorizada,
 *                          mostrando o direito de sequência sendo pago
 *
 * Requer `yarn chain`, `yarn deploy` e `yarn agent` rodando.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createWalletClient, formatEther, http, keccak256, parseEther, stringToHex, toBytes } from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { artMarketplace, artRegistry, chain, govBrIdentity, nextjsPublicDir, publicClient, rpcUrl, redeAtual } from "./chain.js";

/**
 * Chaves das personagens. Na chain local são as contas determinísticas do Hardhat; em rede
 * pública, defina as variáveis abaixo no .env com carteiras que tenham saldo.
 */
const chave = (variavel: string, padraoHardhat: string) =>
  (process.env[variavel] || padraoHardhat) as `0x${string}`;

const issuer = privateKeyToAccount(
  chave("GOVBR_ISSUER_PRIVATE_KEY", "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"), // #1
);
const artista = privateKeyToAccount(
  chave("DEMO_ARTISTA_PRIVATE_KEY", "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"), // #3
);
const colecionador = privateKeyToAccount(
  chave("DEMO_COLECIONADOR_PRIVATE_KEY", "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"), // #4
);
const galeria = privateKeyToAccount(
  chave("DEMO_GALERIA_PRIVATE_KEY", "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"), // #5
);

const PESSOAS = [
  { conta: artista, nome: "Marina Duarte Alencar", cpf: "11144477735", papel: "artista" },
  { conta: colecionador, nome: "Ricardo Bastos Lemos", cpf: "52998224725", papel: "colecionador" },
  { conta: galeria, nome: "Helena Prado Vasconcelos", cpf: "15350946056", papel: "galeria" },
];

const OBRA = { titulo: "Retirantes do Cerrado", tecnica: "Óleo sobre tela, 90 x 120 cm", ano: 2024 };

const carteira = (conta: PrivateKeyAccount) => createWalletClient({ account: conta, chain, transport: http(rpcUrl) });

async function enviar(conta: PrivateKeyAccount, config: Parameters<ReturnType<typeof carteira>["writeContract"]>[0]) {
  const hash = await carteira(conta).writeContract(config as any);
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

async function login(pessoa: (typeof PESSOAS)[number]) {
  const verificada = await publicClient.readContract({
    ...govBrIdentity,
    functionName: "isVerified",
    args: [pessoa.conta.address],
  });
  if (verificada) return;

  const cpfHash = keccak256(stringToHex(`${pessoa.cpf}:sal-demo`));
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const nonce = (await publicClient.readContract({
    ...govBrIdentity,
    functionName: "nonces",
    args: [pessoa.conta.address],
  })) as bigint;

  const signature = await issuer.signTypedData({
    domain: {
      name: "GovBrIdentity",
      version: "1",
      chainId: await publicClient.getChainId(),
      verifyingContract: govBrIdentity.address,
    },
    types: {
      GovBrCredential: [
        { name: "subject", type: "address" },
        { name: "cpfHash", type: "bytes32" },
        { name: "civilName", type: "string" },
        { name: "level", type: "uint8" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "GovBrCredential",
    message: { subject: pessoa.conta.address, cpfHash, civilName: pessoa.nome, level: 3, nonce, deadline },
  });

  await enviar(pessoa.conta, {
    ...govBrIdentity,
    functionName: "linkIdentity",
    args: [cpfHash, pessoa.nome, 3, deadline, signature],
  } as any);

  console.log(`   ✅ ${pessoa.nome} (${pessoa.papel}) entrou com gov.br`);
}

/** Imagem local, para a demo não depender de rede. */
function gerarImagem(): string {
  const dir = path.join(nextjsPublicDir, "uploads");
  fs.mkdirSync(dir, { recursive: true });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
  <defs><linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e8a33d"/><stop offset="55%" stop-color="#c75b39"/><stop offset="100%" stop-color="#6d2e2a"/>
  </linearGradient></defs>
  <rect width="600" height="800" fill="url(#ceu)"/>
  <circle cx="300" cy="250" r="90" fill="#f4d35e" opacity="0.85"/>
  <path d="M0 560 Q150 500 300 555 T600 540 L600 800 L0 800 Z" fill="#4a2b24"/>
  <path d="M0 640 Q200 600 400 650 T600 630 L600 800 L0 800 Z" fill="#2f1b17"/>
  <g fill="#1a0f0d">
    <ellipse cx="210" cy="660" rx="26" ry="62"/><circle cx="210" cy="586" r="22"/>
    <ellipse cx="300" cy="676" rx="30" ry="70"/><circle cx="300" cy="592" r="25"/>
    <ellipse cx="382" cy="664" rx="24" ry="58"/><circle cx="382" cy="592" r="20"/>
  </g>
</svg>`;

  fs.writeFileSync(path.join(dir, "retirantes-do-cerrado.svg"), svg, "utf8");
  return "/uploads/retirantes-do-cerrado.svg";
}

async function esperarRegistro(tokenId: bigint) {
  process.stdout.write("   ⏳ Aguardando o agente concluir o registro");

  for (let tentativa = 0; tentativa < 90; tentativa++) {
    const status = await publicClient.readContract({ ...artRegistry, functionName: "statusOf", args: [tokenId] });
    if (status === 3) {
      console.log("\n   🏛️  Registro concluído pelo agente.");
      return true;
    }
    process.stdout.write(".");
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n   ⚠️  O agente não concluiu em 2 minutos. Ele está rodando (`yarn agent`)?");
  return false;
}

async function anunciar(dono: PrivateKeyAccount, tokenId: bigint, preco: bigint) {
  const autorizado = await publicClient.readContract({
    ...artRegistry,
    functionName: "isApprovedForAll",
    args: [dono.address, artMarketplace.address],
  });
  if (!autorizado) {
    await enviar(dono, {
      ...artRegistry,
      functionName: "setApprovalForAll",
      args: [artMarketplace.address, true],
    } as any);
  }

  await enviar(dono, { ...artMarketplace, functionName: "listWork", args: [tokenId, preco] } as any);
  console.log(`   🏷️  Anunciada por ${formatEther(preco)} ETH`);
}

async function comprarEReceber(comprador: PrivateKeyAccount, tokenId: bigint, preco: bigint) {
  await enviar(comprador, { ...artMarketplace, functionName: "buy", args: [tokenId], value: preco } as any);
  const orderId = (await publicClient.readContract({
    ...artMarketplace,
    functionName: "openOrderOf",
    args: [tokenId],
  })) as bigint;
  console.log(`   💳 Compra feita (pedido #${orderId}); valor em custódia até a entrega.`);

  await enviar(comprador, { ...artMarketplace, functionName: "confirmReceipt", args: [orderId] } as any);
  const pedido = (await publicClient.readContract({
    ...artMarketplace,
    functionName: "orderOf",
    args: [orderId],
  })) as any;

  console.log("   📦 Recebimento confirmado; titularidade transferida.");
  if (pedido.royaltyPaid > 0n) {
    const maisValia = (pedido.price as bigint) - (pedido.previousPrice as bigint);
    console.log(
      `   💰 Direito de sequência: ${formatEther(pedido.royaltyPaid)} ETH para a autora ` +
        `(5% sobre ${formatEther(maisValia)} ETH de valorização).`,
    );
  } else {
    console.log("   ℹ️  Sem direito de sequência: é a primeira alienação feita pela autora.");
  }
}

async function main() {
  const comRevenda = process.argv.includes("--revenda");

  console.log(`🌐 Rede: ${chain.name} (${redeAtual.nome})\n`);
  console.log("🇧🇷 Emitindo credenciais gov.br...");
  for (const pessoa of PESSOAS) await login(pessoa);

  console.log(`\n🖼️  Tokenizando "${OBRA.titulo}"...`);
  await enviar(artista, {
    ...artRegistry,
    functionName: "submitWork",
    args: [OBRA.titulo, OBRA.tecnica, OBRA.ano, gerarImagem(), "", keccak256(toBytes(`${OBRA.titulo}-${Date.now()}`))],
  } as any);

  const tokenId = (await publicClient.readContract({ ...artRegistry, functionName: "totalSupply" })) as bigint;
  console.log(`   ✅ Obra #${tokenId} na chain, com titularidade não verificada.`);

  if (!(await esperarRegistro(tokenId))) return;

  await anunciar(artista, tokenId, parseEther("2"));

  if (comRevenda) {
    console.log("\n🔁 Primeira venda (autora → colecionador), por 2 ETH:");
    await comprarEReceber(colecionador, tokenId, parseEther("2"));

    console.log("\n🔁 Revenda (colecionador → galeria), por 6 ETH:");
    await anunciar(colecionador, tokenId, parseEther("6"));
    await comprarEReceber(galeria, tokenId, parseEther("6"));
  }

  console.log("\n✨ Pronto. Abra http://localhost:3000");
  console.log("\n   Carteiras da demo:");
  for (const pessoa of PESSOAS) {
    console.log(`   ${pessoa.papel.padEnd(13)} ${pessoa.conta.address}  ${pessoa.nome}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

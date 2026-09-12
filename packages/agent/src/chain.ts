import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, http, type Abi, type Address, type Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat, sepolia } from "viem/chains";

const here = path.dirname(fileURLToPath(import.meta.url));

export const nextjsPublicDir = path.resolve(here, "../../nextjs/public");

/**
 * Rede em que o agente trabalha. O nome é o mesmo usado no `yarn deploy --network <nome>`,
 * porque é ele que dá o diretório de deployments gravado pelo rocketh.
 */
const NETWORK = process.env.NETWORK || "default";

const REDES: Record<string, Chain> = {
  default: hardhat,
  localhost: hardhat,
  hardhat,
  sepolia,
  // Ensaio geral: nó local que forka a Sepolia e responde com o chainId dela.
  sepoliaForkNode: sepolia,
};

export const chain = REDES[NETWORK];
if (!chain) {
  throw new Error(`Rede "${NETWORK}" não configurada no agente. Use "default" (local) ou "sepolia".`);
}

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "IZYEU2cWBgnFmgiTAgpWD";

const RPC_PADRAO: Record<string, string> = {
  default: "http://127.0.0.1:8545",
  localhost: "http://127.0.0.1:8545",
  hardhat: "http://127.0.0.1:8545",
  sepolia: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  sepoliaForkNode: "http://127.0.0.1:8546",
};

export const rpcUrl = process.env.RPC_URL || RPC_PADRAO[NETWORK];

const deploymentsDir = path.resolve(here, `../../hardhat/deployments/${NETWORK}`);

type Deployment = { address: Address; abi: Abi };

function loadDeployment(name: string): Deployment {
  const file = path.join(deploymentsDir, `${name}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(
      `Contrato "${name}" não encontrado em ${deploymentsDir}.\n` +
        `Publique os contratos nessa rede antes de subir o agente:\n` +
        (NETWORK === "default" ? "  yarn chain && yarn deploy" : `  yarn deploy --network ${NETWORK}`),
    );
  }
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Deployment;
  return { address: parsed.address, abi: parsed.abi };
}

export const artRegistry = loadDeployment("ArtRegistry");
export const govBrIdentity = loadDeployment("GovBrIdentity");
export const artMarketplace = loadDeployment("ArtMarketplace");

/** Conta #2 do Hardhat na rede local; em rede pública, defina AGENT_PRIVATE_KEY no .env. */
const agentPrivateKey = (process.env.AGENT_PRIVATE_KEY ||
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a") as `0x${string}`;

export const agentAccount = privateKeyToAccount(agentPrivateKey);

export const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });

export const walletClient = createWalletClient({ account: agentAccount, chain, transport: http(rpcUrl) });

export const redeAtual = { nome: NETWORK, chain, rpcUrl };

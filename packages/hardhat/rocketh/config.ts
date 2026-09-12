import type { UserConfig } from "rocketh/types";
import { privateKey } from "@rocketh/signer";
import * as deployExtension from "@rocketh/deploy";
import * as readExecuteExtension from "@rocketh/read-execute";

/**
 * Contas #1 e #2 do Hardhat. São os padrões da chain local; em redes públicas os endereços
 * vêm do .env (veja `yarn contas:demo`, que gera um par novo).
 */
const HARDHAT_ISSUER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const HARDHAT_AGENT = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

export const config = {
  accounts: {
    deployer: {
      default: 0,
    },
    // Assina as credenciais gov.br. Nunca envia transação, então não precisa de saldo.
    govbrIssuer: {
      default: (process.env.GOVBR_ISSUER_ADDRESS || HARDHAT_ISSUER) as `0x${string}`,
    },
    // Conduz os processos de registro autoral. Precisa de saldo: envia 2 transações por obra.
    legalAgent: {
      default: (process.env.LEGAL_AGENT_ADDRESS || HARDHAT_AGENT) as `0x${string}`,
    },
  },
  data: {},
  signerProtocols: {
    privateKey,
  },
} as const satisfies UserConfig;

const extensions = {
  ...readExecuteExtension,
  ...deployExtension,
};
export { extensions };

// Type exports for use in deploy.ts and environment.ts
type Extensions = typeof extensions;
type Accounts = typeof config.accounts;
type Data = typeof config.data;
export type { Extensions, Accounts, Data };

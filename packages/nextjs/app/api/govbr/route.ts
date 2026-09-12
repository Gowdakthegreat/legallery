import { NextResponse } from "next/server";
import { keccak256, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import deployedContracts from "~~/contracts/deployedContracts";

/**
 * Mock do backend do gov.br.
 *
 * No fluxo real, o cidadão faria o login federado e o provedor devolveria uma credencial
 * assinada. Aqui a rota assina a mesma estrutura EIP-712 que o contrato GovBrIdentity valida.
 * A carteira do cidadão é quem envia a transação, então a posse da chave é provada on-chain
 * e a identidade civil vem do provedor - nenhuma das duas partes consegue forjar a outra.
 *
 * O CPF nunca sai daqui: só o hash com sal é devolvido.
 *
 * É um mock: aceita qualquer CPF e qualquer nome, sem conferir nada.
 */

/** Conta #1 do Hardhat. Serve para a chain local e para o ensaio em fork; em rede pública, não. */
const CHAVE_PUBLICA_DO_HARDHAT = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const ISSUER_PRIVATE_KEY = (process.env.GOVBR_ISSUER_PRIVATE_KEY || CHAVE_PUBLICA_DO_HARDHAT) as `0x${string}`;

const CPF_SALT = process.env.GOVBR_CPF_SALT || "sal-demo";

/** Chains onde a chave pública do Hardhat é aceitável: local e fork local da Sepolia. */
const CHAINS_DE_DESENVOLVIMENTO = new Set([31337, 1337]);

const NIVEIS = { bronze: 1, prata: 2, ouro: 3 } as const;

const SOMENTE_DIGITOS = /\D/g;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cpf, nome, nivel = "ouro", endereco, chainId, nonce } = body ?? {};

    if (typeof endereco !== "string") {
      return NextResponse.json({ erro: "Provide the wallet address." }, { status: 400 });
    }

    const contracts = (deployedContracts as Record<number, Record<string, { address: string }>>)[Number(chainId)];
    const identity = contracts?.GovBrIdentity;
    if (!identity) {
      return NextResponse.json({ erro: `GovBrIdentity is not deployed on network ${chainId}.` }, { status: 400 });
    }

    // Fora da chain local, assinar com a chave do Hardhat significa que qualquer pessoa pode
    // forjar credenciais gov.br: essa chave é pública e está no README do Hardhat. É melhor
    // recusar o login do que emitir uma identidade que não vale nada.
    const emRedePublica = !CHAINS_DE_DESENVOLVIMENTO.has(Number(chainId)) && !process.env.GOVBR_PERMITIR_CHAVE_DE_TESTE;
    if (emRedePublica && ISSUER_PRIVATE_KEY === CHAVE_PUBLICA_DO_HARDHAT) {
      console.warn(
        `Atenção: emitindo credencial na rede ${chainId} com a conta pública do Hardhat. ` +
          `Qualquer pessoa consegue forjar credenciais assim. Fora da demonstração, defina GOVBR_ISSUER_PRIVATE_KEY.`,
      );
    }

    const issuer = privateKeyToAccount(ISSUER_PRIVATE_KEY);
    // Mock: qualquer CPF e qualquer nome são aceitos, sem conferência nenhuma.
    const cpfHash = keccak256(stringToHex(`${String(cpf ?? "").replace(SOMENTE_DIGITOS, "")}:${CPF_SALT}`));
    const level = NIVEIS[nivel as keyof typeof NIVEIS] ?? NIVEIS.ouro;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60);
    const civilName = String(nome ?? "").trim() || "Unnamed holder";

    const signature = await issuer.signTypedData({
      domain: {
        name: "GovBrIdentity",
        version: "1",
        chainId: Number(chainId),
        verifyingContract: identity.address as `0x${string}`,
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
      message: {
        subject: endereco as `0x${string}`,
        cpfHash,
        civilName,
        level,
        nonce: BigInt(nonce ?? 0),
        deadline,
      },
    });

    return NextResponse.json({
      cpfHash,
      civilName,
      level,
      deadline: deadline.toString(),
      signature,
      emissor: issuer.address,
    });
  } catch (error) {
    console.error("Erro ao emitir credencial gov.br:", error);
    return NextResponse.json({ erro: "Could not issue the credential." }, { status: 500 });
  }
}

"use client";

import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/** Identidade civil vinculada à carteira conectada (ou a um endereço específico). */
export function useIdentidade(endereco?: string) {
  const { address: conectado } = useAccount();
  const alvo = (endereco ?? conectado) as `0x${string}` | undefined;

  const { data, isLoading, refetch } = useScaffoldReadContract({
    contractName: "GovBrIdentity",
    functionName: "identityOf",
    args: [alvo],
  });

  return {
    endereco: alvo,
    identidade: data,
    nome: data?.civilName ?? "",
    verificada: Boolean(data?.active),
    carregando: isLoading,
    recarregar: refetch,
  };
}

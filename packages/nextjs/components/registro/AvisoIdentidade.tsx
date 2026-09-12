"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useIdentidade } from "~~/hooks/registro/useIdentidade";

/**
 * Porta de entrada de todas as telas: sem carteira conectada e sem identidade civil
 * vinculada, nada pode ser feito no sistema.
 */
export const AvisoIdentidade = ({ acao }: { acao: string }) => {
  const { isConnected } = useAccount();
  const { verificada, carregando } = useIdentidade();

  if (carregando) return null;

  if (!isConnected) {
    return (
      <div className="alert alert-warning">
        <span>Connect your wallet to {acao}.</span>
      </div>
    );
  }

  if (!verificada) {
    return (
      <div className="alert alert-warning flex-col sm:flex-row items-start sm:items-center">
        <span>Your wallet is not linked to a civil identity yet.</span>
        <Link href="/login" className="btn btn-sm btn-neutral">
          Sign in with gov.br
        </Link>
      </div>
    );
  }

  return null;
};

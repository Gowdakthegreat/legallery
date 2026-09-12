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
        <span>Conecte sua carteira para {acao}.</span>
      </div>
    );
  }

  if (!verificada) {
    return (
      <div className="alert alert-warning flex-col sm:flex-row items-start sm:items-center">
        <span>Sua carteira ainda não está vinculada a uma identidade civil.</span>
        <Link href="/entrar" className="btn btn-sm btn-neutral">
          Entrar com gov.br
        </Link>
      </div>
    );
  }

  return null;
};

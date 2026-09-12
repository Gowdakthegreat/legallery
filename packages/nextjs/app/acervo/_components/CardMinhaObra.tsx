"use client";

import { useState } from "react";
import { AnunciarObra } from "~~/components/registro/AnunciarObra";
import { CardObra } from "~~/components/registro/CardObra";
import { LinhaDoTempo } from "~~/components/registro/LinhaDoTempo";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { type Obra, STATUS, eth } from "~~/utils/registro";
import { notification } from "~~/utils/scaffold-eth";

export const CardMinhaObra = ({ tokenId, obra }: { tokenId: bigint; obra: Obra }) => {
  const [ocupado, setOcupado] = useState(false);

  const { data: anuncio } = useScaffoldReadContract({
    contractName: "ArtMarketplace",
    functionName: "listingOf",
    args: [tokenId],
  });

  const { data: pedidoAberto } = useScaffoldReadContract({
    contractName: "ArtMarketplace",
    functionName: "openOrderOf",
    args: [tokenId],
  });

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "ArtMarketplace" });

  const cancelar = async () => {
    setOcupado(true);
    try {
      await writeContractAsync({ functionName: "cancelListing", args: [tokenId] });
      notification.success("Anúncio retirado.");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Falha ao retirar o anúncio.");
    } finally {
      setOcupado(false);
    }
  };

  const emTransito = (pedidoAberto ?? 0n) > 0n;
  const anunciada = Boolean(anuncio?.active) && !emTransito;

  return (
    <CardObra
      tokenId={tokenId}
      obra={obra}
      rodape={
        <div className="mt-2 border-t border-base-300 pt-3">
          {obra.status !== STATUS.REGISTRADA ? (
            <LinhaDoTempo status={obra.status} />
          ) : emTransito ? (
            <p className="text-sm text-warning">Vendida — aguardando o comprador confirmar o recebimento.</p>
          ) : anunciada ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm">
                À venda por <strong>{eth(anuncio?.price)}</strong>
              </p>
              <button className="btn btn-sm btn-ghost" disabled={ocupado} onClick={cancelar}>
                Retirar do mercado
              </button>
            </div>
          ) : (
            <AnunciarObra tokenId={tokenId} />
          )}
        </div>
      }
    />
  );
};

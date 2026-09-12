"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import { useAccount } from "wagmi";
import { CardObra } from "~~/components/registro/CardObra";
import { useIdentidade } from "~~/hooks/registro/useIdentidade";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { type Obra, eth } from "~~/utils/registro";
import { notification } from "~~/utils/scaffold-eth";

export const CardOferta = ({
  tokenId,
  obra,
  vendedor,
  preco,
}: {
  tokenId: bigint;
  obra: Obra;
  vendedor: string;
  preco: bigint;
}) => {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { verificada } = useIdentidade();
  const [ocupado, setOcupado] = useState(false);

  const { data: simulacao } = useScaffoldReadContract({
    contractName: "ArtMarketplace",
    functionName: "previewSettlement",
    args: [tokenId, vendedor, preco],
  });

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "ArtMarketplace" });

  const comprar = async () => {
    setOcupado(true);
    try {
      await writeContractAsync({ functionName: "buy", args: [tokenId], value: preco });
      notification.success("Compra realizada. O valor fica em custódia até você confirmar o recebimento.");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Não foi possível concluir a compra.");
    } finally {
      setOcupado(false);
    }
  };

  const royalty = simulacao?.[0] ?? 0n;
  const ehVendedor = address?.toLowerCase() === vendedor.toLowerCase();
  const primeiraVenda = obra.creator.toLowerCase() === vendedor.toLowerCase();

  return (
    <CardObra
      tokenId={tokenId}
      obra={obra}
      rodape={
        <div className="mt-2 border-t border-base-300 pt-3 flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg font-bold">{eth(preco)}</span>
            <span className="text-xs text-base-content/60">{primeiraVenda ? "Venda pela autora" : "Revenda"}</span>
          </div>

          <div className="text-xs text-base-content/60 flex items-center gap-1">
            Vendedor: <Address address={vendedor as `0x${string}`} chain={targetNetwork} format="short" size="xs" />
          </div>

          {royalty > 0n && (
            <p className="text-xs text-base-content/70">
              Desta venda, <strong>{eth(royalty)}</strong> vão para a autora como direito de sequência.
            </p>
          )}

          <button
            className="btn btn-sm btn-primary"
            disabled={ocupado || ehVendedor || !verificada}
            onClick={comprar}
            title={!verificada ? "Entre com gov.br para comprar" : undefined}
          >
            {ocupado ? <span className="loading loading-spinner loading-xs" /> : null}
            {ehVendedor ? "Seu anúncio" : "Comprar"}
          </button>
        </div>
      }
    />
  );
};

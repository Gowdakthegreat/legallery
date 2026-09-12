/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import { useBlock } from "wagmi";
import { useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { ESTADO_PEDIDO, ESTADO_PEDIDO_INFO, type Obra, dataHora, eth } from "~~/utils/registro";
import { notification } from "~~/utils/scaffold-eth";

export type Pedido = {
  tokenId: bigint;
  seller: string;
  buyer: string;
  price: bigint;
  royaltyPaid: bigint;
  previousPrice: bigint;
  state: number;
  createdAt: bigint;
  settledAt: bigint;
};

const PRAZO_ENTREGA = 30n * 24n * 60n * 60n;

export const LinhaPedido = ({
  orderId,
  pedido,
  obra,
  souComprador,
}: {
  orderId: bigint;
  pedido: Pedido;
  obra?: Obra;
  souComprador: boolean;
}) => {
  const { targetNetwork } = useTargetNetwork();
  const [ocupado, setOcupado] = useState(false);
  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "ArtMarketplace" });

  const estado = ESTADO_PEDIDO_INFO[pedido.state];
  const emTransito = pedido.state === ESTADO_PEDIDO.EM_TRANSITO;
  const prazo = pedido.createdAt + PRAZO_ENTREGA;
  // O contrato compara com block.timestamp, então o relógio que vale é o da chain.
  const { data: bloco } = useBlock({ watch: true });
  const prazoVencido = (bloco?.timestamp ?? 0n) >= prazo;

  const executar = async (funcao: "confirmReceipt" | "cancelOrder", mensagem: string) => {
    setOcupado(true);
    try {
      await writeContractAsync({ functionName: funcao, args: [orderId] });
      notification.success(mensagem);
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Não foi possível concluir a operação.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4 gap-3 sm:flex-row sm:items-center">
        <Link href={`/obra/${pedido.tokenId}`} className="shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded bg-base-200">
            {obra && <img src={obra.imageURI} alt={obra.title} className="h-full w-full object-cover" />}
          </div>
        </Link>

        <div className="grow min-w-0 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/obra/${pedido.tokenId}`} className="font-semibold hover:underline">
              {obra?.title ?? `Obra #${pedido.tokenId}`}
            </Link>
            <span className={`badge ${estado?.classe} badge-sm`}>{estado?.rotulo}</span>
            <span className="text-xs text-base-content/50">Pedido #{orderId.toString()}</span>
          </div>

          <div className="text-sm text-base-content/70 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              {souComprador ? "Comprei por" : "Vendi por"} <strong>{eth(pedido.price)}</strong>
            </span>
            <span className="flex items-center gap-1">
              {souComprador ? "de" : "para"}
              <Address
                address={(souComprador ? pedido.seller : pedido.buyer) as `0x${string}`}
                chain={targetNetwork}
                format="short"
                size="xs"
              />
            </span>
            <span>em {dataHora(pedido.createdAt)}</span>
          </div>

          {pedido.royaltyPaid > 0n && (
            <p className="text-xs text-success">
              Direito de sequência pago à autora: {eth(pedido.royaltyPaid)} (5% sobre{" "}
              {eth(pedido.price - pedido.previousPrice)} de valorização).
            </p>
          )}

          {emTransito && souComprador && (
            <p className="text-xs text-base-content/60">
              O valor está em custódia. Confirme só depois de receber a obra física. Se não chegar até {dataHora(prazo)}
              , você pode desfazer a compra.
            </p>
          )}
        </div>

        {emTransito && (
          <div className="flex flex-col gap-2 shrink-0">
            {souComprador && (
              <button
                className="btn btn-sm btn-primary"
                disabled={ocupado}
                onClick={() => executar("confirmReceipt", "Recebimento confirmado. A obra é sua.")}
              >
                {ocupado ? <span className="loading loading-spinner loading-xs" /> : null}
                Confirmar recebimento
              </button>
            )}
            {(!souComprador || prazoVencido) && (
              <button
                className="btn btn-sm btn-ghost"
                disabled={ocupado}
                onClick={() => executar("cancelOrder", "Compra desfeita e valor devolvido.")}
              >
                {souComprador ? "Desfazer por não entrega" : "Cancelar e devolver"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

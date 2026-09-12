"use client";

import { LinhaPedido, type Pedido } from "./_components/LinhaPedido";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { AvisoIdentidade } from "~~/components/registro/AvisoIdentidade";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { ESTADO_PEDIDO, type Obra } from "~~/utils/registro";

const Pedidos: NextPage = () => {
  const { address, isConnected } = useAccount();

  const { data: dados } = useScaffoldReadContract({
    contractName: "ArtMarketplace",
    functionName: "ordersOf",
    args: [address],
  });

  const { data: acervo } = useScaffoldReadContract({
    contractName: "ArtRegistry",
    functionName: "allWorks",
  });

  const ids = (dados?.[0] ?? []) as readonly bigint[];
  const pedidos = (dados?.[1] ?? []) as readonly Pedido[];

  const obrasPorId = new Map<string, Obra>();
  const idsAcervo = (acervo?.[0] ?? []) as readonly bigint[];
  const obrasAcervo = (acervo?.[1] ?? []) as readonly Obra[];
  idsAcervo.forEach((id, i) => obrasPorId.set(id.toString(), obrasAcervo[i]));

  const emAndamento = pedidos.filter(p => p.state === ESTADO_PEDIDO.EM_TRANSITO).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Pedidos</h1>
        <p className="text-base-content/70">
          {emAndamento > 0
            ? `${emAndamento} pedido(s) aguardando entrega física.`
            : "Suas compras e vendas, com a custódia do pagamento."}
        </p>
      </div>

      <AvisoIdentidade acao="ver seus pedidos" />

      {ids.length === 0 ? (
        <p className="text-base-content/60">
          {isConnected ? "Nenhum pedido por aqui ainda." : "Conecte sua carteira para ver seus pedidos."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {[...ids]
            .map((orderId, i) => ({ orderId, pedido: pedidos[i] }))
            .reverse()
            .map(({ orderId, pedido }) => (
              <LinhaPedido
                key={orderId.toString()}
                orderId={orderId}
                pedido={pedido}
                obra={obrasPorId.get(pedido.tokenId.toString())}
                souComprador={pedido.buyer.toLowerCase() === address?.toLowerCase()}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default Pedidos;

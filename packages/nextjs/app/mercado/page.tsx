"use client";

import { CardOferta } from "./_components/CardOferta";
import type { NextPage } from "next";
import { AvisoIdentidade } from "~~/components/registro/AvisoIdentidade";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import type { Obra } from "~~/utils/registro";

type Anuncio = { seller: string; price: bigint; listedAt: bigint; active: boolean };

const Mercado: NextPage = () => {
  const { data: ofertas } = useScaffoldReadContract({
    contractName: "ArtMarketplace",
    functionName: "activeListings",
  });

  const { data: acervo } = useScaffoldReadContract({
    contractName: "ArtRegistry",
    functionName: "allWorks",
  });

  const ids = (ofertas?.[0] ?? []) as readonly bigint[];
  const anuncios = (ofertas?.[1] ?? []) as readonly Anuncio[];

  const obrasPorId = new Map<string, Obra>();
  const idsAcervo = (acervo?.[0] ?? []) as readonly bigint[];
  const obrasAcervo = (acervo?.[1] ?? []) as readonly Obra[];
  idsAcervo.forEach((id, i) => obrasPorId.set(id.toString(), obrasAcervo[i]));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Mercado</h1>
        <p className="text-base-content/70">
          Só entram aqui obras com titularidade reconhecida. O pagamento fica em custódia até a entrega física ser
          confirmada, e é no mesmo ato que a autora recebe o direito de sequência.
        </p>
      </div>

      <AvisoIdentidade acao="comprar uma obra" />

      {ids.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center gap-1">
            <p className="font-medium">Nenhuma obra à venda no momento.</p>
            <p className="text-sm text-base-content/60">
              Tokenize uma obra, espere o registro do agente e coloque-a à venda pelo seu acervo.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ids.map((tokenId, i) => {
            const obra = obrasPorId.get(tokenId.toString());
            if (!obra) return null;
            return (
              <CardOferta
                key={tokenId.toString()}
                tokenId={tokenId}
                obra={obra}
                vendedor={anuncios[i].seller}
                preco={anuncios[i].price}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Mercado;

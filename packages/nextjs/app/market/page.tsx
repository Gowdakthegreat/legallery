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
        <h1 className="text-3xl font-bold mb-1">Market</h1>
        <p className="text-base-content/70">
          Only works with recognised ownership appear here. Payment stays in escrow until physical delivery is
          confirmed, and it is in that same act that the author receives the resale royalty.
        </p>
      </div>

      <AvisoIdentidade acao="buy a work" />

      {ids.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center gap-1">
            <p className="font-medium">Nothing for sale right now.</p>
            <p className="text-sm text-base-content/60">
              Tokenise a work, wait for the agent to register it, and list it from your portfolio.
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

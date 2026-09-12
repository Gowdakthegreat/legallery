/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ContratoRicardiano } from "./_components/ContratoRicardiano";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { Jurisdicoes } from "~~/components/registro/Jurisdicoes";
import { LinhaDoTempo } from "~~/components/registro/LinhaDoTempo";
import { StatusObra } from "~~/components/registro/StatusObra";
import { useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { COBERTURA, type Jurisdicao, STATUS, dataHora, encurtarHash, eth } from "~~/utils/registro";

const Detalhe: NextPage = () => {
  const params = useParams<{ id: string }>();
  const tokenId = BigInt(params?.id ?? "0");
  const { targetNetwork } = useTargetNetwork();

  const { data: obra } = useScaffoldReadContract({
    contractName: "ArtRegistry",
    functionName: "workOf",
    args: [tokenId],
  });

  const { data: registro } = useScaffoldReadContract({
    contractName: "ArtRegistry",
    functionName: "legalRecordOf",
    args: [tokenId],
  });

  const { data: jurisdicoes } = useScaffoldReadContract({
    contractName: "ArtRegistry",
    functionName: "jurisdictionsOf",
    args: [tokenId],
  });

  const { data: titular } = useScaffoldReadContract({
    contractName: "ArtRegistry",
    functionName: "ownerOf",
    args: [tokenId],
  });

  const { data: nomeAutor } = useScaffoldReadContract({
    contractName: "GovBrIdentity",
    functionName: "civilNameOf",
    args: [obra?.creator],
  });

  const { data: ultimoPreco } = useScaffoldReadContract({
    contractName: "ArtMarketplace",
    functionName: "lastPaidPrice",
    args: [tokenId],
  });

  const { data: anuncio } = useScaffoldReadContract({
    contractName: "ArtMarketplace",
    functionName: "listingOf",
    args: [tokenId],
  });

  if (!obra) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
        <p className="text-base-content/60">Loading work #{params?.id}…</p>
      </div>
    );
  }

  const registrada = obra.status === STATUS.REGISTRADA;
  const lista = (jurisdicoes ?? []) as readonly Jurisdicao[];
  const pendencias = lista.filter(j => j.coverage !== COBERTURA.RECONHECIDA);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 flex flex-col gap-6">
      <Link href="/market" className="link text-sm w-fit">
        ← Back to market
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6 min-w-0">
          <div className="overflow-hidden rounded-lg border border-base-300 bg-base-200">
            <img src={obra.imageURI} alt={obra.title} className="w-full object-contain max-h-[32rem]" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold m-0">{obra.title}</h1>
              <StatusObra status={obra.status} />
            </div>
            <p className="text-base-content/70">
              {obra.technique || "Medium not given"} · {obra.year} · token #{tokenId.toString()}
            </p>
          </div>

          {registrada ? (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body gap-4">
                <h2 className="card-title text-lg m-0">Copyright registration</h2>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <dt className="text-base-content/60">Filing</dt>
                    <dd className="font-medium">{registro?.dossierNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-base-content/60">Authority</dt>
                    <dd className="font-medium">{registro?.authority}</dd>
                  </div>
                  <div>
                    <dt className="text-base-content/60">Completed on</dt>
                    <dd className="font-medium">{dataHora(registro?.registeredAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-base-content/60">Resale royalty</dt>
                    <dd className="font-medium">
                      {((registro?.resaleRoyaltyBps ?? 0) / 100).toFixed(2)}% of the appreciation
                    </dd>
                  </div>
                </dl>

                {registro?.opinionSummary && (
                  <blockquote className="border-l-4 border-primary/40 pl-3 text-sm italic text-base-content/80">
                    {registro.opinionSummary}
                  </blockquote>
                )}

                {registro?.ricardianURI && (
                  <ContratoRicardiano uri={registro.ricardianURI} hashNaChain={registro.ricardianHash} />
                )}
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body gap-4">
                <h2 className="card-title text-lg m-0">Registration progress</h2>
                <LinhaDoTempo status={obra.status} />
                {registro?.dossierNumber && (
                  <p className="text-sm text-base-content/70">
                    Filing {registro.dossierNumber} · {registro.authority}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3">
              <h2 className="card-title text-lg m-0">Enforceability by jurisdiction</h2>
              {registrada ? (
                <>
                  <Jurisdicoes jurisdicoes={lista} />
                  {pendencias.length > 0 && (
                    <p className="text-sm text-warning">
                      Note: the title is not yet enforceable in {pendencias.map(p => p.name).join(", ")}.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-base-content/60">
                  The per-country assessment is only issued once the registration concludes.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3 text-sm">
              <h2 className="card-title text-base m-0">Chain of title</h2>
              <div>
                <p className="text-base-content/60">Original author</p>
                <p className="font-medium">{nomeAutor || "Identity not given"}</p>
                <Address address={obra.creator} chain={targetNetwork} format="short" size="xs" />
              </div>
              <div>
                <p className="text-base-content/60">Current holder</p>
                {titular ? (
                  <Address address={titular} chain={targetNetwork} format="short" size="xs" />
                ) : (
                  <p className="text-base-content/50">—</p>
                )}
              </div>
              <div>
                <p className="text-base-content/60">Tokenised on</p>
                <p>{dataHora(obra.submittedAt)}</p>
              </div>
              <div>
                <p className="text-base-content/60">File fingerprint</p>
                <p className="font-mono text-xs break-all">{encurtarHash(obra.fileHash, 10)}</p>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body gap-2 text-sm">
              <h2 className="card-title text-base m-0">Market</h2>
              <p>
                Last sale: <strong>{(ultimoPreco ?? 0n) > 0n ? eth(ultimoPreco) : "never sold"}</strong>
              </p>
              {anuncio?.active ? (
                <>
                  <p>
                    Listed at <strong>{eth(anuncio.price)}</strong>
                  </p>
                  <Link href="/market" className="btn btn-sm btn-primary">
                    See it in the market
                  </Link>
                </>
              ) : (
                <p className="text-base-content/60">Not for sale.</p>
              )}
              {registrada && (
                <p className="text-xs text-base-content/60 mt-1">
                  On every resale, {((registro?.resaleRoyaltyBps ?? 0) / 100).toFixed(0)}% of the price increase goes
                  automatically to the author — a non-waivable, inalienable right (Brazilian Law 9.610/98, art. 38).
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Detalhe;

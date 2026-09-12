"use client";

import { useState } from "react";
import Link from "next/link";
import { CardMinhaObra } from "./_components/CardMinhaObra";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { AvisoIdentidade } from "~~/components/registro/AvisoIdentidade";
import { CardObra } from "~~/components/registro/CardObra";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { type Obra, STATUS } from "~~/utils/registro";

const Acervo: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [aba, setAba] = useState<"acervo" | "autoria">("acervo");

  const { data: minhas } = useScaffoldReadContract({
    contractName: "ArtRegistry",
    functionName: "worksByOwner",
    args: [address],
  });

  const { data: criadas } = useScaffoldReadContract({
    contractName: "ArtRegistry",
    functionName: "worksByCreator",
    args: [address],
  });

  const idsMinhas = (minhas?.[0] ?? []) as readonly bigint[];
  const obrasMinhas = (minhas?.[1] ?? []) as readonly Obra[];
  const idsCriadas = (criadas?.[0] ?? []) as readonly bigint[];
  const obrasCriadas = (criadas?.[1] ?? []) as readonly Obra[];

  const emProcesso = obrasCriadas.filter(o => o.status === STATUS.SUBMETIDA || o.status === STATUS.EM_ANALISE).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Meu acervo</h1>
          <p className="text-base-content/70">
            {emProcesso > 0
              ? `${emProcesso} obra(s) com processo de registro em andamento.`
              : "Obras que você detém e obras de sua autoria."}
          </p>
        </div>
        <Link href="/criar" className="btn btn-primary btn-sm">
          Tokenizar nova obra
        </Link>
      </div>

      <AvisoIdentidade acao="ver seu acervo" />

      <div role="tablist" className="tabs tabs-border">
        <button role="tab" className={`tab ${aba === "acervo" ? "tab-active" : ""}`} onClick={() => setAba("acervo")}>
          Obras que detenho ({idsMinhas.length})
        </button>
        <button role="tab" className={`tab ${aba === "autoria" ? "tab-active" : ""}`} onClick={() => setAba("autoria")}>
          Obras de minha autoria ({idsCriadas.length})
        </button>
      </div>

      {aba === "acervo" ? (
        idsMinhas.length === 0 ? (
          <p className="text-base-content/60">
            {isConnected ? "Você ainda não detém nenhuma obra." : "Conecte sua carteira para ver seu acervo."}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {idsMinhas.map((tokenId, i) => (
              <CardMinhaObra key={tokenId.toString()} tokenId={tokenId} obra={obrasMinhas[i]} />
            ))}
          </div>
        )
      ) : idsCriadas.length === 0 ? (
        <p className="text-base-content/60">Você ainda não tokenizou nenhuma obra.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {idsCriadas.map((tokenId, i) => (
            <CardObra
              key={tokenId.toString()}
              tokenId={tokenId}
              obra={obrasCriadas[i]}
              rodape={
                obrasCriadas[i].status === STATUS.REGISTRADA ? (
                  <p className="text-xs text-base-content/60 mt-1">
                    Você recebe 5% sobre a valorização em toda revenda desta obra, para sempre.
                  </p>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Acervo;

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { StatusObra } from "./StatusObra";
import type { Obra } from "~~/utils/registro";

export const CardObra = ({ tokenId, obra, rodape }: { tokenId: bigint; obra: Obra; rodape?: React.ReactNode }) => (
  <div className="card bg-base-100 border border-base-300 overflow-hidden">
    <Link href={`/obra/${tokenId}`} className="block aspect-4/3 bg-base-200 overflow-hidden">
      <img
        src={obra.imageURI}
        alt={obra.title}
        className="h-full w-full object-cover transition-transform hover:scale-105"
      />
    </Link>
    <div className="card-body gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/obra/${tokenId}`} className="font-semibold leading-tight hover:underline">
          {obra.title}
        </Link>
        <span className="text-xs text-base-content/50 shrink-0">#{tokenId.toString()}</span>
      </div>
      <p className="text-sm text-base-content/70 leading-tight">
        {obra.technique}
        {obra.year ? ` · ${obra.year}` : ""}
      </p>
      <StatusObra status={obra.status} tamanho="sm" />
      {rodape}
    </div>
  </div>
);

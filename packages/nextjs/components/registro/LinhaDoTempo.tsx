import { STATUS } from "~~/utils/registro";

type Etapa = { titulo: string; detalhe: string };

const ETAPAS: Etapa[] = [
  { titulo: "Work tokenised", detalhe: "Authorship declared and timestamped by the chain" },
  { titulo: "Filing opened", detalhe: "The agent filed the copyright registration with the competent body" },
  { titulo: "Ownership recognised", detalhe: "Ricardian contract issued and recorded on chain" },
];

/** Mostra em que ponto do processo de registro a obra está. */
export const LinhaDoTempo = ({ status }: { status: number }) => {
  const concluidas = status === STATUS.REGISTRADA ? 3 : status === STATUS.EM_ANALISE ? 2 : 1;
  const rejeitada = status === STATUS.REJEITADA;

  return (
    <ol className="flex flex-col gap-4">
      {ETAPAS.map((etapa, indice) => {
        const passo = indice + 1;
        const feita = passo <= concluidas && !rejeitada;
        const atual = passo === concluidas + 1 && !rejeitada;

        return (
          <li key={etapa.titulo} className="flex gap-3 items-start">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                feita
                  ? "border-success bg-success text-success-content"
                  : atual
                    ? "border-info text-info animate-pulse"
                    : "border-base-300 text-base-content/40"
              }`}
            >
              {feita ? "✓" : passo}
            </span>
            <div className={feita || atual ? "" : "opacity-50"}>
              <p className="font-medium leading-tight">{etapa.titulo}</p>
              <p className="text-sm text-base-content/70 leading-tight">{etapa.detalhe}</p>
              {atual && (
                <div className="mt-1 flex flex-col gap-1">
                  <progress className="progress progress-info w-48 h-1" />
                  <p className="text-xs text-info">In progress — the agent is working on it.</p>
                </div>
              )}
            </div>
          </li>
        );
      })}
      {rejeitada && <li className="text-error font-medium">Filing denied.</li>}
    </ol>
  );
};

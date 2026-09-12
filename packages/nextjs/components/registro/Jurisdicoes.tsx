import { COBERTURA_INFO, type Jurisdicao } from "~~/utils/registro";

/**
 * Onde a titularidade é oponível. A leitura importante da demo é justamente a linha que
 * NÃO está coberta: o registro brasileiro não produz efeito automático em toda parte.
 */
export const Jurisdicoes = ({ jurisdicoes }: { jurisdicoes: readonly Jurisdicao[] }) => {
  if (!jurisdicoes?.length) {
    return <p className="text-sm text-base-content/60">Nenhuma jurisdição avaliada ainda.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>País</th>
            <th>Situação</th>
            <th>Fundamento</th>
          </tr>
        </thead>
        <tbody>
          {jurisdicoes.map(j => {
            const info = COBERTURA_INFO[j.coverage];
            return (
              <tr key={j.code}>
                <td className="font-medium whitespace-nowrap">
                  {j.name} <span className="text-base-content/50">({j.code})</span>
                </td>
                <td className={`whitespace-nowrap ${info?.classe ?? ""}`}>
                  {info?.icone} {info?.rotulo ?? "—"}
                </td>
                <td className="text-sm text-base-content/70">{j.basis}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

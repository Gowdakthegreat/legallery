import { STATUS_INFO } from "~~/utils/registro";

export const StatusObra = ({ status, tamanho = "md" }: { status: number; tamanho?: "sm" | "md" | "lg" }) => {
  const info = STATUS_INFO[status];
  if (!info) return null;

  return (
    <span className={`badge ${info.classe} badge-${tamanho} whitespace-nowrap font-medium`} title={info.descricao}>
      {info.rotulo}
    </span>
  );
};

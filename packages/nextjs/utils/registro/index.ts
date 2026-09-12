import { formatEther } from "viem";

/** Espelha o enum Status do ArtRegistry. */
export const STATUS = {
  NONE: 0,
  SUBMETIDA: 1,
  EM_ANALISE: 2,
  REGISTRADA: 3,
  REJEITADA: 4,
} as const;

export type StatusObra = (typeof STATUS)[keyof typeof STATUS];

export const STATUS_INFO: Record<number, { rotulo: string; descricao: string; classe: string }> = {
  [STATUS.SUBMETIDA]: {
    rotulo: "Titularidade não verificada",
    descricao: "A obra está na chain com data e hora, mas a autoria ainda não passou pelo registro legal.",
    classe: "badge-warning",
  },
  [STATUS.EM_ANALISE]: {
    rotulo: "Em análise",
    descricao: "O agente protocolou o processo de registro autoral e aguarda a conclusão.",
    classe: "badge-info",
  },
  [STATUS.REGISTRADA]: {
    rotulo: "Titularidade reconhecida",
    descricao: "Processo concluído. A obra tem contrato ricardiano e pode ser negociada.",
    classe: "badge-success",
  },
  [STATUS.REJEITADA]: {
    rotulo: "Registro indeferido",
    descricao: "O processo foi rejeitado. A obra não pode circular.",
    classe: "badge-error",
  },
};

/** Espelha o enum Coverage do ArtRegistry. */
export const COBERTURA = {
  PENDENTE: 0,
  RECONHECIDA: 1,
  NAO_COBERTA: 2,
} as const;

export const COBERTURA_INFO: Record<number, { rotulo: string; icone: string; classe: string }> = {
  [COBERTURA.RECONHECIDA]: { rotulo: "Reconhecida", icone: "✅", classe: "text-success" },
  [COBERTURA.PENDENTE]: { rotulo: "Pendente", icone: "🕓", classe: "text-warning" },
  [COBERTURA.NAO_COBERTA]: { rotulo: "Não coberta", icone: "⚠️", classe: "text-error" },
};

export const ESTADO_PEDIDO = {
  NONE: 0,
  EM_TRANSITO: 1,
  CONCLUIDA: 2,
  CANCELADA: 3,
} as const;

export const ESTADO_PEDIDO_INFO: Record<number, { rotulo: string; classe: string }> = {
  [ESTADO_PEDIDO.EM_TRANSITO]: { rotulo: "Aguardando entrega", classe: "badge-warning" },
  [ESTADO_PEDIDO.CONCLUIDA]: { rotulo: "Concluída", classe: "badge-success" },
  [ESTADO_PEDIDO.CANCELADA]: { rotulo: "Cancelada", classe: "badge-ghost" },
};

export type Obra = {
  creator: string;
  status: number;
  year: number;
  submittedAt: bigint;
  title: string;
  technique: string;
  imageURI: string;
  metadataURI: string;
  fileHash: string;
};

export type RegistroLegal = {
  dossierNumber: string;
  authority: string;
  opinionSummary: string;
  ricardianURI: string;
  ricardianHash: string;
  registeredAt: bigint;
  resaleRoyaltyBps: number;
};

export type Jurisdicao = {
  code: string;
  name: string;
  coverage: number;
  basis: string;
};

/** Direito de sequência: 5% sobre a mais-valia, nunca sobre o preço cheio (Lei 9.610/98, art. 38). */
export function calcularDireitoDeSequencia(precoAnterior: bigint, precoNovo: bigint, bps: number, revenda: boolean) {
  if (!revenda || precoNovo <= precoAnterior) {
    return { maisValia: 0n, devido: 0n };
  }
  const maisValia = precoNovo - precoAnterior;
  return { maisValia, devido: (maisValia * BigInt(bps)) / 10_000n };
}

export function eth(valor: bigint | undefined, casas = 4): string {
  if (valor === undefined) return "—";
  const numero = Number(formatEther(valor));
  return `${numero.toLocaleString("pt-BR", { maximumFractionDigits: casas })} ETH`;
}

export function dataHora(timestamp: bigint | number | undefined): string {
  const segundos = Number(timestamp ?? 0);
  if (!segundos) return "—";
  return new Date(segundos * 1000).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function encurtarHash(hash: string | undefined, tamanho = 6): string {
  if (!hash) return "—";
  return `${hash.slice(0, 2 + tamanho)}…${hash.slice(-tamanho)}`;
}

export function formatarCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

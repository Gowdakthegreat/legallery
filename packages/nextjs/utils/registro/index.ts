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
    rotulo: "Ownership unverified",
    descricao: "The work is timestamped on chain, but authorship has not been through legal registration yet.",
    classe: "badge-warning",
  },
  [STATUS.EM_ANALISE]: {
    rotulo: "Under review",
    descricao: "The agent filed the copyright registration and is waiting for it to conclude.",
    classe: "badge-info",
  },
  [STATUS.REGISTRADA]: {
    rotulo: "Ownership recognised",
    descricao: "Registration complete. The work has a Ricardian contract and can be traded.",
    classe: "badge-success",
  },
  [STATUS.REJEITADA]: {
    rotulo: "Registration denied",
    descricao: "The filing was rejected. The work cannot circulate.",
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
  [COBERTURA.RECONHECIDA]: { rotulo: "Recognised", icone: "✅", classe: "text-success" },
  [COBERTURA.PENDENTE]: { rotulo: "Pending", icone: "🕓", classe: "text-warning" },
  [COBERTURA.NAO_COBERTA]: { rotulo: "Not covered", icone: "⚠️", classe: "text-error" },
};

export const ESTADO_PEDIDO = {
  NONE: 0,
  EM_TRANSITO: 1,
  CONCLUIDA: 2,
  CANCELADA: 3,
} as const;

export const ESTADO_PEDIDO_INFO: Record<number, { rotulo: string; classe: string }> = {
  [ESTADO_PEDIDO.EM_TRANSITO]: { rotulo: "Awaiting delivery", classe: "badge-warning" },
  [ESTADO_PEDIDO.CONCLUIDA]: { rotulo: "Completed", classe: "badge-success" },
  [ESTADO_PEDIDO.CANCELADA]: { rotulo: "Cancelled", classe: "badge-ghost" },
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
  return `${numero.toLocaleString("en-US", { maximumFractionDigits: casas })} ETH`;
}

export function dataHora(timestamp: bigint | number | undefined): string {
  const segundos = Number(timestamp ?? 0);
  if (!segundos) return "—";
  return new Date(segundos * 1000).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
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

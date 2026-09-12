/**
 * Ritmo da instrução do processo.
 *
 * O trabalho real do agente (duas transações e uma chamada ao modelo) leva de poucos segundos,
 * na chain local, a meio minuto numa rede pública. Para a demonstração interessa que o processo
 * tenha duração visível e etapas legíveis, então cada etapa só é anunciada quando a fração
 * correspondente do orçamento de tempo já passou.
 *
 * A espera é sempre pelo tempo que FALTA: se as transações já consumiram o orçamento — o caso
 * normal em rede pública — nada é acrescentado artificialmente.
 */

export const DURACAO_ALVO_MS = Number(process.env.AGENT_DURACAO_MS ?? 30_000);

export type Etapa = { fracao: number; texto: string };

export const ETAPAS = {
  identidade: { fracao: 0.12, texto: "Conferindo a identidade civil do autor junto ao gov.br" },
  anterioridade: { fracao: 0.28, texto: "Pesquisando anterioridade entre as obras já registradas" },
  parecer: { fracao: 0.42, texto: "Analisando a obra e fundamentando o parecer" },
  contrato: { fracao: 0.68, texto: "Redigindo as cláusulas do contrato ricardiano" },
  jurisdicoes: { fracao: 0.84, texto: "Avaliando a eficácia da titularidade por jurisdição" },
  averbacao: { fracao: 1, texto: "Averbando o registro na cadeia de titularidade" },
} as const satisfies Record<string, Etapa>;

const dormir = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class Cronometro {
  private readonly inicio = Date.now();

  constructor(private readonly duracaoMs = DURACAO_ALVO_MS) {}

  get decorrido() {
    return Date.now() - this.inicio;
  }

  /** Espera até a fração do orçamento e anuncia a etapa. */
  async etapa(etapa: Etapa) {
    const restante = Math.round(etapa.fracao * this.duracaoMs) - this.decorrido;
    if (restante > 0) await dormir(restante);
    console.log(`   ⏳ [${(this.decorrido / 1000).toFixed(1)}s] ${etapa.texto}…`);
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

/** Situação da titularidade em cada país - espelha o enum Coverage do contrato. */
export const COBERTURA = { PENDENTE: 0, RECONHECIDA: 1, NAO_COBERTA: 2 } as const;

const JurisdicaoSchema = z.object({
  codigo: z.string().describe("Código ISO 3166-1 alfa-2, em maiúsculas. Ex.: BR"),
  nome: z.string().describe("Nome do país em português"),
  cobertura: z
    .enum(["RECONHECIDA", "PENDENTE", "NAO_COBERTA"])
    .describe("RECONHECIDA quando a titularidade já é oponível a terceiros no país"),
  fundamento: z.string().describe("Base legal da cobertura, ou a providência que ainda falta. Até 140 caracteres."),
});

const ClausulaSchema = z.object({
  titulo: z.string().describe("Título da cláusula, ex.: 'Cláusula 3ª - Direito de sequência'"),
  texto: z.string().describe("Texto da cláusula em linguagem jurídica corrente"),
});

export const ParecerSchema = z.object({
  resumo: z
    .string()
    .describe("Uma frase, no máximo 180 caracteres, resumindo a decisão. Vai gravada na blockchain."),
  parecer: z.string().describe("Parecer fundamentado, de 2 a 4 parágrafos, em português jurídico."),
  fundamentosLegais: z.array(z.string()).describe("Dispositivos aplicados, ex.: 'Lei 9.610/98, art. 18'"),
  jurisdicoes: z.array(JurisdicaoSchema).describe("Países avaliados, começando pelo Brasil"),
  preambuloContrato: z.string().describe("Parágrafo de abertura do contrato ricardiano"),
  clausulas: z.array(ClausulaSchema).describe("Cláusulas do contrato ricardiano, de 4 a 7"),
});

export type Parecer = z.infer<typeof ParecerSchema>;

export type DadosDaObra = {
  tokenId: bigint;
  titulo: string;
  tecnica: string;
  ano: number;
  autor: string;
  carteiraAutor: string;
  hashArquivo: string;
  numeroProcesso: string;
  orgao: string;
  royaltyBps: number;
};

const SYSTEM = `Você é um agente autônomo que instrui processos de registro de direito autoral no Brasil,
acoplado a um registro de obras em blockchain.

Contexto jurídico que você deve aplicar:
- A proteção autoral no Brasil nasce com a criação da obra (Lei 9.610/98, art. 18). O registro é
  facultativo e serve como prova de anterioridade, não como condição da proteção.
- Obras de artes visuais (pintura, desenho, gravura, escultura, fotografia) são registradas na
  Escola de Belas Artes da UFRJ; a Fundação Biblioteca Nacional cuida das obras literárias.
- Direito de sequência (art. 38): o autor tem direito irrenunciável e inalienável de receber no
  mínimo 5% sobre o AUMENTO do preço verificado em cada revenda da obra original que alienou.
  Não incide sobre o preço cheio, e não incide se não houve valorização.
- Prazo de proteção patrimonial: vida do autor mais 70 anos contados de 1º de janeiro do ano
  seguinte ao falecimento (art. 41).
- No exterior, a proteção decorre da Convenção de Berna, de que o Brasil é signatário: os países
  membros reconhecem a obra independentemente de registro local. Marque como RECONHECIDA a
  cobertura em países de Berna cujo ordenamento dispensa formalidade.
- A China, embora signatária de Berna, na prática condiciona a tutela administrativa e boa parte
  da execução judicial ao registro voluntário no Copyright Protection Centre of China (CPCC), que
  não foi providenciado neste processo. Marque a China como NAO_COBERTA e diga qual é a pendência.

Avalie sempre estas jurisdições, nesta ordem: Brasil (BR), Portugal (PT), Estados Unidos (US) e
China (CN).

IMPORTANTE: este é um ambiente de demonstração. O processo é sempre deferido - escreva o parecer
como deferimento fundamentado. Não invente números de processo: use exatamente o número informado.
Escreva tudo em português do Brasil.`;

/** Fallback determinístico: mantém a demo de pé quando não há chave da Anthropic. */
function parecerOffline(dados: DadosDaObra): Parecer {
  return {
    resumo: `Registro deferido: autoria de ${dados.autor} comprovada nos termos da Lei 9.610/98.`,
    parecer: `Trata-se de pedido de registro da obra "${dados.titulo}" (${dados.tecnica}, ${dados.ano}), de autoria de ${dados.autor}, protocolado sob o nº ${dados.numeroProcesso} perante a ${dados.orgao}.

A proteção autoral independe de registro, nascendo com a própria criação da obra (Lei 9.610/98, art. 18). O registro ora requerido presta-se à prova de anterioridade e à publicidade da titularidade, tendo sido instruído com a impressão digital criptográfica do arquivo original (${dados.hashArquivo}) e com a identidade civil do autor validada junto ao provedor gov.br.

Não se identificou anterioridade conflitante nem impugnação de terceiros. Ficam assegurados ao autor os direitos morais, de caráter inalienável e irrenunciável (art. 24), e os direitos patrimoniais pelo prazo do art. 41, bem como o direito de sequência do art. 38, aqui fixado em ${(dados.royaltyBps / 100).toFixed(2)}% sobre o aumento de preço apurado em cada revenda.

Pelo exposto, DEFIRO o registro e determino a averbação do presente na cadeia de titularidade da obra.`,
    fundamentosLegais: [
      "Lei 9.610/98, art. 18 - proteção independe de registro",
      "Lei 9.610/98, art. 19 e 20 - faculdade do registro",
      "Lei 9.610/98, art. 24 - direitos morais do autor",
      "Lei 9.610/98, art. 38 - direito de sequência sobre a mais-valia",
      "Lei 9.610/98, art. 41 - prazo de proteção patrimonial",
      "Convenção de Berna, art. 5º(2) - ausência de formalidade entre signatários",
    ],
    jurisdicoes: [
      {
        codigo: "BR",
        nome: "Brasil",
        cobertura: "RECONHECIDA",
        fundamento: `Lei 9.610/98; registro nº ${dados.numeroProcesso} na ${dados.orgao}`,
      },
      {
        codigo: "PT",
        nome: "Portugal",
        cobertura: "RECONHECIDA",
        fundamento: "Convenção de Berna, art. 5º(2) - proteção automática, sem formalidade",
      },
      {
        codigo: "US",
        nome: "Estados Unidos",
        cobertura: "RECONHECIDA",
        fundamento: "Convenção de Berna; registro no US Copyright Office exigido só para ação judicial",
      },
      {
        codigo: "CN",
        nome: "China",
        cobertura: "NAO_COBERTA",
        fundamento: "Pendente registro voluntário no CPCC, exigido na prática para tutela administrativa",
      },
    ],
    preambuloContrato: `Pelo presente instrumento, ${dados.autor}, autor da obra "${dados.titulo}", e os sucessivos titulares do token nº ${dados.tokenId} do registro de obras, ajustam as condições de titularidade, circulação e remuneração adiante descritas, cujo cumprimento é assegurado pelo código do contrato inteligente referido neste documento.`,
    clausulas: [
      {
        titulo: "Cláusula 1ª - Objeto",
        texto: `O objeto deste instrumento é a obra "${dados.titulo}" (${dados.tecnica}, ${dados.ano}), identificada pela impressão digital ${dados.hashArquivo}, cuja titularidade é representada pelo token nº ${dados.tokenId}.`,
      },
      {
        titulo: "Cláusula 2ª - Autoria e direitos morais",
        texto: `A autoria é atribuída em caráter definitivo a ${dados.autor}. Os direitos morais são inalienáveis e irrenunciáveis (Lei 9.610/98, art. 24) e não se transferem com a alienação do suporte físico nem com a transferência do token.`,
      },
      {
        titulo: "Cláusula 3ª - Direito de sequência",
        texto: `Em cada revenda, o autor ou seus sucessores receberão ${(dados.royaltyBps / 100).toFixed(2)}% sobre o aumento de preço verificado em relação à aquisição anterior, nos termos do art. 38 da Lei 9.610/98. Não havendo valorização, nada será devido. O percentual é retido e pago automaticamente pelo contrato inteligente no ato da liquidação.`,
      },
      {
        titulo: "Cláusula 4ª - Transferência de titularidade",
        texto: "A titularidade só se transfere após confirmação, pelo comprador, do recebimento do suporte físico da obra. Até então o preço permanece em custódia no contrato inteligente.",
      },
      {
        titulo: "Cláusula 5ª - Eficácia territorial",
        texto: "A titularidade é oponível nas jurisdições listadas como reconhecidas no registro desta obra. Nas demais, a eficácia fica condicionada ao cumprimento das formalidades locais indicadas.",
      },
      {
        titulo: "Cláusula 6ª - Prevalência",
        texto: "Havendo divergência entre este texto e o comportamento do contrato inteligente, prevalece este texto quanto à interpretação jurídica, e o código quanto à execução das operações registradas na rede.",
      },
    ],
  };
}

/**
 * Emite o parecer e redige o contrato ricardiano.
 *
 * Qualquer falha de rede, chave ou schema cai no parecer offline: a demo nunca trava por causa
 * do modelo, e o texto usado fica marcado na saída.
 */
export async function emitirParecer(dados: DadosDaObra): Promise<{ parecer: Parecer; origem: "claude" | "offline" }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("   ⚠️  ANTHROPIC_API_KEY não configurada - usando parecer offline.");
    return { parecer: parecerOffline(dados), origem: "offline" };
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      system: SYSTEM,
      thinking: { type: "adaptive" },
      output_config: { format: zodOutputFormat(ParecerSchema) },
      messages: [
        {
          role: "user",
          content: `Instrua e decida o processo de registro autoral abaixo.

Processo nº: ${dados.numeroProcesso}
Órgão: ${dados.orgao}
Obra: "${dados.titulo}"
Técnica/suporte: ${dados.tecnica}
Ano de criação: ${dados.ano}
Autor (identidade civil validada no gov.br): ${dados.autor}
Carteira do autor: ${dados.carteiraAutor}
Impressão digital do arquivo original: ${dados.hashArquivo}
Token de registro: nº ${dados.tokenId}
Direito de sequência a fixar: ${(dados.royaltyBps / 100).toFixed(2)}% sobre a mais-valia

Produza o parecer de deferimento, os fundamentos legais, a avaliação de cobertura por jurisdição e
as cláusulas do contrato ricardiano que passará a reger a obra.`,
        },
      ],
    });

    if (!response.parsed_output) {
      throw new Error("resposta sem saída estruturada");
    }

    return { parecer: response.parsed_output, origem: "claude" };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Falha ao consultar o Claude (${detail}) - usando parecer offline.`);
    return { parecer: parecerOffline(dados), origem: "offline" };
  }
}

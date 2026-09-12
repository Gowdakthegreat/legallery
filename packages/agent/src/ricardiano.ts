import fs from "node:fs";
import path from "node:path";
import { keccak256, stringToHex, type Hex } from "viem";
import { nextjsPublicDir } from "./chain.js";
import type { DadosDaObra, Parecer } from "./parecer.js";

const COBERTURA_LABEL: Record<string, string> = {
  RECONHECIDA: "✅ Reconhecida",
  PENDENTE: "🕓 Pendente",
  NAO_COBERTA: "⚠️ Não coberta",
};

/**
 * Monta o contrato ricardiano: um único documento que é ao mesmo tempo legível por humanos
 * (as cláusulas) e por máquina (o bloco de parâmetros). O hash desse arquivo vai para a chain,
 * então qualquer alteração posterior no texto é detectável.
 */
export function montarContratoRicardiano(
  dados: DadosDaObra,
  parecer: Parecer,
  contexto: { registro: string; chainId: number; origem: "claude" | "offline"; emitidoEm: Date },
): string {
  const parametros = {
    tokenId: Number(dados.tokenId),
    registro: contexto.registro,
    chainId: contexto.chainId,
    autor: dados.autor,
    carteiraAutor: dados.carteiraAutor,
    obra: dados.titulo,
    tecnica: dados.tecnica,
    ano: dados.ano,
    hashArquivo: dados.hashArquivo,
    processo: dados.numeroProcesso,
    orgao: dados.orgao,
    direitoDeSequenciaBps: dados.royaltyBps,
    baseDeCalculo: "aumento de preço em relação à aquisição anterior (Lei 9.610/98, art. 38)",
    jurisdicoes: parecer.jurisdicoes.map(j => ({ codigo: j.codigo, cobertura: j.cobertura })),
  };

  const clausulas = parecer.clausulas.map(c => `### ${c.titulo}\n\n${c.texto}`).join("\n\n");

  const tabelaJurisdicoes = [
    "| País | Situação | Fundamento |",
    "| --- | --- | --- |",
    ...parecer.jurisdicoes.map(
      j => `| ${j.nome} (${j.codigo}) | ${COBERTURA_LABEL[j.cobertura] ?? j.cobertura} | ${j.fundamento} |`,
    ),
  ].join("\n");

  const fundamentos = parecer.fundamentosLegais.map(f => `- ${f}`).join("\n");

  return `# Contrato Ricardiano - "${dados.titulo}"

> Documento de dupla natureza: as cláusulas abaixo valem entre as partes, e o bloco de parâmetros
> é o que o contrato inteligente executa. O hash deste arquivo está gravado na blockchain.

## Parâmetros de máquina

\`\`\`json
${JSON.stringify(parametros, null, 2)}
\`\`\`

## Preâmbulo

${parecer.preambuloContrato}

## Cláusulas

${clausulas}

## Parecer do processo nº ${dados.numeroProcesso}

${parecer.parecer}

### Fundamentos legais aplicados

${fundamentos}

## Eficácia por jurisdição

${tabelaJurisdicoes}

---

Emitido em ${contexto.emitidoEm.toLocaleString("pt-BR")} pelo agente autônomo de registro autoral.
Parecer redigido ${contexto.origem === "claude" ? "por Claude (claude-opus-5)" : "em modo offline (template determinístico)"}.
Ambiente de demonstração: o processo administrativo é simulado.
`;
}

export function gravarContrato(tokenId: bigint, conteudo: string): { uri: string; hash: Hex } {
  const dir = path.join(nextjsPublicDir, "registros");
  fs.mkdirSync(dir, { recursive: true });

  const file = path.join(dir, `${tokenId}.md`);
  fs.writeFileSync(file, conteudo, "utf8");

  return { uri: `/registros/${tokenId}.md`, hash: keccak256(stringToHex(conteudo)) };
}

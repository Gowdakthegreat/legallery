"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { keccak256, stringToHex } from "viem";
import { encurtarHash } from "~~/utils/registro";

type Integridade = "checando" | "integro" | "divergente" | "indisponivel";

/**
 * Carrega o contrato ricardiano e confere o texto contra o hash gravado na chain.
 * É essa conferência que dá sentido ao documento: qualquer edição posterior é detectada.
 */
export const ContratoRicardiano = ({ uri, hashNaChain }: { uri: string; hashNaChain: string }) => {
  const [texto, setTexto] = useState("");
  const [integridade, setIntegridade] = useState<Integridade>("checando");

  useEffect(() => {
    let cancelado = false;

    const carregar = async () => {
      try {
        const resposta = await fetch(uri);
        if (!resposta.ok) throw new Error("não encontrado");
        const conteudo = await resposta.text();
        if (cancelado) return;

        setTexto(conteudo);
        setIntegridade(keccak256(stringToHex(conteudo)) === hashNaChain ? "integro" : "divergente");
      } catch {
        if (!cancelado) setIntegridade("indisponivel");
      }
    };

    carregar();
    return () => {
      cancelado = true;
    };
  }, [uri, hashNaChain]);

  const selo = {
    checando: { texto: "Conferindo o texto…", classe: "text-base-content/60" },
    integro: { texto: "✅ Texto íntegro: confere com o hash gravado na chain", classe: "text-success" },
    divergente: { texto: "⚠️ O texto não confere com o hash registrado na chain", classe: "text-error" },
    indisponivel: { texto: "Documento indisponível neste ambiente", classe: "text-warning" },
  }[integridade];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`text-sm ${selo.classe}`}>{selo.texto}</p>
        <p className="text-xs font-mono text-base-content/50">hash {encurtarHash(hashNaChain, 8)}</p>
      </div>

      {texto && (
        <details className="collapse collapse-arrow border border-base-300 bg-base-200">
          <summary className="collapse-title font-medium">Ler o contrato na íntegra</summary>
          <div className="collapse-content">
            <div className="prose prose-sm max-w-none prose-headings:mt-4 prose-table:text-sm prose-pre:bg-base-300 prose-pre:text-base-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{texto}</ReactMarkdown>
            </div>
            <a href={uri} target="_blank" rel="noreferrer" className="link text-sm">
              Abrir o arquivo original
            </a>
          </div>
        </details>
      )}
    </div>
  );
};

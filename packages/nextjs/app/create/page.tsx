/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { AvisoIdentidade } from "~~/components/registro/AvisoIdentidade";
import { useIdentidade } from "~~/hooks/registro/useIdentidade";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { encurtarHash } from "~~/utils/registro";
import { notification } from "~~/utils/scaffold-eth";

const Criar: NextPage = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { verificada, nome } = useIdentidade();

  const [titulo, setTitulo] = useState("");
  const [tecnica, setTecnica] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string>("");
  const [enviando, setEnviando] = useState(false);

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "ArtRegistry" });

  const escolherArquivo = (file: File | null) => {
    setArquivo(file);
    setPrevia(file ? URL.createObjectURL(file) : "");
  };

  const tokenizar = async () => {
    if (!arquivo) return;
    setEnviando(true);

    try {
      // A imagem é guardada fora da chain; o que entra na chain é a impressão digital dela.
      const formData = new FormData();
      formData.append("arquivo", arquivo);

      const resposta = await fetch("/api/upload", { method: "POST", body: formData });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro ?? "Failed to upload the image.");

      await writeContractAsync({
        functionName: "submitWork",
        args: [titulo.trim(), tecnica.trim(), ano, dados.url, "", dados.hash],
      });

      notification.success("Work tokenised. The agent has been triggered.");
      router.push("/portfolio");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Could not tokenise the work.");
    } finally {
      setEnviando(false);
    }
  };

  const podeEnviar = isConnected && verificada && titulo.trim().length >= 2 && Boolean(arquivo) && !enviando;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Tokenise a work</h1>
        <p className="text-base-content/70">
          The work goes on chain right away, but with ownership <strong>unverified</strong>. It is the registration the
          agent files next that turns this claim into recognised title.
        </p>
      </div>

      <AvisoIdentidade acao="tokenise a work" />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-4">
            {verificada && (
              <p className="text-sm text-base-content/70">
                Authorship will be attributed to <strong>{nome}</strong>, per your civil identity.
              </p>
            )}

            <label className="form-control">
              <span className="label-text mb-1">Title</span>
              <input
                className="input input-bordered w-full"
                placeholder="e.g. Retirantes do Cerrado"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <label className="form-control">
                <span className="label-text mb-1">Medium and dimensions</span>
                <input
                  className="input input-bordered w-full"
                  placeholder="e.g. Oil on canvas, 90 x 120 cm"
                  value={tecnica}
                  onChange={e => setTecnica(e.target.value)}
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-1">Year</span>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={ano}
                  min={1000}
                  max={new Date().getFullYear()}
                  onChange={e => setAno(Number(e.target.value))}
                />
              </label>
            </div>

            <label className="form-control">
              <span className="label-text mb-1">Photo of the work</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="file-input file-input-bordered w-full"
                onChange={e => escolherArquivo(e.target.files?.[0] ?? null)}
              />
              <span className="label-text-alt mt-1 text-base-content/60">
                JPG, PNG, WEBP or SVG, up to 8 MB. The file hash goes on chain.
              </span>
            </label>

            <button className="btn btn-primary" disabled={!podeEnviar} onClick={tokenizar}>
              {enviando ? <span className="loading loading-spinner loading-sm" /> : null}
              Tokenise and open the filing
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card bg-base-200 border border-base-300 overflow-hidden">
            <div className="aspect-4/3 bg-base-300 flex items-center justify-center">
              {previa ? (
                <img src={previa} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-base-content/50">Preview</span>
              )}
            </div>
            <div className="card-body p-4 gap-1">
              <p className="font-semibold leading-tight">{titulo || "Untitled"}</p>
              <p className="text-sm text-base-content/70 leading-tight">
                {tecnica || "Medium not given"} · {ano}
              </p>
              {arquivo && (
                <p className="text-xs text-base-content/50 mt-1">
                  {arquivo.name} · {(arquivo.size / 1024).toFixed(0)} KB
                </p>
              )}
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4 gap-2 text-sm">
              <p className="font-medium">What happens next</p>
              <ol className="list-decimal list-inside text-base-content/70 flex flex-col gap-1">
                <li>The work is recorded with ownership unverified.</li>
                <li>The event triggers the agent, which files the copyright registration.</li>
                <li>Once filed, the Ricardian contract is recorded and the work can be sold.</li>
              </ol>
              <p className="text-xs text-base-content/50 mt-1">
                File fingerprint: {arquivo ? "computed on upload" : encurtarHash(undefined)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criar;

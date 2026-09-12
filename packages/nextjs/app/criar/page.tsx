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
      if (!resposta.ok) throw new Error(dados.erro ?? "Falha ao enviar a imagem.");

      await writeContractAsync({
        functionName: "submitWork",
        args: [titulo.trim(), tecnica.trim(), ano, dados.url, "", dados.hash],
      });

      notification.success("Obra tokenizada. O agente já foi acionado.");
      router.push("/acervo");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Não foi possível tokenizar a obra.");
    } finally {
      setEnviando(false);
    }
  };

  const podeEnviar = isConnected && verificada && titulo.trim().length >= 2 && Boolean(arquivo) && !enviando;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Tokenizar uma obra</h1>
        <p className="text-base-content/70">
          A obra entra na chain imediatamente, mas com a titularidade <strong>não verificada</strong>. É o registro
          feito em seguida pelo agente que transforma essa declaração em titularidade reconhecida.
        </p>
      </div>

      <AvisoIdentidade acao="tokenizar uma obra" />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-4">
            {verificada && (
              <p className="text-sm text-base-content/70">
                Autoria será atribuída a <strong>{nome}</strong>, conforme sua identidade civil.
              </p>
            )}

            <label className="form-control">
              <span className="label-text mb-1">Título da obra</span>
              <input
                className="input input-bordered w-full"
                placeholder="Ex.: Retirantes do Cerrado"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <label className="form-control">
                <span className="label-text mb-1">Técnica e dimensões</span>
                <input
                  className="input input-bordered w-full"
                  placeholder="Ex.: Óleo sobre tela, 90 x 120 cm"
                  value={tecnica}
                  onChange={e => setTecnica(e.target.value)}
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-1">Ano</span>
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
              <span className="label-text mb-1">Foto da obra</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="file-input file-input-bordered w-full"
                onChange={e => escolherArquivo(e.target.files?.[0] ?? null)}
              />
              <span className="label-text-alt mt-1 text-base-content/60">
                JPG, PNG, WEBP ou SVG, até 8 MB. O hash do arquivo vai para a chain.
              </span>
            </label>

            <button className="btn btn-primary" disabled={!podeEnviar} onClick={tokenizar}>
              {enviando ? <span className="loading loading-spinner loading-sm" /> : null}
              Tokenizar e abrir o processo
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card bg-base-200 border border-base-300 overflow-hidden">
            <div className="aspect-4/3 bg-base-300 flex items-center justify-center">
              {previa ? (
                <img src={previa} alt="Prévia da obra" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-base-content/50">Prévia da obra</span>
              )}
            </div>
            <div className="card-body p-4 gap-1">
              <p className="font-semibold leading-tight">{titulo || "Sem título"}</p>
              <p className="text-sm text-base-content/70 leading-tight">
                {tecnica || "Técnica não informada"} · {ano}
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
              <p className="font-medium">O que acontece depois</p>
              <ol className="list-decimal list-inside text-base-content/70 flex flex-col gap-1">
                <li>A obra é registrada com status de titularidade não verificada.</li>
                <li>O evento dispara o agente, que protocola o processo de registro autoral.</li>
                <li>Concluído o processo, o contrato ricardiano é gravado e a obra pode ser vendida.</li>
              </ol>
              <p className="text-xs text-base-content/50 mt-1">
                Impressão digital do arquivo: {arquivo ? "calculada no envio" : encurtarHash(undefined)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criar;

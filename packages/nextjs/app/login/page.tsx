"use client";

import { useState } from "react";
import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount, useBalance } from "wagmi";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useIdentidade } from "~~/hooks/registro/useIdentidade";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { dataHora, encurtarHash, formatarCpf } from "~~/utils/registro";
import { notification } from "~~/utils/scaffold-eth";

const NIVEIS = [
  { valor: "bronze", rotulo: "Bronze" },
  { valor: "prata", rotulo: "Silver" },
  { valor: "ouro", rotulo: "Gold" },
];

const Entrar: NextPage = () => {
  const { address, isConnected } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { identidade, verificada, recarregar } = useIdentidade();

  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [nivel, setNivel] = useState("ouro");
  const [enviando, setEnviando] = useState(false);

  const { data: nonce, refetch: recarregarNonce } = useScaffoldReadContract({
    contractName: "GovBrIdentity",
    functionName: "nonces",
    args: [address],
  });

  const { data: saldo } = useBalance({ address });
  const semSaldo = saldo !== undefined && saldo.value === 0n;

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "GovBrIdentity" });

  const entrar = async () => {
    if (!address) return;
    setEnviando(true);

    try {
      // O nonce precisa ser o do momento do clique: ele entra na assinatura, e um valor
      // desatualizado faz o contrato recusar a credencial.
      const { data: nonceAtual } = await recarregarNonce();

      // 1. O provedor de identidade assina a credencial off-chain.
      const resposta = await fetch("/api/govbr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf,
          nome,
          nivel,
          endereco: address,
          chainId: targetNetwork.id,
          nonce: (nonceAtual ?? nonce ?? 0n).toString(),
        }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro ?? "gov.br sign-in failed.");

      // 2. O cidadão consome a credencial a partir da própria carteira: é isso que prova
      //    a posse da chave privada.
      await writeContractAsync({
        functionName: "linkIdentity",
        args: [dados.cpfHash, dados.civilName, dados.level, BigInt(dados.deadline), dados.signature],
      });

      notification.success("Civil identity linked to your wallet.");
      await recarregar();
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Could not complete sign-in.");
    } finally {
      setEnviando(false);
    }
  };

  // Mock: qualquer CPF e qualquer nome servem.
  const podeEnviar = isConnected && !enviando;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Sign in with gov.br</h1>
        <p className="text-base-content/70">
          Signing in binds your wallet to your tax ID. That binding is what allows a copyright filing to be opened in
          your name — with no identified author, there is no registrable work.
        </p>
      </div>

      {verificada && identidade && (
        <div className="card bg-success/10 border border-success">
          <div className="card-body gap-3">
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="h-6 w-6 text-success" />
              <h2 className="card-title text-lg m-0">Identity linked</h2>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-base-content/60">Legal name</dt>
              <dd className="font-medium">{identidade.civilName}</dd>
              <dt className="text-base-content/60">Tax ID</dt>
              <dd className="font-mono">{encurtarHash(identidade.cpfHash)} (hash)</dd>
              <dt className="text-base-content/60">Wallet</dt>
              <dd>
                <Address address={address} chain={targetNetwork} format="short" />
              </dd>
              <dt className="text-base-content/60">Verified on</dt>
              <dd>{dataHora(identidade.verifiedAt)}</dd>
            </dl>
            <div className="card-actions">
              <Link href="/create" className="btn btn-sm btn-primary">
                Tokenise a work
              </Link>
              <Link href="/market" className="btn btn-sm btn-ghost">
                Browse the market
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="card border border-base-300 overflow-hidden bg-base-100">
        {/* Reprodução simplificada da tela de login federado, apenas para a demonstração. */}
        <div className="bg-[#1351B4] text-white px-6 py-4">
          <p className="text-2xl font-bold tracking-tight">
            gov<span className="text-[#FFCD07]">.</span>br
          </p>
          <p className="text-sm opacity-90">Access your account</p>
        </div>

        <div className="bg-warning/20 border-b border-warning/40 px-6 py-2 text-xs">
          Simulation. Not connected to the real gov.br: any tax ID and any name are accepted, and the credential is
          signed by a local test key.
        </div>

        <div className="card-body gap-4">
          <label className="form-control">
            <span className="label-text mb-1">Tax ID (CPF)</span>
            <input
              className="input input-bordered w-full"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={e => setCpf(formatarCpf(e.target.value))}
              inputMode="numeric"
            />
          </label>

          <label className="form-control">
            <span className="label-text mb-1">Full legal name</span>
            <input
              className="input input-bordered w-full"
              placeholder="Any name works in this demo"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </label>

          <label className="form-control">
            <span className="label-text mb-1">Account level</span>
            <div className="join">
              {NIVEIS.map(n => (
                <button
                  key={n.valor}
                  type="button"
                  className={`btn join-item btn-sm ${nivel === n.valor ? "btn-active" : ""}`}
                  onClick={() => setNivel(n.valor)}
                >
                  {n.rotulo}
                </button>
              ))}
            </div>
          </label>

          <button className="btn btn-primary" disabled={!podeEnviar} onClick={entrar}>
            {enviando ? <span className="loading loading-spinner loading-sm" /> : null}
            {verificada ? "Link a different identity" : "Sign in"}
          </button>

          {!isConnected && (
            <p className="text-sm text-warning">Connect your wallet at the top of the page before signing in.</p>
          )}

          {isConnected && semSaldo && (
            <p className="text-sm text-warning">
              Your wallet has 0 ETH and cannot pay for gas. Use the faucet button (💧) at the top of the page to top up,
              then try again.
            </p>
          )}
        </div>
      </div>

      <details className="collapse collapse-arrow border border-base-300 bg-base-100">
        <summary className="collapse-title font-medium">
          How the binding works without putting your tax ID on chain
        </summary>
        <div className="collapse-content text-sm text-base-content/80 flex flex-col gap-2">
          <p>
            The identity provider signs an EIP-712 credential stating &quot;tax ID X belongs to the holder of address
            Y&quot;. You are the one who submits the transaction, from your own wallet — that is how possession of the
            private key is proven on chain.
          </p>
          <p>
            The tax ID itself never reaches the network: the contract stores only a salted hash. One tax ID is active in
            a single wallet at a time; linking a new one revokes the previous.
          </p>
        </div>
      </details>
    </div>
  );
};

export default Entrar;

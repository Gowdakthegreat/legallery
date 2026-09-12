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
  { valor: "prata", rotulo: "Prata" },
  { valor: "ouro", rotulo: "Ouro" },
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
      if (!resposta.ok) throw new Error(dados.erro ?? "Falha no login gov.br.");

      // 2. O cidadão consome a credencial a partir da própria carteira: é isso que prova
      //    a posse da chave privada.
      await writeContractAsync({
        functionName: "linkIdentity",
        args: [dados.cpfHash, dados.civilName, dados.level, BigInt(dados.deadline), dados.signature],
      });

      notification.success("Identidade civil vinculada à sua carteira.");
      await recarregar();
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Não foi possível concluir o login.");
    } finally {
      setEnviando(false);
    }
  };

  // Mock: qualquer CPF e qualquer nome servem.
  const podeEnviar = isConnected && !enviando;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Entrar com gov.br</h1>
        <p className="text-base-content/70">
          O login vincula sua carteira ao seu CPF. É esse vínculo que permite abrir um processo de registro autoral em
          seu nome — sem autor civil identificado, não existe obra registrável.
        </p>
      </div>

      {verificada && identidade && (
        <div className="card bg-success/10 border border-success">
          <div className="card-body gap-3">
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="h-6 w-6 text-success" />
              <h2 className="card-title text-lg m-0">Identidade vinculada</h2>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-base-content/60">Nome civil</dt>
              <dd className="font-medium">{identidade.civilName}</dd>
              <dt className="text-base-content/60">CPF</dt>
              <dd className="font-mono">{encurtarHash(identidade.cpfHash)} (hash)</dd>
              <dt className="text-base-content/60">Carteira</dt>
              <dd>
                <Address address={address} chain={targetNetwork} format="short" />
              </dd>
              <dt className="text-base-content/60">Verificado em</dt>
              <dd>{dataHora(identidade.verifiedAt)}</dd>
            </dl>
            <div className="card-actions">
              <Link href="/criar" className="btn btn-sm btn-primary">
                Tokenizar uma obra
              </Link>
              <Link href="/mercado" className="btn btn-sm btn-ghost">
                Ver o mercado
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
          <p className="text-sm opacity-90">Acesse sua conta</p>
        </div>

        <div className="bg-warning/20 border-b border-warning/40 px-6 py-2 text-xs">
          Simulação. Não se conecta ao gov.br real: qualquer CPF e qualquer nome são aceitos, e a credencial é assinada
          por uma chave de teste local.
        </div>

        <div className="card-body gap-4">
          <label className="form-control">
            <span className="label-text mb-1">CPF</span>
            <input
              className="input input-bordered w-full"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={e => setCpf(formatarCpf(e.target.value))}
              inputMode="numeric"
            />
          </label>

          <label className="form-control">
            <span className="label-text mb-1">Nome civil completo</span>
            <input
              className="input input-bordered w-full"
              placeholder="Qualquer nome serve nesta demonstração"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </label>

          <label className="form-control">
            <span className="label-text mb-1">Nível da conta</span>
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
            {verificada ? "Vincular a outra identidade" : "Entrar"}
          </button>

          {!isConnected && (
            <p className="text-sm text-warning">Conecte sua carteira no topo da página antes de entrar.</p>
          )}

          {isConnected && semSaldo && (
            <p className="text-sm text-warning">
              Sua carteira está com 0 ETH e não consegue pagar o gás. Use o botão da torneira (💧) no topo da página
              para se abastecer e tente de novo.
            </p>
          )}
        </div>
      </div>

      <details className="collapse collapse-arrow border border-base-300 bg-base-100">
        <summary className="collapse-title font-medium">Como o vínculo é feito sem entregar o CPF à rede</summary>
        <div className="collapse-content text-sm text-base-content/80 flex flex-col gap-2">
          <p>
            O provedor de identidade assina uma credencial EIP-712 dizendo &quot;o CPF X pertence ao titular do endereço
            Y&quot;. Quem envia a transação é você, a partir da sua carteira — é assim que a posse da chave privada fica
            provada na chain.
          </p>
          <p>
            O número do CPF nunca vai para a rede: o contrato guarda apenas o hash com sal. O mesmo CPF só fica ativo em
            uma carteira por vez; vincular a uma nova revoga a anterior.
          </p>
        </div>
      </details>
    </div>
  );
};

export default Entrar;

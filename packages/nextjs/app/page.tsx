"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useIdentidade } from "~~/hooks/registro/useIdentidade";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { type Obra, STATUS } from "~~/utils/registro";

const ETAPAS = [
  {
    numero: "01",
    titulo: "Civil identity",
    texto:
      "The artist signs in with gov.br and binds their wallet to their tax ID. The provider signs the credential, the citizen submits the transaction: both halves of the proof.",
  },
  {
    numero: "02",
    titulo: "Work tokenised",
    texto:
      "Photo and details go on chain along with the file hash. The work starts with ownership unverified — it is only a timestamped claim.",
  },
  {
    numero: "03",
    titulo: "The agent files it",
    texto:
      "The transaction triggers an autonomous agent that files the copyright registration, issues the legal opinion and drafts the work\u2019s Ricardian contract.",
  },
  {
    numero: "04",
    titulo: "Ownership recognised",
    texto:
      "Once registered, the work can be sold. On delivery the payment leaves escrow and the author takes their share of the appreciation.",
  },
];

const Home: NextPage = () => {
  const { isConnected } = useAccount();
  const { verificada } = useIdentidade();

  const { data: acervo } = useScaffoldReadContract({ contractName: "ArtRegistry", functionName: "allWorks" });
  const { data: ofertas } = useScaffoldReadContract({ contractName: "ArtMarketplace", functionName: "activeListings" });

  const obras = (acervo?.[1] ?? []) as readonly Obra[];
  const registradas = obras.filter(o => o.status === STATUS.REGISTRADA).length;
  const emProcesso = obras.filter(o => o.status === STATUS.SUBMETIDA || o.status === STATUS.EM_ANALISE).length;
  const aVenda = ((ofertas?.[0] ?? []) as readonly bigint[]).length;

  return (
    <div className="flex flex-col grow">
      <section className="px-4 pt-14 pb-10 mx-auto w-full max-w-5xl text-center flex flex-col items-center gap-5">
        <span className="badge badge-outline">On-chain copyright registry · Brazilian Law 9.610/98</span>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight m-0">
          From canvas to legal title,
          <br />
          without leaving the chain
        </h1>
        <p className="text-lg text-base-content/70 max-w-2xl">
          The artist tokenises the work, an autonomous agent files the Brazilian copyright registration, and the
          contract secures the author\u2019s 5% of the appreciation on every resale — automatically, forever.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={isConnected && verificada ? "/create" : "/login"} className="btn btn-primary">
            {isConnected && verificada ? "Tokenise a work" : "Sign in with gov.br"}
          </Link>
          <Link href="/market" className="btn btn-ghost">
            Browse the market
          </Link>
        </div>

        <div className="stats stats-vertical sm:stats-horizontal border border-base-300 bg-base-100 mt-4">
          <div className="stat place-items-center">
            <div className="stat-value text-3xl">{obras.length}</div>
            <div className="stat-desc">works on chain</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-value text-3xl">{registradas}</div>
            <div className="stat-desc">with ownership recognised</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-value text-3xl">{emProcesso}</div>
            <div className="stat-desc">being filed</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-value text-3xl">{aVenda}</div>
            <div className="stat-desc">for sale</div>
          </div>
        </div>
      </section>

      <section className="bg-base-300 px-4 py-12">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">How it works</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPAS.map(etapa => (
              <div key={etapa.numero} className="card bg-base-100 border border-base-300">
                <div className="card-body gap-2 p-5">
                  <span className="text-3xl font-bold text-primary/30 leading-none">{etapa.numero}</span>
                  <h3 className="font-semibold m-0">{etapa.titulo}</h3>
                  <p className="text-sm text-base-content/70 leading-snug">{etapa.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 mx-auto w-full max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3">
              <h2 className="card-title text-lg m-0">Why 5% of the appreciation</h2>
              <p className="text-sm text-base-content/80">
                Article 38 of Brazilian Law 9.610/98 gives the author a non-waivable, inalienable right to at least 5%{" "}
                <strong>of the price increase</strong> on every resale — not of the full price. Resell a work at no gain
                and nothing is owed.
              </p>
              <p className="text-sm text-base-content/80">
                That is why the contract does not use the ERC-2981 royalty standard: it would charge against the full
                sale price and collect more than the law allows.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3">
              <h2 className="card-title text-lg m-0">Registration does not reach everywhere</h2>
              <p className="text-sm text-base-content/80">
                Among Berne Convention signatories protection is automatic, with no formality. But in some countries
                practical enforcement depends on local steps — China, for one, ties much of it to registration with the
                CPCC.
              </p>
              <p className="text-sm text-base-content/80">
                Every registered work carries its jurisdiction list and shows, plainly, where the title is{" "}
                <strong>not</strong> yet enforceable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

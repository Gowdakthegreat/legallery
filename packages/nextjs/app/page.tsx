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
    titulo: "Identidade civil",
    texto:
      "O artista entra com gov.br e vincula a carteira ao CPF. O provedor assina a credencial, o cidadão envia a transação: as duas metades da prova.",
  },
  {
    numero: "02",
    titulo: "Obra tokenizada",
    texto:
      "Foto e ficha técnica entram na chain com o hash do arquivo. A obra nasce com titularidade não verificada — é só uma declaração carimbada no tempo.",
  },
  {
    numero: "03",
    titulo: "Agente instrui o processo",
    texto:
      "A transação dispara um agente autônomo que protocola o registro autoral, emite o parecer e redige o contrato ricardiano da obra.",
  },
  {
    numero: "04",
    titulo: "Titularidade reconhecida",
    texto:
      "Com o registro concluído, a obra pode ser vendida. Na entrega, o pagamento sai da custódia e o autor recebe sua parte na valorização.",
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
        <span className="badge badge-outline">Registro autoral on-chain · Lei 9.610/98</span>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight m-0">
          Da tela ao registro legal,
          <br />
          sem sair da blockchain
        </h1>
        <p className="text-lg text-base-content/70 max-w-2xl">
          O artista tokeniza a obra, um agente autônomo instrui o processo de registro autoral brasileiro, e o contrato
          garante os 5% do autor sobre a valorização em toda revenda — automaticamente, para sempre.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={isConnected && verificada ? "/criar" : "/entrar"} className="btn btn-primary">
            {isConnected && verificada ? "Tokenizar uma obra" : "Entrar com gov.br"}
          </Link>
          <Link href="/mercado" className="btn btn-ghost">
            Ver o mercado
          </Link>
        </div>

        <div className="stats stats-vertical sm:stats-horizontal border border-base-300 bg-base-100 mt-4">
          <div className="stat place-items-center">
            <div className="stat-value text-3xl">{obras.length}</div>
            <div className="stat-desc">obras na chain</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-value text-3xl">{registradas}</div>
            <div className="stat-desc">com titularidade reconhecida</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-value text-3xl">{emProcesso}</div>
            <div className="stat-desc">em processo</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-value text-3xl">{aVenda}</div>
            <div className="stat-desc">à venda</div>
          </div>
        </div>
      </section>

      <section className="bg-base-300 px-4 py-12">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">Como funciona</h2>
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
              <h2 className="card-title text-lg m-0">Por que 5% sobre a valorização</h2>
              <p className="text-sm text-base-content/80">
                O art. 38 da Lei 9.610/98 dá ao autor o direito irrenunciável e inalienável de receber no mínimo 5%{" "}
                <strong>sobre o aumento do preço</strong> verificado em cada revenda — não sobre o preço cheio. Se a
                obra for revendida sem valorização, nada é devido.
              </p>
              <p className="text-sm text-base-content/80">
                Por isso o contrato não usa o padrão ERC-2981 de royalties, que calcularia sobre o valor total da venda
                e cobraria a mais do que a lei manda.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3">
              <h2 className="card-title text-lg m-0">O registro não vale em toda parte</h2>
              <p className="text-sm text-base-content/80">
                Entre signatários da Convenção de Berna a proteção é automática, sem formalidade. Mas há países em que a
                tutela prática depende de providências locais — a China, por exemplo, condiciona boa parte da execução
                ao registro no CPCC.
              </p>
              <p className="text-sm text-base-content/80">
                Cada obra registrada carrega a lista de jurisdições e mostra, sem maquiagem, onde a titularidade ainda{" "}
                <strong>não</strong> é oponível.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

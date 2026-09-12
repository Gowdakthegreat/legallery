import { expect } from "chai";
import { network } from "hardhat";
import type { Abi_GovBrIdentity } from "../generated/abis/GovBrIdentity.js";
import type { Abi_ArtRegistry } from "../generated/abis/ArtRegistry.js";
import type { Abi_ArtMarketplace } from "../generated/abis/ArtMarketplace.js";
import { loadAndExecuteDeploymentsFromFiles } from "../rocketh/environment.js";

const { provider, networkHelpers, ethers } = await network.create();

const STATUS = { NONE: 0n, SUBMETIDA: 1n, EM_ANALISE: 2n, REGISTRADA: 3n, REJEITADA: 4n };
const COVERAGE = { PENDENTE: 0, RECONHECIDA: 1, NAO_COBERTA: 2 };

async function deployFixture() {
  const env = await loadAndExecuteDeploymentsFromFiles({ provider });

  const identityDeployment = env.get<Abi_GovBrIdentity>("GovBrIdentity");
  const registryDeployment = env.get<Abi_ArtRegistry>("ArtRegistry");
  const marketplaceDeployment = env.get<Abi_ArtMarketplace>("ArtMarketplace");

  // `as any`: hardhat-ethers traz uma cópia própria do ethers, e os tipos de Signer/Provider
  // das duas cópias não se encaixam. Nos testes não perdemos nada com isso.
  const identity = (await ethers.getContractAt(identityDeployment.abi, identityDeployment.address)) as any;
  const registry = (await ethers.getContractAt(registryDeployment.abi, registryDeployment.address)) as any;
  const marketplace = (await ethers.getContractAt(marketplaceDeployment.abi, marketplaceDeployment.address)) as any;

  const [, govbr, agent, artist, collector, secondCollector] = await ethers.getSigners();

  return { identity, registry, marketplace, govbr, agent, artist, collector, secondCollector };
}

/** Reproduz a credencial EIP-712 que o backend do gov.br assinaria. */
async function govbrCredential(identity: any, govbr: any, subject: any, cpf: string, civilName: string, level = 3) {
  const cpfHash = ethers.keccak256(ethers.toUtf8Bytes(`${cpf}:sal-demo`));
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const nonce = await identity.nonces(subject.address);
  const { chainId } = await ethers.provider.getNetwork();

  const signature = await govbr.signTypedData(
    { name: "GovBrIdentity", version: "1", chainId, verifyingContract: await identity.getAddress() },
    {
      GovBrCredential: [
        { name: "subject", type: "address" },
        { name: "cpfHash", type: "bytes32" },
        { name: "civilName", type: "string" },
        { name: "level", type: "uint8" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    { subject: subject.address, cpfHash, civilName, level, nonce, deadline },
  );

  return { cpfHash, civilName, level, deadline, signature };
}

async function login(identity: any, govbr: any, subject: any, cpf: string, name: string) {
  const credential = await govbrCredential(identity, govbr, subject, cpf, name);
  await identity
    .connect(subject)
    .linkIdentity(
      credential.cpfHash,
      credential.civilName,
      credential.level,
      credential.deadline,
      credential.signature,
    );
}

async function submitWork(registry: any, artist: any) {
  await registry
    .connect(artist)
    .submitWork(
      "Retirantes do Cerrado",
      "Óleo sobre tela, 90x120cm",
      2024,
      "/uploads/obra.jpg",
      "",
      ethers.keccak256(ethers.toUtf8Bytes("arquivo-da-obra")),
    );
  return await registry.totalSupply();
}

async function registerWork(registry: any, agent: any, tokenId: bigint) {
  await registry.connect(agent).openDossier(tokenId, "EBA/UFRJ-2026-000421", "Escola de Belas Artes da UFRJ");
  await registry.connect(agent).registerWork(
    tokenId,
    {
      dossierNumber: "EBA/UFRJ-2026-000421",
      authority: "Escola de Belas Artes da UFRJ",
      opinionSummary: "Autoria comprovada. Registro deferido nos termos da Lei 9.610/98.",
      ricardianURI: "/registros/1.md",
      ricardianHash: ethers.keccak256(ethers.toUtf8Bytes("contrato ricardiano")),
      resaleRoyaltyBps: 500,
    },
    [
      {
        code: "BR",
        name: "Brasil",
        coverage: COVERAGE.RECONHECIDA,
        basis: "Lei 9.610/98, arts. 18-20",
      },
      {
        code: "CN",
        name: "China",
        coverage: COVERAGE.NAO_COBERTA,
        basis: "Registro voluntário no CPCC não realizado",
      },
    ],
  );
}

describe("Registro de obras", function () {
  describe("Identidade gov.br", function () {
    it("vincula a carteira à identidade civil com credencial assinada pelo gov.br", async function () {
      const { identity, govbr, artist } = await networkHelpers.loadFixture(deployFixture);

      await login(identity, govbr, artist, "123.456.789-00", "Marina Duarte Alencar");

      expect(await identity.isVerified(artist.address)).to.equal(true);
      expect(await identity.civilNameOf(artist.address)).to.equal("Marina Duarte Alencar");
    });

    it("recusa credencial assinada por quem não é o gov.br", async function () {
      const { identity, artist, collector } = await networkHelpers.loadFixture(deployFixture);

      const forged = await govbrCredential(identity, collector, artist, "123.456.789-00", "Marina Duarte Alencar");

      await expect(
        identity
          .connect(artist)
          .linkIdentity(forged.cpfHash, forged.civilName, forged.level, forged.deadline, forged.signature),
      ).to.be.revertedWithCustomError(identity, "InvalidIssuerSignature");
    });

    it("revoga a carteira anterior quando o mesmo CPF migra para outra", async function () {
      const { identity, govbr, artist, collector } = await networkHelpers.loadFixture(deployFixture);

      await login(identity, govbr, artist, "123.456.789-00", "Marina Duarte Alencar");
      await login(identity, govbr, collector, "123.456.789-00", "Marina Duarte Alencar");

      expect(await identity.isVerified(artist.address)).to.equal(false);
      expect(await identity.isVerified(collector.address)).to.equal(true);
    });
  });

  describe("Tokenização da obra", function () {
    it("exige identidade civil ativa para tokenizar", async function () {
      const { registry, artist } = await networkHelpers.loadFixture(deployFixture);

      const { identity } = await networkHelpers.loadFixture(deployFixture);

      await expect(submitWork(registry, artist)).to.be.revertedWithCustomError(identity, "NotVerified");
    });

    it("nasce com a titularidade não verificada", async function () {
      const { identity, registry, govbr, artist } = await networkHelpers.loadFixture(deployFixture);
      await login(identity, govbr, artist, "123.456.789-00", "Marina Duarte Alencar");

      const tokenId = await submitWork(registry, artist);
      const work = await registry.workOf(tokenId);

      expect(work.status).to.equal(STATUS.SUBMETIDA);
      expect(work.creator).to.equal(artist.address);
      expect(await registry.ownerOf(tokenId)).to.equal(artist.address);
    });

    it("emite WorkSubmitted, que é o gatilho do agente", async function () {
      const { identity, registry, govbr, artist } = await networkHelpers.loadFixture(deployFixture);
      await login(identity, govbr, artist, "123.456.789-00", "Marina Duarte Alencar");

      const tx = registry
        .connect(artist)
        .submitWork("Retirantes do Cerrado", "Óleo sobre tela", 2024, "/uploads/obra.jpg", "", ethers.ZeroHash);

      await expect(tx).to.emit(registry, "WorkSubmitted");
    });
  });

  describe("Processo legal conduzido pelo agente", function () {
    it("só o agente pode conduzir o processo", async function () {
      const { identity, registry, govbr, artist } = await networkHelpers.loadFixture(deployFixture);
      await login(identity, govbr, artist, "123.456.789-00", "Marina Duarte Alencar");
      const tokenId = await submitWork(registry, artist);

      await expect(registry.connect(artist).openDossier(tokenId, "X", "Y")).to.be.revertedWithCustomError(
        registry,
        "NotLegalAgent",
      );
    });

    it("grava o contrato ricardiano e as jurisdições ao concluir", async function () {
      const { identity, registry, govbr, agent, artist } = await networkHelpers.loadFixture(deployFixture);
      await login(identity, govbr, artist, "123.456.789-00", "Marina Duarte Alencar");
      const tokenId = await submitWork(registry, artist);

      await registerWork(registry, agent, tokenId);

      expect(await registry.statusOf(tokenId)).to.equal(STATUS.REGISTRADA);

      const record = await registry.legalRecordOf(tokenId);
      expect(record.dossierNumber).to.equal("EBA/UFRJ-2026-000421");
      expect(record.resaleRoyaltyBps).to.equal(500n);

      const jurisdictions = await registry.jurisdictionsOf(tokenId);
      expect(jurisdictions.length).to.equal(2);
      expect(jurisdictions[0].code).to.equal("BR");
      expect(jurisdictions[0].coverage).to.equal(BigInt(COVERAGE.RECONHECIDA));
      expect(jurisdictions[1].code).to.equal("CN");
      expect(jurisdictions[1].coverage).to.equal(BigInt(COVERAGE.NAO_COBERTA));
    });

    it("recusa registro com direito de sequência abaixo do piso legal de 5%", async function () {
      const { identity, registry, govbr, agent, artist } = await networkHelpers.loadFixture(deployFixture);
      await login(identity, govbr, artist, "123.456.789-00", "Marina Duarte Alencar");
      const tokenId = await submitWork(registry, artist);
      await registry.connect(agent).openDossier(tokenId, "D", "A");

      await expect(
        registry.connect(agent).registerWork(
          tokenId,
          {
            dossierNumber: "D",
            authority: "A",
            opinionSummary: "",
            ricardianURI: "/registros/1.md",
            ricardianHash: ethers.keccak256(ethers.toUtf8Bytes("x")),
            resaleRoyaltyBps: 300,
          },
          [],
        ),
      ).to.be.revertedWithCustomError(registry, "RoyaltyBelowLegalFloor");
    });
  });

  describe("Circulação da obra", function () {
    it("bloqueia venda de obra ainda não registrada", async function () {
      const { identity, registry, marketplace, govbr, artist } = await networkHelpers.loadFixture(deployFixture);
      await login(identity, govbr, artist, "123.456.789-00", "Marina Duarte Alencar");
      const tokenId = await submitWork(registry, artist);

      await expect(marketplace.connect(artist).listWork(tokenId, ethers.parseEther("1"))).to.be.revertedWithCustomError(
        marketplace,
        "WorkNotRegistered",
      );
    });

    it("bloqueia transferência direta, fora do marketplace", async function () {
      const { identity, registry, govbr, agent, artist, collector } = await networkHelpers.loadFixture(deployFixture);
      await login(identity, govbr, artist, "123.456.789-00", "Marina Duarte Alencar");
      const tokenId = await submitWork(registry, artist);
      await registerWork(registry, agent, tokenId);

      await expect(
        registry.connect(artist).transferFrom(artist.address, collector.address, tokenId),
      ).to.be.revertedWithCustomError(registry, "TransferNotAllowed");
    });
  });

  describe("Compra com entrega física", function () {
    async function listedFixture() {
      const base = await networkHelpers.loadFixture(deployFixture);
      const { identity, registry, marketplace, govbr, agent, artist, collector, secondCollector } = base;

      await login(identity, govbr, artist, "123.456.789-00", "Marina Duarte Alencar");
      await login(identity, govbr, collector, "987.654.321-00", "Ricardo Bastos Lemos");
      await login(identity, govbr, secondCollector, "111.222.333-44", "Helena Prado Vasconcelos");

      const tokenId = await submitWork(registry, artist);
      await registerWork(registry, agent, tokenId);

      await registry.connect(artist).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(artist).listWork(tokenId, ethers.parseEther("10"));

      return { ...base, tokenId };
    }

    it("retém o pagamento em custódia até o comprador confirmar o recebimento", async function () {
      const { registry, marketplace, artist, collector, tokenId } = await listedFixture();

      await marketplace.connect(collector).buy(tokenId, { value: ethers.parseEther("10") });

      // A obra sai das mãos do vendedor mas ainda não é do comprador.
      expect(await registry.ownerOf(tokenId)).to.equal(ethers.getAddress(await marketplace.getAddress()));
      expect(await ethers.provider.getBalance(await marketplace.getAddress())).to.equal(ethers.parseEther("10"));

      await expect(marketplace.connect(collector).confirmReceipt(1n)).to.changeEtherBalance(
        ethers,
        artist,
        ethers.parseEther("10"),
      );
      expect(await registry.ownerOf(tokenId)).to.equal(collector.address);
    });

    it("exige comprador identificado", async function () {
      const { marketplace, tokenId } = await listedFixture();
      const [, , , , , , stranger] = await ethers.getSigners();

      await expect(
        marketplace.connect(stranger).buy(tokenId, { value: ethers.parseEther("10") }),
      ).to.be.revertedWithCustomError(marketplace, "BuyerNotVerified");
    });

    it("não cobra direito de sequência na primeira alienação feita pelo autor", async function () {
      const { marketplace, collector, tokenId } = await listedFixture();

      await marketplace.connect(collector).buy(tokenId, { value: ethers.parseEther("10") });
      await expect(marketplace.connect(collector).confirmReceipt(1n)).to.not.emit(marketplace, "ResaleRoyaltyPaid");
    });

    it("paga 5% sobre o AUMENTO do preço na revenda, e não sobre o preço cheio", async function () {
      const { registry, marketplace, artist, collector, secondCollector, tokenId } = await listedFixture();

      // Primeira venda: autor -> colecionador, por 10 ETH.
      await marketplace.connect(collector).buy(tokenId, { value: ethers.parseEther("10") });
      await marketplace.connect(collector).confirmReceipt(1n);

      // Revenda por 30 ETH: mais-valia de 20 ETH, 5% = 1 ETH para a autora.
      await registry.connect(collector).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(collector).listWork(tokenId, ethers.parseEther("30"));
      await marketplace.connect(secondCollector).buy(tokenId, { value: ethers.parseEther("30") });

      await expect(marketplace.connect(secondCollector).confirmReceipt(2n))
        .to.emit(marketplace, "ResaleRoyaltyPaid")
        .withArgs(2n, tokenId, artist.address, ethers.parseEther("1"), ethers.parseEther("20"));

      expect(await registry.ownerOf(tokenId)).to.equal(secondCollector.address);
    });

    it("credita autora e revendedor nos valores certos", async function () {
      const { registry, marketplace, artist, collector, secondCollector, tokenId } = await listedFixture();

      await marketplace.connect(collector).buy(tokenId, { value: ethers.parseEther("10") });
      await marketplace.connect(collector).confirmReceipt(1n);

      await registry.connect(collector).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(collector).listWork(tokenId, ethers.parseEther("30"));
      await marketplace.connect(secondCollector).buy(tokenId, { value: ethers.parseEther("30") });

      await expect(marketplace.connect(secondCollector).confirmReceipt(2n)).to.changeEtherBalances(
        ethers,
        [artist, collector],
        [ethers.parseEther("1"), ethers.parseEther("29")],
      );
    });

    it("não cobra nada quando a obra é revendida sem valorização", async function () {
      const { registry, marketplace, collector, secondCollector, tokenId } = await listedFixture();

      await marketplace.connect(collector).buy(tokenId, { value: ethers.parseEther("10") });
      await marketplace.connect(collector).confirmReceipt(1n);

      // Revenda no prejuízo: art. 38 incide sobre o aumento do preço, que aqui não existe.
      await registry.connect(collector).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(collector).listWork(tokenId, ethers.parseEther("8"));
      await marketplace.connect(secondCollector).buy(tokenId, { value: ethers.parseEther("8") });

      await expect(marketplace.connect(secondCollector).confirmReceipt(2n)).to.not.emit(
        marketplace,
        "ResaleRoyaltyPaid",
      );
    });

    it("devolve o dinheiro quando o vendedor cancela antes da entrega", async function () {
      const { registry, marketplace, artist, collector, tokenId } = await listedFixture();

      await marketplace.connect(collector).buy(tokenId, { value: ethers.parseEther("10") });

      await expect(marketplace.connect(artist).cancelOrder(1n)).to.changeEtherBalance(
        ethers,
        collector,
        ethers.parseEther("10"),
      );
      expect(await registry.ownerOf(tokenId)).to.equal(artist.address);
    });

    it("só libera o cancelamento pelo comprador depois do prazo de entrega", async function () {
      const { marketplace, collector, tokenId } = await listedFixture();

      await marketplace.connect(collector).buy(tokenId, { value: ethers.parseEther("10") });

      await expect(marketplace.connect(collector).cancelOrder(1n)).to.be.revertedWithCustomError(
        marketplace,
        "DeadlineNotReached",
      );

      await networkHelpers.time.increase(30 * 24 * 60 * 60 + 1);
      await expect(marketplace.connect(collector).cancelOrder(1n)).to.changeEtherBalance(
        ethers,
        collector,
        ethers.parseEther("10"),
      );
    });
  });
});

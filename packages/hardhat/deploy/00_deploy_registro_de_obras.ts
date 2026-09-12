import { deployScript, artifacts } from "../rocketh/deploy.js";

/**
 * Sobe a stack completa:
 *  - GovBrIdentity: vinculo entre carteira e identidade civil (login gov.br mockado);
 *  - ArtRegistry:   obras tokenizadas e o registro autoral emitido pelo agente;
 *  - ArtMarketplace: venda com custodia e direito de sequencia do autor.
 */
export default deployScript(
  async env => {
    const { deployer, govbrIssuer, legalAgent } = env.namedAccounts;

    const identity = await env.deploy("GovBrIdentity", {
      account: deployer,
      artifact: artifacts.GovBrIdentity,
      args: [deployer, govbrIssuer],
    });

    const registry = await env.deploy("ArtRegistry", {
      account: deployer,
      artifact: artifacts.ArtRegistry,
      args: [deployer, identity.address, legalAgent],
    });

    const marketplace = await env.deploy("ArtMarketplace", {
      account: deployer,
      artifact: artifacts.ArtMarketplace,
      args: [registry.address, identity.address],
    });

    // O registro so autoriza transferencias feitas pelo marketplace, que e quem apura a
    // mais-valia e retem o direito de sequencia do autor.
    const currentMarketplace = await env.read(registry, { functionName: "marketplace" });
    if (currentMarketplace.toLowerCase() !== marketplace.address.toLowerCase()) {
      await env.execute(registry, {
        account: deployer,
        functionName: "setMarketplace",
        args: [marketplace.address],
      });
    }

    console.log("\n🇧🇷 gov.br (emissor das credenciais):", govbrIssuer);
    console.log("🤖 Agente juridico autonomo:", legalAgent);
    console.log("🖼️  Registro de obras:", registry.address);
    console.log("🏛️  Marketplace:", marketplace.address, "\n");
  },
  {
    tags: ["RegistroDeObras"],
  },
);

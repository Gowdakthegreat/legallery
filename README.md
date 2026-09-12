# Registro de Obras

Tokenização de obras de arte com **registro autoral brasileiro** e **direito de sequência** executado
pelo contrato. Um agente autônomo conduz o processo legal; o marketplace garante que os 5% do autor
sobre a valorização sejam pagos em toda revenda, sem depender da boa vontade de ninguém.

Construído sobre [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2).

---

## O fluxo

| # | Etapa | O que acontece |
| --- | --- | --- |
| 1 | **Login gov.br** | O provedor de identidade assina uma credencial EIP-712 ligando o CPF ao endereço; o cidadão envia a transação a partir da própria carteira. O CPF nunca vai para a rede — só o hash com sal. |
| 2 | **Tokenização** | O artista envia foto e ficha técnica. A obra entra na chain com o hash do arquivo e status **titularidade não verificada**: por ora é só uma declaração carimbada no tempo. |
| 3 | **Agente autônomo** | A submissão dispara um agente que protocola o processo de registro autoral, emite o parecer e redige o contrato ricardiano da obra. |
| 4 | **Titularidade reconhecida** | O agente grava na chain o número do processo, o hash do contrato ricardiano e a lista de jurisdições onde a titularidade é oponível. Só agora a obra pode circular. |
| 5 | **Venda com entrega física** | O comprador paga em ETH e o valor fica em custódia. Ao confirmar o recebimento da peça, a titularidade passa para ele. |
| 6 | **Direito de sequência** | No mesmo ato da liquidação, o autor recebe 5% sobre o **aumento** de preço em relação à aquisição anterior. |

---

## Rodando

Pré-requisitos: Node ≥ 22.10 e Yarn 4 (via `corepack enable`).

```bash
yarn install
```

### Na chain local (desenvolvimento)

Quatro terminais:

```bash
yarn chain     # 1 - blockchain local
yarn deploy    # 2 - publica os contratos
yarn agent     # 3 - agente jurídico autônomo (fica observando a chain)
yarn start     # 4 - frontend em http://localhost:3000
```

Conecte a carteira na rede **Localhost 8545** (ou use a burner wallet, que aparece sozinha em
rede local).

### Ensaio geral em fork da Sepolia (de graça)

Antes de gastar ETH de teste, dá para exercitar o fluxo inteiro num nó local que **forka a
Sepolia** e responde com o chainId dela (11155111). Isso importa porque o chainId entra no domínio
EIP-712 da credencial gov.br: assinatura feita para uma rede não vale em outra.

```bash
yarn chain:fork     # 1 - nó local forkando a Sepolia, na porta 8546
yarn deploy:fork    # 2 - publica os contratos nesse nó
yarn agent:fork     # 3 - agente apontando para o fork
yarn start          # 4 - frontend
yarn ensaio         # 5 - confere o login gov.br de ponta a ponta
yarn demo:fork --revenda
```

O frontend precisa de `packages/nextjs/.env.local` com:

```
NEXT_PUBLIC_SEPOLIA_RPC=http://127.0.0.1:8546
GOVBR_PERMITIR_CHAVE_DE_TESTE=1
```

O segundo libera, só no ensaio, a chave de teste do emissor — em rede pública a rota `/api/govbr`
se recusa a assinar com ela (veja abaixo).

> O `yarn deploy:fork` grava os endereços do fork em `deployedContracts.ts` sob o chainId
> 11155111. Publicar na Sepolia de verdade sobrescreve. Não comite esse arquivo com endereços de
> fork dentro.

### Na Sepolia (demonstração)

A Sepolia é a primeira rede em `packages/nextjs/scaffold.config.ts`, então é a que o app usa por
padrão. São cinco passos:

**1. Gere as carteiras de serviço**

```bash
yarn contas
```

Ele imprime, prontos para colar, os blocos de `.env` de cada pacote e a lista de endereços que
precisam de saldo. As chaves aparecem uma única vez — guarde-as.

**2. Coloque saldo**

Precisam de ETH de teste: o **deployer** (gere com `yarn generate`), o **agente** (duas transações
por obra) e as carteiras que vão comprar. O emissor gov.br **não** precisa: ele só assina
credenciais off-chain.

Torneiras: [Alchemy](https://www.alchemy.com/faucets/ethereum-sepolia) ou
[pk910](https://sepolia-faucet.pk910.de) (prova de trabalho, não exige conta).

**3. Publique os contratos**

```bash
yarn deploy --network sepolia
```

Os endereços do emissor e do agente vêm de `GOVBR_ISSUER_ADDRESS` e `LEGAL_AGENT_ADDRESS` em
`packages/hardhat/.env` — sem eles, o deploy grava as contas do Hardhat, cujas chaves são
públicas.

Do lado do frontend, `GOVBR_ISSUER_PRIVATE_KEY` precisa ser a chave desse mesmo emissor. Fora da
chain local, a rota `/api/govbr` **se recusa a assinar** com a chave padrão do Hardhat e devolve
erro: aquela chave está no README do Hardhat, e qualquer pessoa poderia emitir credenciais
gov.br com ela.

**4. Suba o agente apontando para a Sepolia**

```bash
yarn agent:sepolia
```

Ou deixe `NETWORK=sepolia` em `packages/agent/.env` e use `yarn agent`. O agente diz, ao subir, em
que rede está e quanto tem de saldo.

**5. Rode o frontend**

```bash
yarn start
```

Conecte o MetaMask na Sepolia. Para popular a demonstração:

```bash
yarn demo:sepolia             # tokeniza uma obra e a anuncia depois do registro
yarn demo:sepolia --revenda   # o mesmo, mais uma compra e uma revenda valorizada
```

### O tempo da instrução do processo

O agente trabalha em etapas anunciadas no terminal e leva **cerca de 30 segundos** por obra — tempo
suficiente para a plateia ver o status mudar de *titularidade não verificada* para *em análise* e
depois para *reconhecida*, com a barra de progresso correndo na tela.

A espera é sempre pelo tempo que **falta**: cada etapa só é anunciada quando a fração
correspondente do orçamento já passou, então nada é acrescentado artificialmente quando o trabalho
real já levou esse tempo. Para mudar o ritmo, `AGENT_DURACAO_MS` em `packages/agent/.env`.

Os 30 segundos são o orçamento da **análise**. A transação final de averbação vem depois e soma o
tempo de bloco da rede: na chain local o processo fecha em 30s cravados, na Sepolia fica na casa
dos 45s.

```
📥 Obra #5 "Retirantes do Cerrado" submetida por Marina Duarte Alencar.
   Protocolando o processo EBA/UFRJ-2026-000005…
   ✅ Processo protocolado on-chain (0x2ccc51f3…). Status: EM ANÁLISE.
   ⏳ [3.6s] Conferindo a identidade civil do autor junto ao gov.br…
   ⏳ [8.4s] Pesquisando anterioridade entre as obras já registradas…
   ⏳ [12.6s] Analisando a obra e fundamentando o parecer…
   ⏳ [20.4s] Redigindo as cláusulas do contrato ricardiano…
   📄 Contrato ricardiano gravado em /registros/5.md (hash 0x532d0787…).
   ⏳ [25.2s] Avaliando a eficácia da titularidade por jurisdição…
   🌍 Reconhecida em: BR, PT, US | falta: CN
   ⏳ [30.0s] Averbando o registro na cadeia de titularidade…
   🏛️  Registro concluído em 30.0s (0x1ee092b9…). Status: REGISTRADA.
```

### Parecer com LLM de verdade

Sem chave, o agente usa um parecer determinístico de template e a demo roda normalmente.
Para que o parecer e o contrato ricardiano sejam escritos pelo Claude:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." >> packages/agent/.env
```

O agente usa `claude-opus-5` com saída estruturada. Qualquer falha (rede, chave, schema) cai no modo
offline — a demo nunca trava por causa do modelo. O contrato ricardiano diz, no rodapé, qual dos dois
caminhos gerou o texto.

---

## Arquitetura

```
packages/hardhat/contracts/
  GovBrIdentity.sol    vínculo carteira ↔ identidade civil (credencial EIP-712)
  ArtRegistry.sol      ERC-721 das obras + registro legal + jurisdições
  ArtMarketplace.sol   anúncio, custódia, entrega física e direito de sequência

packages/agent/src/
  index.ts       observa a chain e conduz o processo de ponta a ponta
  parecer.ts     chamada ao Claude com saída estruturada (+ fallback offline)
  ricardiano.ts  monta o contrato ricardiano e calcula o hash que vai para a chain
  demo.ts        prepara o cenário de demonstração
  ensaio.ts      verifica o login gov.br de ponta a ponta na rede escolhida

packages/nextjs/app/
  entrar/    login gov.br (mock)
  criar/     tokenização da obra
  acervo/    obras que detenho e obras de minha autoria
  mercado/   ofertas e compra
  pedidos/   custódia, confirmação de recebimento e cancelamento
  obra/[id]/ ficha completa: processo, contrato ricardiano, jurisdições
```

---

## Decisões jurídicas que viraram código

**Os 5% incidem sobre a valorização, não sobre o preço cheio.**
O art. 38 da Lei 9.610/98 dá ao autor o direito irrenunciável e inalienável de receber no mínimo 5%
*sobre o aumento do preço* verificado em cada revenda. Por isso o `ArtRegistry` **não** implementa o
ERC-2981 — aquele padrão calcula royalty sobre o valor total da venda e cobraria mais do que a lei
manda. Em vez disso há `resaleRoyalty(tokenId, vendedor, precoAnterior, precoNovo)`, que devolve zero
quando não houve valorização e quando quem vende é o próprio autor (a primeira alienação não gera
direito de sequência — o direito incide sobre a *revenda*).

**A obra só circula pelo marketplace.**
`ArtRegistry._update` bloqueia qualquer transferência que não venha do marketplace registrado. Fora
dele não há como apurar a mais-valia nem reter o percentual, e um direito que a lei declara
irrenunciável viraria letra morta na prática.

**A custódia espelha o parágrafo único do art. 38.**
A lei trata o vendedor como depositário do valor devido ao autor quando o direito não é pago no ato da
revenda. Aqui o contrato é o depositário: o autor é pago no mesmo instante em que o vendedor recebe.

**O agente lê estado, não escuta eventos.**
Seria natural usar filtros de evento para reagir ao `WorkSubmitted`, mas `eth_newFilter` /
`eth_getFilterChanges` dependem de estado guardado no nó: RPC público expira esses filtros ou nem
os oferece, e o nó de fork do Hardhat chega a derrubar o processo servindo esse método. O agente
lê `allWorks()` — uma chamada só, que já traz o status de cada obra — a cada poucos segundos. Usa
apenas `eth_call`, funciona igual em qualquer provedor e se recupera sozinho: obra que falhou
reaparece como submetida na volta seguinte. Em escala real isso viraria indexação off-chain.

**Artes visuais se registram na EBA/UFRJ, não na Biblioteca Nacional.**
A Escola de Belas Artes da UFRJ é o órgão competente para pintura, desenho, gravura, escultura e
fotografia; a FBN cuida das obras literárias. O agente protocola no órgão certo.

**O registro brasileiro não vale automaticamente em toda parte.**
Entre signatários da Convenção de Berna a proteção independe de formalidade. Mas a China, embora
signatária, condiciona na prática a tutela administrativa ao registro voluntário no CPCC — que este
processo não providencia. Cada obra registrada mostra a lista de países e marca, sem maquiagem, onde a
titularidade **não** é oponível.

---

## O que é simulado

- **gov.br**: a tela de login e o provedor de credenciais são um mock local. A credencial é assinada
  por uma chave de teste, não pelo gov.br real.
- **Processo administrativo**: o registro é sempre deferido. O parecer é redigido de verdade por um
  LLM, mas nenhum órgão é acionado.
- **Entrega física**: a confirmação de recebimento é um clique do comprador, sem rastreio de logística.
- **Pagamento**: ETH de teste (Sepolia) ou da chain local do Hardhat.
- **Armazenamento**: a imagem da obra e o texto do contrato ricardiano ficam em
  `packages/nextjs/public/`, gravados pela máquina que roda o agente. Em produção iriam para
  IPFS/Arweave; o que está na chain, e é o que importa juridicamente, são os hashes.

---

## Testes

```bash
yarn test
```

19 testes cobrindo o vínculo de identidade, o ciclo de vida do registro, o bloqueio de circulação de
obra não registrada, a custódia e — o ponto central — a matemática do direito de sequência: 5% sobre a
mais-valia, zero na primeira venda do autor, zero quando a obra é revendida sem valorização.

---

## Contas da demo

Na chain local, o `yarn demo` usa contas determinísticas do Hardhat — as chaves privadas aparecem no
terminal do `yarn chain` e podem ser importadas no MetaMask. Na Sepolia, as chaves vêm do
`packages/agent/.env` (geradas pelo `yarn contas`).

| Papel | Conta | Pessoa |
| --- | --- | --- |
| Emissor gov.br | #1 | provedor de identidade |
| Agente jurídico | #2 | conduz os processos |
| Artista | #3 | Marina Duarte Alencar |
| Colecionador | #4 | Ricardo Bastos Lemos |
| Galeria | #5 | Helena Prado Vasconcelos |

Para entrar pela interface com outra carteira, use um CPF com dígito verificador válido — o mock do
gov.br recusa número inventado.

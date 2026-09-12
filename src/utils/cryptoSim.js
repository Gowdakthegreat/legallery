/**
 * Utility for Cryptographic Operations, SHA-256 and Ricardian Contract Generation
 */

export async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return '0x' + hashHex;
}

export function formatAddress(address) {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatUSDC(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount).replace('$', '') + ' USDC';
}

export function formatBRL(usdAmount, rate = 5.45) {
  const brl = usdAmount * rate;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(brl);
}

/**
 * Generates the formal Ricardian Contract legal text according to Brazilian Law
 * (Lei 9.610/98 - Direitos Autorais and Lei 14.063/20 - Assinatura Eletrônica Avançada gov.br)
 */
export function generateRicardianContractText({
  artworkTitle,
  artistName,
  artistCpf,
  buyerName = 'Comprador Habilitado',
  buyerCpf = '000.000.000-00',
  technique,
  dimensions,
  weight,
  nfcSerial,
  priceUsdc,
  tokenId,
  contractAddress,
  network = 'Base L2 (Ethereum Rollup)'
}) {
  return `INSTRUMENTO PARTICULAR DE COMPRA E VENDA DE OBRA DE ARTE FÍSICA ORIGINAL COM TOKENIZAÇÃO EM BLOCKCHAIN, CESSÃO DE DIREITOS PATRIMONIAIS E CLÁUSULA RICARDIANA
Regido pela Lei Federal nº 10.406/2002 (Código Civil), Lei Federal nº 9.610/1998 (Direitos Autorais) e Lei Federal nº 14.063/2020 (Assinatura Eletrônica Avançada).

CLÁUSULA PRIMEIRA - DAS PARTES
1.1. VENDEDOR/AUTOR: ${artistName}, titular do CPF nº ${artistCpf}, usuário autenticado com fé pública via portal GOV.BR.
1.2. COMPRADOR/ADQUIRENTE: ${buyerName}, titular do CPF nº ${buyerCpf}, usuário autenticado com fé pública via portal GOV.BR.
1.3. INTERMEDIADORA: LeGallery Tecnologia e Protocolos RWA Ltda., operadora do Smart Contract de Custódia (Escrow).

CLÁUSULA SEGUNDA - DO OBJETO E DA OBRA FÍSICA
2.1. O presente contrato tem por objeto a compra e venda da OBRA FÍSICA ORIGINAL intitulada "${artworkTitle}", de autoria exclusiva do VENDEDOR.
2.2. Especificações da Obra Física:
    - Técnica: ${technique}
    - Dimensões: ${dimensions}
    - Peso aproximado: ${weight}
    - Dispositivo Físico de Autenticidade (NFC Tamper-Proof): Serial ${nfcSerial} (Padrão NTAG 424 DNA Criptográfico fixado no verso da obra).

CLÁUSULA TERCEIRA - DA TOKENIZAÇÃO E DO GÊMEO DIGITAL (DIGITAL TWIN)
3.1. A referida obra física encontra-se acoplada de forma indissolúvel ao Token ERC-721 registrado na rede ${network}:
    - Smart Contract: ${contractAddress}
    - Token ID: #${tokenId}
3.2. PRINCÍPIO DA INSEPARABILIDADE: A titularidade dos direitos patrimoniais da obra física pertence, de forma exclusiva, ao detentor da custódia do Token #${tokenId} na blockchain. A alienação física desprovida da transferência do token, ou vice-versa, constitui ilícito civil e violação aos arts. 421 e 422 do Código Civil (Boa-fé objetiva).

CLÁUSULA QUARTA - DO PREÇO, PAGAMENTO E ESCROW
4.1. O preço ajustado é de ${formatUSDC(priceUsdc)}, a ser depositado pelo COMPRADOR no Smart Contract de Custódia (Escrow).
4.2. Os valores permanecerão bloqueados na blockchain até que a transportadora entregue o exemplar físico e o COMPRADOR valide a leitura da etiqueta NFC nº ${nfcSerial}.

CLÁUSULA QUINTA - DO DIREITO DE SEQUÊNCIA (ART. 85 DA LEI 9.610/98)
5.1. Fica expressamente pactuado que em toda alienação subsequente desta obra no mercado secundário, o Smart Contract reterá e repassará automaticamente 5% (cinco por cento) sobre o aumento de valor diretamente para a carteira do AUTOR original, em cumprimento ao Direito de Sequência.

CLÁUSULA SEXTA - DA ASSINATURA ELETRÔNICA GOV.BR E VINCULAÇÃO CRIPTOGRÁFICA
6.1. As partes reconhecem a plena validade, eficácia jurídica e presunção de autenticidade deste documento assinado eletronicamente via GOV.BR (Nível Prata ou Ouro), nos termos do Art. 5º, inciso II da Lei nº 14.063/2020.
6.2. O Hash Criptográfico SHA-256 gerado a partir da íntegra deste instrumento fica imutavelmente cravado nos metadados do Token na rede ${network}.`;
}

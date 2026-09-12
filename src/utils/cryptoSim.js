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

export function formatETH(amount) {
  const num = Number(amount) || 0;
  return `${num.toFixed(2)} ETH`;
}

/**
 * Generates the formal Ricardian Contract legal text according to Brazilian Law
 * (Federal Law 9,610/98 - Copyright Law and Federal Law 14,063/20 - Advanced Electronic Signature gov.br)
 */
export function generateRicardianContractText({
  artworkTitle,
  artistName,
  artistCpf,
  buyerName = 'Authorized Collector',
  buyerCpf = '000.000.000-00',
  technique,
  dimensions,
  weight,
  nfcSerial,
  priceEth,
  tokenId,
  contractAddress,
  network = 'Ethereum (Base Layer 2)'
}) {
  return `PRIVATE AGREEMENT FOR THE PURCHASE AND SALE OF ORIGINAL PHYSICAL ARTWORK WITH BLOCKCHAIN REGISTRATION, ASSIGNMENT OF ECONOMIC RIGHTS, AND RICARDIAN CLAUSE
Governed by Brazilian Federal Law No. 10,406/2002 (Civil Code), Federal Law No. 9,610/1998 (Copyright Law), and Federal Law No. 14,063/2020 (Advanced Electronic Signature).

CLAUSE ONE - THE PARTIES
1.1. SELLER/AUTHOR: ${artistName}, holder of Tax ID/CPF No. ${artistCpf}, user officially authenticated with public faith via the GOV.BR portal.
1.2. BUYER/ACQUIRER: ${buyerName}, holder of Tax ID/CPF No. ${buyerCpf}, user officially authenticated with public faith via the GOV.BR portal.
1.3. INTERMEDIARY: LeGallery Fine Art & Technology Ltd., operator of the Smart Contract Escrow protocol.

CLAUSE TWO - SUBJECT MATTER AND PHYSICAL ARTWORK
2.1. The object of this agreement is the purchase and sale of the ORIGINAL PHYSICAL ARTWORK entitled "${artworkTitle}", created exclusively by the SELLER.
2.2. Physical Specifications of the Artwork:
    - Technique & Medium: ${technique}
    - Dimensions: ${dimensions}
    - Approximate Weight: ${weight}
    - Physical Authenticity Device (Tamper-Proof NFC): Serial ${nfcSerial} (Cryptographic NTAG 424 DNA standard affixed to the back of the artwork).

CLAUSE THREE - TOKENIZATION AND DIGITAL TWIN
3.1. Said physical artwork is indissolubly coupled to the ERC-721 Token registered on the ${network} network:
    - Smart Contract: ${contractAddress}
    - Token ID: #${tokenId}
3.2. PRINCIPLE OF INSEPARABILITY: Ownership of the economic rights of the physical artwork belongs exclusively to the lawful holder of Token #${tokenId} on the blockchain. Any physical transfer of the artwork without the corresponding on-chain token transfer, or vice-versa, constitutes a civil offense and a breach of Arts. 421 and 422 of the Civil Code (Objective Good Faith).

CLAUSE FOUR - PRICE, PAYMENT, AND ESCROW
4.1. The agreed purchase price is ${formatETH(priceEth)}, to be deposited by the BUYER into the Smart Contract Escrow.
4.2. Funds shall remain locked on-chain until the certified fine art logistics carrier delivers the physical piece and the BUYER verifies the NFC tag No. ${nfcSerial}.

CLAUSE FIVE - RESALE ROYALTY / DROIT DE SUITE (ART. 85 OF LAW 9,610/98)
5.1. It is expressly agreed that upon any subsequent resale of this artwork on the secondary market, the Smart Contract shall automatically retain and remit 5% (five percent) of any price increase directly to the original AUTHOR'S wallet, pursuant to the Resale Royalty Right (Droit de Suite).

CLAUSE SIX - GOV.BR ELECTRONIC SIGNATURE & CRYPTOGRAPHIC ANCHORING
6.1. The parties acknowledge the full legal validity, binding enforceability, and legal presumption of authenticity of this document electronically executed via GOV.BR (Silver or Gold Level), pursuant to Art. 5, Item II of Federal Law No. 14,063/2020.
6.2. The SHA-256 Cryptographic Hash generated from the full text of this agreement is immutably anchored within the Token metadata on the ${network} network.`;
}

import { formatETH, generateRicardianContractText, sha256 } from '../utils/cryptoSim.js';

export async function renderArtworkDetailModal(art, activeTab = 'legal', customContractText = null) {
  const initialText = generateRicardianContractText({
    artworkTitle: art.title,
    artistName: art.artist,
    artistCpf: art.artistCpf,
    technique: art.technique,
    dimensions: art.dimensions,
    weight: art.weight,
    nfcSerial: art.nfcSerial,
    priceEth: art.priceEth,
    tokenId: art.tokenId,
    contractAddress: art.contractAddress,
    network: art.network
  });

  const currentText = customContractText !== null ? customContractText : initialText;
  const originalHash = await sha256(initialText);
  const currentHash = await sha256(currentText);
  const isViolated = originalHash !== currentHash;

  return `
    <div class="modal-backdrop" id="artwork-detail-modal">
      <div class="modal-content" style="max-width: 1080px;">
        <button class="modal-close-btn" id="btn-close-detail" title="Close">✕</button>

        <div class="detail-modal-layout">
          <!-- Visual Column / Physical Artwork -->
          <div class="detail-modal-visual">
            <img src="${art.image}" alt="${art.title}" />
            <div style="position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); padding: 0.85rem 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 0.75rem; font-weight: 700; color: #fff;">Physical NTAG 424 DNA Chip</div>
                <div style="font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono);">${art.nfcSerial.split(' - ')[0]}</div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-test-nfc-inline" data-id="${art.id}">
                Test NFC
              </button>
            </div>
          </div>

          <!-- Info, Ricardian Contract & Actions Column -->
          <div class="detail-modal-info">
            <div>
              <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                <span class="badge badge-l2">${art.network}</span>
                <span class="badge badge-gold">Token #${art.tokenId}</span>
              </div>
              <h2 style="font-size: 1.9rem; margin-bottom: 0.3rem;">${art.title}</h2>
              <p style="font-size: 0.92rem; color: #cbd5e1;">
                By <strong>${art.artist}</strong> (${art.artistLocation})
              </p>
            </div>

            <!-- Physical Specs Grid -->
            <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: 0.82rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Technique</span>
                <strong style="color: #fff;">${art.technique}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Dimensions & Weight</span>
                <strong style="color: #fff;">${art.dimensions} (${art.weight})</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Year of Creation</span>
                <strong style="color: #fff;">${art.year}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Shipping & Insurance</span>
                <strong style="color: var(--gov-green-light);">Comprehensive Insurance Included</strong>
              </div>
            </div>

            <!-- Interactive Ricardian Contract Block -->
            <div class="ricardian-box">
              <div class="ricardian-header">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <strong style="font-size: 0.82rem; color: #fff;">Bilateral Ricardian Contract</strong>
                </div>
                <div class="ricardian-tabs">
                  <button class="ricardian-tab-btn ${activeTab === 'legal' ? 'active' : ''}" data-rtab="legal">Legal Text</button>
                  <button class="ricardian-tab-btn ${activeTab === 'machine' ? 'active' : ''}" data-rtab="machine">Smart Contract / JSON</button>
                  <button class="ricardian-tab-btn ${activeTab === 'tamper' ? 'active' : ''}" data-rtab="tamper">Anti-Fraud Audit</button>
                </div>
              </div>

              <div class="ricardian-body">
                ${activeTab === 'legal' ? `
                  <div class="ricardian-legal-text">
                    <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
                      <div style="font-size: 0.72rem; color: var(--gold-secondary); font-family: var(--font-sans); letter-spacing: 0.08em; text-transform: uppercase;">Federative Republic of Brazil • Registered Agreement</div>
                      <h4>BILATERAL AGREEMENT FOR THE TRANSFER OF PHYSICAL ARTWORK</h4>
                      <div style="font-size: 0.68rem; color: var(--gov-green-light); font-family: var(--font-mono);">Cryptographic Key: ${originalHash.substring(0, 24)}...</div>
                    </div>
                    <p style="white-space: pre-line;">${initialText}</p>
                  </div>
                ` : activeTab === 'machine' ? `
                  <div class="ricardian-code-text">
{
  "protocol": "LeGallery-Ricardian-v1.0",
  "blockchain": "Ethereum (Base Layer 2)",
  "standard": "ERC-721 + EIP-2981 (Royalties)",
  "token_id": ${art.tokenId},
  "contract_address": "${art.contractAddress}",
  "price_eth": ${art.priceEth},
  "digital_twin": {
    "physical_item": "${art.title}",
    "artist": "${art.artist}",
    "nfc_chip_uid": "${art.nfcSerial.split(' - ')[0]}",
    "sha256_legal_contract": "${originalHash}"
  },
  "legal_enforcement": {
    "jurisdiction": "Brazil",
    "signature_provider": "gov.br (Federal Law 14,063/2020)",
    "copyright_law": "Federal Law 9,610/1998 (Arts. 28, 49, 85)",
    "resale_royalty_percentage": 5.0
  }
}
                  </div>
                ` : `
                  <div>
                    <p style="font-size: 0.8rem; color: var(--gold-secondary); margin-bottom: 0.5rem;">
                      💡 <strong>Integrity Test:</strong> Edit or type any character in the contract text below to watch the SHA-256 hash change instantly. The blockchain rejects any discrepancies.
                    </p>
                    <textarea id="tamper-textarea" style="width: 100%; height: 160px; font-size: 0.78rem; font-family: var(--font-mono);">${currentText}</textarea>
                  </div>
                `}
              </div>

              <!-- Signature Strip and SHA-256 Hash -->
              <div class="hash-signature-strip ${isViolated ? 'violated' : ''}">
                <div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">
                    ${isViolated ? '⚠️ FRAUD DETECTED! Hash does not match the Blockchain' : '✅ Valid Hash & Bound to Smart Contract'}
                  </div>
                  <div style="font-family: var(--font-mono); font-size: 0.72rem; color: ${isViolated ? 'var(--status-danger)' : 'var(--gov-green-light)'}; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                    <span>${currentHash.substring(0, 24)}...${currentHash.substring(currentHash.length - 8)}</span>
                    <button class="btn-copy-hash" data-copy="${currentHash}" title="Copy full hash">Copy</button>
                  </div>
                </div>

                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <button class="btn btn-secondary btn-sm" id="btn-export-pdf" title="Export legal agreement as PDF">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Price & Acquisition Block -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border-subtle); margin-top: auto;">
              <div>
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Physical Artwork Value</div>
                <div style="font-size: 1.7rem; font-weight: 800; color: #fff;">
                  ${formatETH(art.priceEth)}
                </div>
              </div>

              <div style="display: flex; gap: 0.75rem;">
                <button class="btn btn-gold btn-lg" id="btn-start-escrow" data-id="${art.id}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Acquire via Escrow (${formatETH(art.priceEth)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

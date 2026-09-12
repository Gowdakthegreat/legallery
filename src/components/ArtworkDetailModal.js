import { formatUSDC, formatBRL, generateRicardianContractText, sha256 } from '../utils/cryptoSim.js';

export async function renderArtworkDetailModal(art, activeTab = 'legal', customContractText = null, currency = 'USDC') {
  const initialText = generateRicardianContractText({
    artworkTitle: art.title,
    artistName: art.artist,
    artistCpf: art.artistCpf,
    technique: art.technique,
    dimensions: art.dimensions,
    weight: art.weight,
    nfcSerial: art.nfcSerial,
    priceUsdc: art.priceUsdc,
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
      <div class="modal-content" style="max-width: 1100px;">
        <button class="modal-close-btn" id="btn-close-detail" title="Fechar">✕</button>

        <div class="detail-modal-layout">
          <!-- Coluna Visual / Obra Física -->
          <div class="detail-modal-visual">
            <img src="${art.image}" alt="${art.title}" />
            <div style="position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span class="nfc-radar" style="width: 10px; height: 10px; background: var(--gov-green-light); border-radius: 50%;"></span>
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: #fff;">Chip Físico NTAG 424 DNA</div>
                  <div style="font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono);">${art.nfcSerial.split(' - ')[0]}</div>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-test-nfc-inline" data-id="${art.id}">
                Testar NFC
              </button>
            </div>
          </div>

          <!-- Coluna Informações, Contrato e Ações -->
          <div class="detail-modal-info">
            <div>
              <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                <span class="badge badge-gov">gov.br ${art.govBrStatus}</span>
                <span class="badge badge-l2">${art.network}</span>
                <span class="badge badge-gold">Token #${art.tokenId}</span>
              </div>
              <h2 style="font-size: 1.9rem; margin-bottom: 0.3rem;">${art.title}</h2>
              <p style="font-size: 0.92rem; color: #cbd5e1;">
                Por <strong>${art.artist}</strong> • CPF: <span style="font-family: var(--font-mono);">${art.artistCpf}</span> • ${art.artistLocation}
              </p>
            </div>

            <!-- Ficha Técnica Física -->
            <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: 0.82rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Técnica</span>
                <strong style="color: #fff;">${art.technique}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Dimensões & Peso</span>
                <strong style="color: #fff;">${art.dimensions} (${art.weight})</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Ano & Proveniência</span>
                <strong style="color: #fff;">${art.year} • Registro Original</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Transporte e Custódia</span>
                <strong style="color: var(--gov-green-light);">Seguro Total Incluso</strong>
              </div>
            </div>

            <!-- Selo Oficial gov.br e Ação de Exportar PDF -->
            <div class="gov-certificate-seal">
              <div style="display: flex; align-items: center; gap: 0.65rem;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gov-green-light)" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                <div class="gov-certificate-meta">
                  <span>Fé Pública • Assinatura Avançada gov.br (Lei 14.063/20)</span>
                  <span>Autenticação com Presunção Legal de Autoria e Validade Inconteste</span>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-export-pdf" title="Exportar minuta oficial em PDF">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Baixar Minuta</span>
              </button>
            </div>

            <!-- Bloco do Contrato Ricardiano Interativo -->
            <div class="ricardian-box">
              <div class="ricardian-header">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <strong style="font-size: 0.82rem; color: #fff;">Contrato Ricardiano (Dupla Validade)</strong>
                </div>
                <div class="ricardian-tabs">
                  <button class="ricardian-tab-btn ${activeTab === 'legal' ? 'active' : ''}" data-rtab="legal">1. Texto Humano (Leis)</button>
                  <button class="ricardian-tab-btn ${activeTab === 'machine' ? 'active' : ''}" data-rtab="machine">2. Máquina / JSON</button>
                  <button class="ricardian-tab-btn ${activeTab === 'tamper' ? 'active' : ''}" data-rtab="tamper">3. Testar Anti-Fraude</button>
                </div>
              </div>

              <div class="ricardian-body">
                ${activeTab === 'legal' ? `
                  <div class="ricardian-legal-text">
                    <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
                      <div style="font-size: 0.72rem; color: var(--gold-secondary); font-family: var(--font-sans); letter-spacing: 0.08em; text-transform: uppercase;">República Federativa do Brasil • Registro Ricardiano RWA</div>
                      <h4>CONTRATO BILATERAL DE ALIENAÇÃO DE ARTE FÍSICA</h4>
                      <div style="font-size: 0.68rem; color: var(--gov-green-light); font-family: var(--font-mono);">Chave de Validação: ${originalHash.substring(0, 20)}...</div>
                    </div>
                    <p style="white-space: pre-line;">${initialText}</p>
                  </div>
                ` : activeTab === 'machine' ? `
                  <div class="ricardian-code-text">
{
  "protocol": "LeGallery-Ricardian-v1.0",
  "blockchain": "Base L2 (ChainId: 8453)",
  "standard": "ERC-721 + EIP-2981 (Royalties)",
  "token_id": ${art.tokenId},
  "contract_address": "${art.contractAddress}",
  "digital_twin": {
    "physical_item": "${art.title}",
    "artist": "${art.artist}",
    "artist_cpf_hash": "0x78a9c...19b",
    "nfc_chip_uid": "${art.nfcSerial.split(' - ')[0]}",
    "sha256_legal_contract": "${originalHash}"
  },
  "legal_enforcement": {
    "jurisdiction": "Brasil",
    "signature_provider": "gov.br (Lei 14.063/2020)",
    "copyright_law": "Lei 9.610/1998 (Arts. 28, 49, 85)",
    "resale_royalty_percentage": 5.0
  }
}
                  </div>
                ` : `
                  <div>
                    <p style="font-size: 0.8rem; color: var(--gold-secondary); margin-bottom: 0.5rem;">
                      💡 <strong>Experimento Interativo:</strong> Altere ou digite qualquer caractere no contrato abaixo para ver o Hash SHA-256 mudar instantaneamente. A blockchain rejeita qualquer tentativa de fraude!
                    </p>
                    <textarea id="tamper-textarea" style="width: 100%; height: 160px; font-size: 0.78rem; font-family: var(--font-mono);">${currentText}</textarea>
                  </div>
                `}
              </div>

              <!-- Strip de Assinatura e Hash SHA-256 -->
              <div class="hash-signature-strip ${isViolated ? 'violated' : ''}">
                <div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">
                    ${isViolated ? '⚠️ FRAUDE DETECTADA! Hash não confere com a Blockchain' : '✅ Hash Válido & Vinculado à Base L2'}
                  </div>
                  <div style="font-family: var(--font-mono); font-size: 0.72rem; color: ${isViolated ? 'var(--status-danger)' : 'var(--gov-green-light)'}; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                    <span>${currentHash.substring(0, 24)}...${currentHash.substring(currentHash.length - 8)}</span>
                    <button class="btn-copy-hash" data-copy="${currentHash}" title="Copiar hash completo">Copiar</button>
                  </div>
                </div>

                <div style="text-align: right;">
                  <span class="badge ${isViolated ? 'badge-escrow' : 'badge-gov'}" style="font-size: 0.7rem;">
                    ${isViolated ? 'HASH QUEBRADO' : 'gov.br Assinatura Válida'}
                  </span>
                </div>
              </div>
            </div>

            <!-- Bloco de Preço e Aquisição -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border-subtle); margin-top: auto;">
              <div>
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Valor da Obra Física em Escrow</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: #fff;">
                  ${currency === 'BRL' ? formatBRL(art.priceUsdc) : formatUSDC(art.priceUsdc)}
                </div>
                <div style="font-size: 0.8rem; color: var(--gold-secondary); font-weight: 500;">
                  ${currency === 'BRL' ? '≈ ' + formatUSDC(art.priceUsdc) : '≈ ' + formatBRL(art.priceUsdc)}
                </div>
              </div>

              <div style="display: flex; gap: 0.75rem;">
                <button class="btn btn-gold btn-lg" id="btn-start-escrow" data-id="${art.id}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Adquirir com Escrow USDC</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderNfcScannerModal(artworks, selectedArtId = null, isScanning = false) {
  const art = artworks.find(a => a.id === selectedArtId) || artworks[0];

  return `
    <div class="modal-backdrop" id="nfc-modal">
      <div class="modal-content" style="max-width: 850px;">
        <button class="modal-close-btn" id="btn-close-nfc">✕</button>

        <div style="padding: 2.25rem;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h2 style="font-size: 1.8rem; margin-bottom: 0.3rem;">Verificador de Autenticidade NFC</h2>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Auditoria de integridade física e validação de titularidade on-chain.
            </p>
          </div>

          <!-- Seleção da Obra para Simulação -->
          <div style="margin-bottom: 1.5rem; background: var(--bg-tertiary); padding: 1rem 1.25rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <label style="font-size: 0.85rem; color: #cbd5e1;">Selecionar Obra Física para Testar:</label>
            <select id="nfc-artwork-selector" style="min-width: 320px; background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-md); color: #fff; padding: 0.5rem 0.85rem;">
              ${artworks.map(a => `
                <option value="${a.id}" ${a.id === art.id ? 'selected' : ''}>
                  ${a.title} (${a.artist})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Card de Simulação de Leitura NFC -->
          <div style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem;">
            <!-- Painel do NFC com Feixe de Scan -->
            <div class="nfc-scan-beam-container ${isScanning ? 'nfc-scan-beam-active' : ''}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1.5rem; background: #080a0f; border-radius: var(--radius-md); border: 1px solid ${isScanning ? 'var(--gov-green-light)' : 'var(--border-medium)'};">
              <div style="width: 64px; height: 64px; margin-bottom: 1.25rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gov-green-light)" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </div>

              <strong style="color: #fff; font-size: 0.95rem; margin-bottom: 0.25rem;">${isScanning ? 'Lendo Assinatura Criptográfica...' : 'Chip Físico Conectado'}</strong>
              <p style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--gov-green-light); margin-bottom: 1.25rem;">
                ${art.nfcSerial.split(' - ')[0]}
              </p>

              <button class="btn btn-primary btn-sm" id="btn-trigger-nfc-scan" ${isScanning ? 'disabled' : ''}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                <span>${isScanning ? 'Escaneando...' : 'Simular Nova Leitura'}</span>
              </button>
            </div>

            <!-- Resultado da Auditoria -->
            <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.82rem;">
              <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 0.85rem; border-radius: var(--radius-md);">
                <div style="font-weight: 700; color: var(--gov-green-light); margin-bottom: 0.25rem;">
                  ✓ EXEMPLAR FÍSICO AUTÊNTICO
                </div>
                <div style="color: #cbd5e1;">Assinatura criptográfica dinâmica confirmada na rede Ethereum.</div>
              </div>

              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Obra & Autor</span>
                <strong style="color: #fff; font-size: 0.95rem;">${art.title}</strong> por ${art.artist}
              </div>

              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Token ID & Smart Contract</span>
                <span style="font-family: var(--font-mono); color: var(--base-blue-light);">${art.contractAddress} • Token #${art.tokenId}</span>
              </div>

              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Hash do Contrato Ricardiano (SHA-256)</span>
                <span style="font-family: var(--font-mono); color: var(--gold-secondary); font-size: 0.75rem;">
                  0x8f2d79c41b8026771e3b6e7929424c3a218f...91e3
                </span>
              </div>

              <!-- Histórico de Proveniência -->
              <div style="margin-top: 0.5rem; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
                <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase; margin-bottom: 0.4rem;">Cadeia de Custódia</span>
                <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                  ${art.provenance.map(p => `
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8;">
                      <span>• ${p.event} (${p.date})</span>
                      <strong style="color: #fff; font-family: var(--font-mono);">${p.tx}</strong>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

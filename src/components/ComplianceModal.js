export function renderComplianceModal() {
  return `
    <div class="modal-backdrop" id="compliance-modal">
      <div class="modal-content" style="max-width: 900px;">
        <button class="modal-close-btn" id="btn-close-compliance">✕</button>

        <div style="padding: 2.5rem;">
          <div style="text-align: center; margin-bottom: 2.25rem;">
            <h2 style="font-size: 1.9rem; margin-bottom: 0.4rem;">Legal & Tax Compliance</h2>
            <p style="font-size: 0.92rem; color: var(--text-secondary); max-width: 680px; margin: 0 auto;">
              How LeGallery bridges Brazilian legislation with Ethereum Smart Contracts to ensure tax transparency and indisputable ownership.
            </p>
          </div>

          <!-- Legal Pillars Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <!-- Pillar 1: IN RFB 1888/2019 -->
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--base-blue-muted); display: flex; align-items: center; justify-content: center; color: var(--base-blue-light);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <h4 style="font-size: 1rem; color: #fff;">1. Federal Revenue Tax Compliance</h4>
                  <span style="font-size: 0.72rem; color: var(--base-blue-light); font-weight: 600;">IN RFB No. 1888/2019</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.55;">
                All Ethereum on-chain transactions are anchored to CPFs and CNPJs/tax IDs authenticated via <strong>gov.br</strong>. The platform automatically generates tax statements for income tax declarations and regular reporting to the Brazilian Federal Revenue.
              </p>
            </div>

            <!-- Pillar 2: Federal Law 14,063/2020 gov.br -->
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--gov-green-muted); display: flex; align-items: center; justify-content: center; color: var(--gov-green-light);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <h4 style="font-size: 1rem; color: #fff;">2. Public Faith & Electronic Signature</h4>
                  <span style="font-size: 0.72rem; color: var(--gov-green-light); font-weight: 600;">Federal Law No. 14,063/2020</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.55;">
                The Advanced Electronic Signature from <strong>gov.br (Silver or Gold Level)</strong> grants full legal validity to the Ricardian Contract with a legal presumption of truth. No traditional notary required: cryptographic proof holds full executive enforceability before the judiciary.
              </p>
            </div>

            <!-- Pillar 3: Federal Law 9,610/98 (Copyright Law) -->
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--gold-muted); display: flex; align-items: center; justify-content: center; color: var(--gold-secondary);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <h4 style="font-size: 1rem; color: #fff;">3. Copyright & Resale Royalty</h4>
                  <span style="font-size: 0.72rem; color: var(--gold-secondary); font-weight: 600;">Federal Law No. 9,610/1998 (Arts. 49 & 85)</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.55;">
                Article 85 guarantees <strong>5% participation to the artist on any subsequent resale appreciation</strong>. The Smart Contract executes this disbursement automatically and transparently to the original author.
              </p>
            </div>

            <!-- Pillar 4: Civil Code & Inseparability -->
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(148, 163, 184, 0.1); display: flex; align-items: center; justify-content: center; color: #cbd5e1;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <div>
                  <h4 style="font-size: 1rem; color: #fff;">4. Principle of Inseparability</h4>
                  <span style="font-size: 0.72rem; color: #cbd5e1; font-weight: 600;">Arts. 421 and 422 Civil Code</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.55;">
                The Ricardian Contract mandates that lawful possession of the original physical artwork is inseparable from the token registered on blockchain. Any decoupled physical sale constitutes a breach of objective good faith and civil fraud.
              </p>
            </div>
          </div>

          <!-- Liquidation Split -->
          <div class="split-card">
            <h4 style="font-size: 1.05rem; color: #fff; margin-bottom: 0.5rem;">Automated Payment Disbursement (Smart Contract Split)</h4>
            <div class="split-bar">
              <div class="split-artist" style="width: 90%;" title="90% Artist"></div>
              <div class="split-platform" style="width: 5%;" title="5% Platform"></div>
              <div class="split-royalties" style="width: 5%;" title="5% Resale Royalty Reserve"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; flex-wrap: wrap; gap: 0.5rem;">
              <span style="color: #60a5fa;">● <strong>90%</strong> Direct Remittance to Artist</span>
              <span style="color: var(--gold-secondary);">● <strong>5%</strong> LeGallery Platform Brokerage Fee</span>
              <span style="color: var(--gov-green-light);">● <strong>5%</strong> Resale Royalty Reserve (Art. 85 Copyright Law)</span>
            </div>
          </div>

          <div style="margin-top: 2rem; text-align: center;">
            <button class="btn btn-secondary" id="btn-close-compliance-sub">
              Close and Return to Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

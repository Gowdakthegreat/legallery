import { formatETH } from '../utils/cryptoSim.js';

export function renderEscrowSimulatorModal(art, currentStep = 1, escrowState = {}) {
  const steps = [
    { num: 1, title: 'ETH Deposit', desc: 'Smart Contract Escrow' },
    { num: 2, title: 'gov.br Signature', desc: 'Digital Public Faith' },
    { num: 3, title: 'Physical Transit', desc: 'Insured Logistics' },
    { num: 4, title: 'NFC Scan & Release', desc: 'Automated Split' }
  ];

  const artistShare = art.priceEth * 0.90;
  const platformShare = art.priceEth * 0.05;
  const royaltyReserve = art.priceEth * 0.05;

  return `
    <div class="modal-backdrop" id="escrow-modal">
      <div class="modal-content" style="max-width: 800px;">
        <button class="modal-close-btn" id="btn-close-escrow">✕</button>

        <div style="padding: 2.25rem;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h2 style="font-size: 1.8rem; margin-bottom: 0.3rem;">Escrow Custody: ${art.title}</h2>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Value: <strong style="color: #fff;">${formatETH(art.priceEth)}</strong>
            </p>
          </div>

          <!-- Stepper Visual -->
          <div class="stepper-nav">
            ${steps.map(s => `
              <div class="step-node ${currentStep === s.num ? 'active' : ''} ${currentStep > s.num ? 'completed' : ''}">
                <div class="step-circle">
                  ${currentStep > s.num ? '✓' : s.num}
                </div>
                <div class="step-label">${s.title}</div>
              </div>
            `).join('')}
          </div>

          <!-- Current Step Content -->
          <div style="background: var(--bg-tertiary); padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-medium); min-height: 260px; display: flex; flex-direction: column; justify-content: space-between;">
            ${currentStep === 1 ? `
              <div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--base-blue-muted); display: flex; align-items: center; justify-content: center; color: var(--base-blue-light);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.15rem; color: #fff;">Step 1: Lock Funds in ETH</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">Funds remain locked under cryptographic custody in the contract until physical delivery is verified.</p>
                  </div>
                </div>

                <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.5rem; font-size: 0.88rem;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Buyer Wallet:</span>
                    <span style="font-family: var(--font-mono); color: #fff;">0x71C...49b2</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Escrow Custody Contract:</span>
                    <span style="font-family: var(--font-mono); color: var(--base-blue-light);">0xEscrowBaseL2...999</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Amount to Lock:</span>
                    <span style="font-weight: 700; color: #fff;">${formatETH(art.priceEth)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Estimated Network Gas:</span>
                    <span style="color: var(--gov-green-light); font-weight: 600;">0.000008 ETH</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-primary btn-lg" id="btn-escrow-deposit">
                  <span>Authorize & Lock ${formatETH(art.priceEth)}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            ` : currentStep === 2 ? `
              <div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--gov-green-muted); display: flex; align-items: center; justify-content: center; color: var(--gov-green-light);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.15rem; color: #fff;">Step 2: Advanced Electronic Signature (gov.br)</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">Bilateral execution with full legal validity and official public faith (Federal Law 14,063/20).</p>
                  </div>
                </div>

                <div style="background: #0f172a; padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid #1e3a8a; margin-bottom: 1rem;">
                  <p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.65rem;">
                    You are signing the <strong>Bilateral Agreement for the Purchase and Sale of Physical Artwork</strong>. The generated SHA-256 hash is anchored to your official digital identity.
                  </p>
                  <div style="font-size: 0.78rem; font-family: var(--font-mono); color: #93c5fd; background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: var(--radius-sm);">
                    Signatory: Leonardo Albuquerque | CPF/Tax ID: ***.492.818-72 | Badge: Gold Level Trust
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-gold btn-lg" id="btn-escrow-sign-gov">
                  <span>Sign via gov.br & Bind to Smart Contract</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            ` : currentStep === 3 ? `
              <div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; color: #fbbf24;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.15rem; color: #fff;">Step 3: Physical Artwork Transit</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">The certified fine art courier has collected the piece from the artist’s studio with insurance and condition report.</p>
                  </div>
                </div>

                <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1rem; font-size: 0.85rem;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Tracking Code:</span>
                    <strong style="font-family: var(--font-mono); color: var(--gold-secondary);">LG-BR-994821034-SP</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Shipping Status:</span>
                    <span style="color: #60a5fa; font-weight: 600;">In transit with comprehensive insurance</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Estimated Delivery:</span>
                    <span style="color: #fff; font-weight: 600;">2 business days</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-secondary btn-lg" id="btn-escrow-simulate-arrival">
                  <span>Simulate Artwork Arrival at Destination</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            ` : `
              <div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--gov-green-muted); display: flex; align-items: center; justify-content: center; color: var(--gov-green-light);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.15rem; color: #fff;">Step 4: NFC Verification & Settlement Split</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">Physical tag tap verified. The digital twin token has been transferred and escrow funds disbursed.</p>
                  </div>
                </div>

                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                    <strong style="color: var(--gov-green-light); font-size: 0.9rem;">
                      ✓ NTAG 424 DNA NFC Tag Confirmed
                    </strong>
                    <span class="badge badge-l2">Token #${art.tokenId} Transferred</span>
                  </div>

                  <div style="font-size: 0.82rem; color: #cbd5e1;">
                    <div style="margin-bottom: 0.4rem; font-weight: 600; color: #fff;">Automated Smart Contract Disbursement:</div>
                    <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                      <span>• Artist (${art.artist} - 90%):</span>
                      <strong style="color: #fff;">${formatETH(artistShare)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                      <span>• LeGallery Platform Brokerage Fee (5%):</span>
                      <strong style="color: var(--gold-secondary);">${formatETH(platformShare)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                      <span>• Resale Royalty Reserve Art. 85 (5%):</span>
                      <strong style="color: #60a5fa;">${formatETH(royaltyReserve)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-primary btn-lg" id="btn-escrow-finish">
                  <span>Complete & View Certificate</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

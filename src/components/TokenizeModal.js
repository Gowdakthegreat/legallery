export function renderTokenizeModal() {
  return `
    <div class="modal-backdrop" id="tokenize-modal">
      <div class="modal-content" style="max-width: 860px;">
        <button class="modal-close-btn" id="btn-close-tokenize">✕</button>

        <div style="padding: 2.25rem;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h2 style="font-size: 1.8rem; margin-bottom: 0.3rem;">Register Physical Artwork</h2>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Register your original masterpiece, generate the bilateral Ricardian Contract, and anchor the token on Ethereum.
            </p>
          </div>

          <form id="tokenize-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.25rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Physical Artwork Title *</label>
                <input type="text" id="tok-title" required placeholder="e.g. Concrete Metamorphosis II" style="width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Category *</label>
                <select id="tok-category" style="width: 100%;">
                  <option value="Oil Painting">Oil Painting</option>
                  <option value="Sculpture">Sculpture</option>
                  <option value="Mixed Media / Textile">Mixed Media / Textile</option>
                  <option value="Geometric Painting">Geometric Painting</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Artist / Author Name *</label>
                <input type="text" id="tok-artist" required value="Leonardo Albuquerque" style="width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Artist CPF / Tax ID (gov.br) *</label>
                <input type="text" id="tok-cpf" required value="***.492.818-72" readonly style="width: 100%; opacity: 0.8;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 1.25rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Technique & Materials *</label>
                <input type="text" id="tok-technique" required placeholder="e.g. Oil on Belgian linen canvas and mineral pigments" style="width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Dimensions *</label>
                <input type="text" id="tok-dimensions" required placeholder="e.g. 120 x 90 x 4 cm" style="width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Estimated Weight *</label>
                <input type="text" id="tok-weight" required placeholder="e.g. 4.8 kg" style="width: 100%;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.25rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">NFC Chip Serial (NTAG 424 DNA) *</label>
                <div style="display: flex; gap: 0.5rem;">
                  <input type="text" id="tok-nfc" required value="04:F8:71:A2:33:91:80" style="width: 100%; font-family: var(--font-mono);" />
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-gen-nfc">Generate Tag</button>
                </div>
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Listing Price (ETH) *</label>
                <input type="number" id="tok-price" required min="0.1" step="0.05" value="1.50" style="width: 100%; font-weight: 700; color: #fff;" />
              </div>
            </div>

            <!-- Resale Royalty Protection Box -->
            <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid var(--border-gold); padding: 1rem; border-radius: var(--radius-md); font-size: 0.8rem; color: #cbd5e1;">
              <strong style="color: var(--gold-secondary); display: block; margin-bottom: 0.25rem;">
                Resale Royalty Protection (Art. 85, Brazilian Copyright Law 9,610/1998):
              </strong>
              The Smart Contract will automatically allocate a 5% royalty to the author on any future secondary market resale, generating the bilateral Ricardian Contract via gov.br.
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-tokenize">Cancel</button>
              <button type="submit" class="btn btn-gold btn-lg">
                <span>Sign with gov.br & Register</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

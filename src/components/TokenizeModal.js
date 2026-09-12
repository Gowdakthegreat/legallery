export function renderTokenizeModal() {
  return `
    <div class="modal-backdrop" id="tokenize-modal">
      <div class="modal-content" style="max-width: 860px;">
        <button class="modal-close-btn" id="btn-close-tokenize">✕</button>

        <div style="padding: 2.25rem;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h2 style="font-size: 1.8rem; margin-bottom: 0.3rem;">Cadastrar Obra Física</h2>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Cadastre seu exemplar original, gere o Contrato Ricardiano bilateral e registre o token na rede Ethereum.
            </p>
          </div>

          <form id="tokenize-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.25rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Título da Obra Física *</label>
                <input type="text" id="tok-title" required placeholder="Ex: Metamorfose Concreta II" style="width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Categoria *</label>
                <select id="tok-category" style="width: 100%;">
                  <option value="Pintura a Óleo">Pintura a Óleo</option>
                  <option value="Escultura">Escultura</option>
                  <option value="Mista / Têxtil">Mista / Têxtil</option>
                  <option value="Pintura Geométrica">Pintura Geométrica</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Nome do Artista / Autor *</label>
                <input type="text" id="tok-artist" required value="Leonardo Albuquerque" style="width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">CPF do Artista (gov.br) *</label>
                <input type="text" id="tok-cpf" required value="***.492.818-72" readonly style="width: 100%; opacity: 0.8;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 1.25rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Técnica e Materiais *</label>
                <input type="text" id="tok-technique" required placeholder="Ex: Óleo sobre tela de linho e pigmentos minerais" style="width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Dimensões *</label>
                <input type="text" id="tok-dimensions" required placeholder="Ex: 120 x 90 x 4 cm" style="width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Peso Estimado *</label>
                <input type="text" id="tok-weight" required placeholder="Ex: 4.8 kg" style="width: 100%;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.25rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Serial do Chip NFC (NTAG 424 DNA) *</label>
                <div style="display: flex; gap: 0.5rem;">
                  <input type="text" id="tok-nfc" required value="04:F8:71:A2:33:91:80" style="width: 100%; font-family: var(--font-mono);" />
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-gen-nfc">Gerar Tag</button>
                </div>
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Preço de Venda (ETH) *</label>
                <input type="number" id="tok-price" required min="0.1" step="0.05" value="1.50" style="width: 100%; font-weight: 700; color: #fff;" />
              </div>
            </div>

            <!-- Box de Direito de Sequência -->
            <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid var(--border-gold); padding: 1rem; border-radius: var(--radius-md); font-size: 0.8rem; color: #cbd5e1;">
              <strong style="color: var(--gold-secondary); display: block; margin-bottom: 0.25rem;">
                Proteção do Direito de Sequência (Art. 85 da Lei 9.610/1998):
              </strong>
              O Smart Contract configurará 5% de participação ao autor em qualquer revenda futura no mercado secundário, gerando o Contrato Ricardiano bilateral via gov.br.
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-tokenize">Cancelar</button>
              <button type="submit" class="btn btn-gold btn-lg">
                <span>Assinar no gov.br & Registrar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

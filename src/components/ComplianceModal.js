export function renderComplianceModal() {
  return `
    <div class="modal-backdrop" id="compliance-modal">
      <div class="modal-content" style="max-width: 900px;">
        <button class="modal-close-btn" id="btn-close-compliance">✕</button>

        <div style="padding: 2.5rem;">
          <div style="text-align: center; margin-bottom: 2.25rem;">
            <h2 style="font-size: 1.9rem; margin-bottom: 0.4rem;">Conformidade Legal & Fiscal</h2>
            <p style="font-size: 0.92rem; color: var(--text-secondary); max-width: 680px; margin: 0 auto;">
              Como a LeGallery conecta a legislação brasileira aos Smart Contracts em Ethereum para garantir transparência tributária e segurança de titularidade.
            </p>
          </div>

          <!-- Grade de Pilares Legais -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <!-- Pilar 1: IN RFB 1888/2019 -->
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--base-blue-muted); display: flex; align-items: center; justify-content: center; color: var(--base-blue-light);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <h4 style="font-size: 1rem; color: #fff;">1. Conformidade com a Receita Federal</h4>
                  <span style="font-size: 0.72rem; color: var(--base-blue-light); font-weight: 600;">IN RFB Nº 1888/2019</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.55;">
                Todas as operações na rede Ethereum são atreladas aos CPFs e CNPJs previamente autenticados no <strong>gov.br</strong>. A plataforma gera automaticamente o extrato fiscal para a declaração de bens no Imposto de Renda e reporte regular à Receita Federal.
              </p>
            </div>

            <!-- Pilar 2: Lei 14.063/2020 gov.br -->
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--gov-green-muted); display: flex; align-items: center; justify-content: center; color: var(--gov-green-light);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <h4 style="font-size: 1rem; color: #fff;">2. Fé Pública & Assinatura Eletrônica</h4>
                  <span style="font-size: 0.72rem; color: var(--gov-green-light); font-weight: 600;">Lei Federal nº 14.063/2020</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.55;">
                A Assinatura Eletrônica Avançada do <strong>gov.br (Nível Prata ou Ouro)</strong> confere validade jurídica plena ao Contrato Ricardiano, com presunção legal de veracidade. Não há necessidade de cartório tradicional: a prova criptográfica possui força executiva perante o Judiciário.
              </p>
            </div>

            <!-- Pilar 3: Lei 9.610/98 (LDA) -->
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--gold-muted); display: flex; align-items: center; justify-content: center; color: var(--gold-secondary);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <h4 style="font-size: 1rem; color: #fff;">3. Direitos Autorais & Sequência</h4>
                  <span style="font-size: 0.72rem; color: var(--gold-secondary); font-weight: 600;">Lei Federal nº 9.610/1998 (Arts. 49 e 85)</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.55;">
                O Artigo 85 garante <strong>5% de participação ao artista em toda valorização em revenda subsequente</strong>. O Smart Contract executa esse repasse de forma automática e transparente para o autor original.
              </p>
            </div>

            <!-- Pilar 4: Código Civil & Inseparabilidade -->
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(148, 163, 184, 0.1); display: flex; align-items: center; justify-content: center; color: #cbd5e1;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <div>
                  <h4 style="font-size: 1rem; color: #fff;">4. Cláusula de Inseparabilidade</h4>
                  <span style="font-size: 0.72rem; color: #cbd5e1; font-weight: 600;">Arts. 421 e 422 do Código Civil</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.55;">
                O Contrato Ricardiano estipula que a posse legítima da obra física original é inseparável do token registrado em blockchain. Qualquer venda física desacoplada configura quebra culposa da boa-fé objetiva e fraude civil.
              </p>
            </div>
          </div>

          <!-- Split de Liquidação -->
          <div class="split-card">
            <h4 style="font-size: 1.05rem; color: #fff; margin-bottom: 0.5rem;">Divisão Automatizada de Pagamentos (Smart Contract Split)</h4>
            <div class="split-bar">
              <div class="split-artist" style="width: 90%;" title="90% Artista"></div>
              <div class="split-platform" style="width: 5%;" title="5% Plataforma"></div>
              <div class="split-royalties" style="width: 5%;" title="5% Reserva Direito de Sequência"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; flex-wrap: wrap; gap: 0.5rem;">
              <span style="color: #60a5fa;">● <strong>90%</strong> Repasse Direto ao Artista</span>
              <span style="color: var(--gold-secondary);">● <strong>5%</strong> Taxa de Intermediação LeGallery</span>
              <span style="color: var(--gov-green-light);">● <strong>5%</strong> Reserva Direito de Sequência (Art. 85 LDA)</span>
            </div>
          </div>

          <div style="margin-top: 2rem; text-align: center;">
            <button class="btn btn-secondary" id="btn-close-compliance-sub">
              Fechar e Voltar à Galeria
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

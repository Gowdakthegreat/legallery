import { formatUSDC, formatBRL } from '../utils/cryptoSim.js';

export function renderEscrowSimulatorModal(art, currentStep = 1, escrowState = {}) {
  const steps = [
    { num: 1, title: 'Depósito USDC', desc: 'Base L2 Escrow' },
    { num: 2, title: 'Assinatura gov.br', desc: 'Fé Pública Digital' },
    { num: 3, title: 'Envio Físico', desc: 'Transporte Segurado' },
    { num: 4, title: 'Leitura NFC & Liberação', desc: 'Split Automático' }
  ];

  const artistShare = art.priceUsdc * 0.90;
  const platformShare = art.priceUsdc * 0.05;
  const royaltyReserve = art.priceUsdc * 0.05;

  return `
    <div class="modal-backdrop" id="escrow-modal">
      <div class="modal-content" style="max-width: 800px;">
        <button class="modal-close-btn" id="btn-close-escrow">✕</button>

        <div style="padding: 2rem;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div class="badge badge-escrow" style="margin-bottom: 0.5rem;">
              Protocolo de Custódia Segura (Smart Contract Escrow)
            </div>
            <h2 style="font-size: 1.8rem; margin-bottom: 0.3rem;">Liquidação da Obra: ${art.title}</h2>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Valor total: <strong style="color: #fff;">${formatUSDC(art.priceUsdc)}</strong> (${formatBRL(art.priceUsdc)})
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

          <!-- Conteúdo da Etapa Atual -->
          <div style="background: var(--bg-tertiary); padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-medium); min-height: 280px; display: flex; flex-direction: column; justify-content: space-between;">
            ${currentStep === 1 ? `
              <div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                  <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--base-blue-muted); display: flex; align-items: center; justify-content: center; color: var(--base-blue-light);">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.15rem; color: #fff;">Etapa 1: Trava dos Fundos em USDC (Base L2)</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">Os fundos NÃO vão para a conta do vendedor agora; ficam sob custódia criptográfica no contrato.</p>
                  </div>
                </div>

                <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.5rem; font-size: 0.88rem;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Carteira do Comprador:</span>
                    <span style="font-family: var(--font-mono); color: #fff;">0x71C...49b2</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Contrato de Custódia (Escrow):</span>
                    <span style="font-family: var(--font-mono); color: var(--base-blue-light);">0xEscrowBaseL2...999</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Valor a bloquear:</span>
                    <span style="font-weight: 700; color: #fff;">${formatUSDC(art.priceUsdc)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Taxa de Gás da L2 estimada:</span>
                    <span style="color: var(--gov-green-light); font-weight: 600;">$0.02 (0.000008 ETH)</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-primary btn-lg" id="btn-escrow-deposit">
                  <span>Autorizar e Bloquear ${formatUSDC(art.priceUsdc)}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            ` : currentStep === 2 ? `
              <div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                  <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--gov-green-muted); display: flex; align-items: center; justify-content: center; color: var(--gov-green-light);">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.15rem; color: #fff;">Etapa 2: Assinatura Eletrônica Avançada (gov.br)</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">Assinatura com presunção legal de veracidade perante o Judiciário Brasileiro (Lei 14.063/20).</p>
                  </div>
                </div>

                <div style="background: #0f172a; padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid #1e3a8a; margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                    <img src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png" alt="gov.br" style="height: 24px; filter: brightness(2);" onerror="this.style.display='none'" />
                    <span style="font-weight: 700; color: #60a5fa; font-size: 0.95rem;">Portal de Assinatura Eletrônica GOV.BR</span>
                  </div>
                  <p style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.65rem;">
                    Você está assinando o <strong>Contrato Ricardiano de Aquisição de Obra Física</strong>. O hash SHA-256 gerado será autenticado com seu certificado digital gov.br (Nível Ouro).
                  </p>
                  <div style="font-size: 0.78rem; font-family: var(--font-mono); color: #93c5fd; background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: var(--radius-sm);">
                    Signatário: Leonardo Albuquerque | CPF: ***.492.818-72 | Selo: Confiabilidade Ouro
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-gold btn-lg" id="btn-escrow-sign-gov">
                  <span>Assinar com gov.br e Conectar ao Smart Contract</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            ` : currentStep === 3 ? `
              <div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                  <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; color: #fbbf24;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.15rem; color: #fff;">Etapa 3: Envio da Obra Física pelo Artista</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">A transportadora especializada realizou a coleta no ateliê do artista com seguro e laudo físico.</p>
                  </div>
                </div>

                <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1rem; font-size: 0.85rem;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Código de Rastreamento:</span>
                    <strong style="font-family: var(--font-mono); color: var(--gold-secondary);">LG-BR-994821034-SP</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Status do Envio:</span>
                    <span style="color: #60a5fa; font-weight: 600;">Em trânsito para o destinatário</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted);">Apólice de Seguro de Carga:</span>
                    <span style="color: #cbd5e1;">Allianz Seguros Art Premium (100% Coberto)</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Previsão de Entrega:</span>
                    <span style="color: #fff; font-weight: 600;">2 dias úteis</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-secondary btn-lg" id="btn-escrow-simulate-arrival">
                  <span>Simular Chegada da Obra no Destino</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            ` : `
              <div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                  <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--gov-green-muted); display: flex; align-items: center; justify-content: center; color: var(--gov-green-light);">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.15rem; color: #fff;">Etapa 4: Validação do Chip NFC & Split Financeiro</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">O comprador aproximou o celular da tela física. O token foi transferido e o USDC liberado!</p>
                  </div>
                </div>

                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                    <strong style="color: var(--gov-green-light); font-size: 0.9rem;">
                      ✅ Leitura NFC Confirmada: ${art.nfcSerial.split(' - ')[0]}
                    </strong>
                    <span class="badge badge-l2">Token #${art.tokenId} Transferido</span>
                  </div>

                  <!-- Split de Pagamento em Tempo Real -->
                  <div style="font-size: 0.82rem; color: #cbd5e1;">
                    <div style="margin-bottom: 0.4rem; font-weight: 600; color: #fff;">Divisão Automática do Smart Contract (Split):</div>
                    <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                      <span>• Artista (${art.artist} - 90%):</span>
                      <strong style="color: #fff;">${formatUSDC(artistShare)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                      <span>• Taxa LeGallery Intermediação (5%):</span>
                      <strong style="color: var(--gold-secondary);">${formatUSDC(platformShare)} (NFS-e Emitida)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                      <span>• Reserva Direito de Sequência Art. 85 (5%):</span>
                      <strong style="color: #60a5fa;">${formatUSDC(royaltyReserve)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-primary btn-lg" id="btn-escrow-finish">
                  <span>Concluir e Ver Certificado de Posse</span>
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

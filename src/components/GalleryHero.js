import { formatUSDC, formatBRL } from '../utils/cryptoSim.js';

export function renderGalleryHero(featuredArt) {
  return `
    <header class="hero">
      <div class="container hero-grid">
        <div class="hero-content">
          <div class="hero-tag">
            <span class="nfc-radar" style="width: 8px; height: 8px; background: var(--gold-primary); border-radius: 50%;"></span>
            <span>Protocolo Brasileiro de Obras Físicas RWA & Contratos Ricardianos</span>
          </div>

          <h1 class="hero-title">
            Arte física autêntica com <span>segurança jurídica plena</span> e liquidação em L2.
          </h1>

          <p class="hero-subtitle">
            Intermediação transparente de obras de arte físicas brasileiras. Cada exemplar possui um chip NFC inviolável e um <strong>Contrato Ricardiano bilateral assinado via gov.br</strong> com registro imutável na rede Ethereum (Base L2).
          </p>

          <div class="hero-actions">
            <a href="#gallery-browse" class="btn btn-gold btn-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Explorar Obras Disponíveis
            </a>
            <button class="btn btn-secondary btn-lg" id="hero-btn-how-it-works">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Como Funciona o Escrow
            </button>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <h4>100%</h4>
              <p>Segurança Jurídica (Lei 14.063/20 e 9.610/98)</p>
            </div>
            <div class="stat-item">
              <h4>Base L2</h4>
              <p>Ethereum Rollup com Custódia em USDC</p>
            </div>
            <div class="stat-item">
              <h4>NTAG 424</h4>
              <p>Chip Criptográfico Anti-Fraude</p>
            </div>
          </div>
        </div>

        <div class="hero-showcase">
          <div class="hero-card" id="featured-art-card" data-art-id="${featuredArt.id}" style="cursor: pointer;">
            <div class="hero-card-badge-top">
              <span class="badge badge-gov">gov.br ${featuredArt.govBrStatus}</span>
              <span class="badge badge-l2">${featuredArt.network}</span>
              <span class="badge badge-nfc">NFC Inviolável</span>
            </div>

            <div class="hero-card-img-wrap">
              <img src="${featuredArt.image}" alt="${featuredArt.title}" loading="eager" />
            </div>

            <div class="hero-card-ricardian-overlay">
              <div class="artist-meta">
                <div>
                  <h3 style="color: #fff;">${featuredArt.title}</h3>
                  <p style="font-size: 0.85rem; color: #cbd5e1;">Por <strong>${featuredArt.artist}</strong> (${featuredArt.artistLocation})</p>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 1.25rem; font-weight: 700; color: #fff;">${formatUSDC(featuredArt.priceUsdc)}</div>
                  <div style="font-size: 0.75rem; color: var(--gold-secondary);">${formatBRL(featuredArt.priceUsdc)}</div>
                </div>
              </div>

              <div class="hash-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gov-green-light)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>SHA-256 Ricardiano: <strong>0x8f2d79c41b80...e1a4</strong> (Gravado no Token #${featuredArt.tokenId})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}

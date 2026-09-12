import { formatETH } from '../utils/cryptoSim.js';

export function renderGalleryHero(featuredArt) {
  return `
    <header class="hero">
      <div class="container hero-grid">
        <div class="hero-content">
          <h1 class="hero-title">
            Authentic physical fine art with <span>legal certainty</span> and Ethereum settlement.
          </h1>

          <p class="hero-subtitle">
            Direct acquisition protocol for original Brazilian physical artworks. Every piece features a tamper-proof cryptographic NFC chip and a <strong>bilateral Ricardian Contract executed via gov.br</strong> with immutable blockchain anchoring.
          </p>

          <div class="hero-actions">
            <a href="#gallery-browse" class="btn btn-gold btn-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Explore Available Artworks
            </a>
            <button class="btn btn-secondary btn-lg" id="hero-btn-how-it-works">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              How Escrow Works
            </button>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <h4>100%</h4>
              <p>Legal Certainty (Laws 14,063/20 & 9,610/98)</p>
            </div>
            <div class="stat-item">
              <h4>Ethereum</h4>
              <p>On-Chain Smart Contract Custody</p>
            </div>
            <div class="stat-item">
              <h4>NTAG 424</h4>
              <p>Anti-Counterfeiting Cryptographic Chip</p>
            </div>
          </div>
        </div>

        <div class="hero-showcase">
          <div class="hero-card" id="featured-art-card" data-art-id="${featuredArt.id}" style="cursor: pointer;">
            <div class="hero-card-img-wrap">
              <img src="${featuredArt.image}" alt="${featuredArt.title}" loading="eager" />
            </div>

            <div class="hero-card-ricardian-overlay">
              <div class="artist-meta">
                <div>
                  <h3 style="color: #fff;">${featuredArt.title}</h3>
                  <p style="font-size: 0.85rem; color: #cbd5e1;">By <strong>${featuredArt.artist}</strong> (${featuredArt.artistLocation})</p>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 1.35rem; font-weight: 700; color: #fff;">${formatETH(featuredArt.priceEth)}</div>
                </div>
              </div>

              <div class="hash-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gov-green-light)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Ricardian SHA-256: <strong>0x8f2d79c41b80...e1a4</strong> (Token #${featuredArt.tokenId})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}

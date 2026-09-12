export function renderNavbar(state, onNavigate) {
  return `
    <nav class="navbar">
      <div class="container nav-container">
        <div class="brand-logo" style="cursor: pointer;" id="nav-brand">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#0D0F17" stroke="#D4AF37" stroke-width="1.5"/>
            <path d="M9 23V9L16 16L23 9V23" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="16" r="3" fill="#0052FF"/>
          </svg>
          <span>LeGallery</span>
          <span class="brand-badge">RWA Base L2</span>
        </div>

        <ul class="nav-menu">
          <li>
            <a href="#gallery" class="nav-link ${state.currentView === 'gallery' ? 'active' : ''}" data-view="gallery">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              Vitrine de Obras
            </a>
          </li>
          <li>
            <a href="#verifier" class="nav-link ${state.currentView === 'verifier' ? 'active' : ''}" data-view="verifier">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
              Verificador NFC
            </a>
          </li>
          <li>
            <a href="#tokenize" class="nav-link ${state.currentView === 'tokenize' ? 'active' : ''}" data-view="tokenize">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              Tokenizar Obra (Artista)
            </a>
          </li>
          <li>
            <a href="#compliance" class="nav-link ${state.currentView === 'compliance' ? 'active' : ''}" data-view="compliance">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Compliance & Tributário
            </a>
          </li>
        </ul>

        <div class="nav-actions">
          <div class="currency-toggle" title="Alternar moeda de exibição" role="group" aria-label="Moeda de exibição">
            <button class="currency-btn ${state.currency === 'USDC' ? 'active' : ''}" data-currency="USDC">USDC</button>
            <button class="currency-btn ${state.currency === 'BRL' ? 'active' : ''}" data-currency="BRL">R$ BRL</button>
          </div>

          <div class="badge badge-gov" title="Identidade validada com fé pública - Lei 14.063/20">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>gov.br <strong>Ouro</strong></span>
          </div>

          <div class="badge badge-l2" title="Carteira Web3 conectada na rede Base L2 (Ethereum Rollup)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
            <span>${state.currency === 'BRL' ? 'R$ ' + (state.walletBalance * 5.45).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : state.walletBalance.toLocaleString('pt-BR') + ' USDC'}</span>
          </div>

          <button class="btn btn-secondary btn-sm" id="btn-wallet-profile" title="Copiar endereço da carteira" data-tooltip="Copiar Endereço">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M16 12h.01"/></svg>
            <span id="wallet-addr-label">0x71C...49b2</span>
          </button>
        </div>
      </div>
    </nav>
  `;
}

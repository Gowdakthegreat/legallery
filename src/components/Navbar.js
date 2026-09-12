export function renderNavbar(state, onNavigate) {
  const ethBalance = '4.85 ETH';

  return `
    <nav class="navbar">
      <div class="container nav-container">
        <div class="brand-logo" style="cursor: pointer;" id="nav-brand">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#0D0F17" stroke="#D4AF37" stroke-width="1.5"/>
            <path d="M9 23V9L16 16L23 9V23" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="16" r="3" fill="#0052FF"/>
          </svg>
          <span>LeGallery</span>
        </div>

        <ul class="nav-menu">
          <li>
            <a href="#gallery" class="nav-link ${state.currentView === 'gallery' ? 'active' : ''}" data-view="gallery">
              Collection
            </a>
          </li>
          <li>
            <a href="#verifier" class="nav-link ${state.currentView === 'verifier' ? 'active' : ''}" data-view="verifier">
              NFC Verifier
            </a>
          </li>
          <li>
            <a href="#tokenize" class="nav-link ${state.currentView === 'tokenize' ? 'active' : ''}" data-view="tokenize">
              Tokenize Art
            </a>
          </li>
          <li>
            <a href="#compliance" class="nav-link ${state.currentView === 'compliance' ? 'active' : ''}" data-view="compliance">
              Legal Compliance
            </a>
          </li>
        </ul>

        <div class="nav-actions">
          <div class="badge badge-eth" title="Ethereum wallet balance">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
            <span>${ethBalance}</span>
          </div>

          <button class="btn btn-secondary btn-sm" id="btn-wallet-profile" title="Copy wallet address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M16 12h.01"/></svg>
            <span id="wallet-addr-label">0x71C...49b2</span>
          </button>
        </div>
      </div>
    </nav>
  `;
}

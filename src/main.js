import './styles/base.css';
import './styles/components.css';
import './styles/animations.css';

import { INITIAL_ARTWORKS } from './data/artworks.js';
import { renderNavbar } from './components/Navbar.js';
import { renderGalleryHero } from './components/GalleryHero.js';
import { renderArtworkGrid } from './components/ArtworkGrid.js';
import { renderArtworkDetailModal } from './components/ArtworkDetailModal.js';
import { renderEscrowSimulatorModal } from './components/EscrowSimulatorModal.js';
import { renderNfcScannerModal } from './components/NfcScannerModal.js';
import { renderTokenizeModal } from './components/TokenizeModal.js';
import { renderComplianceModal } from './components/ComplianceModal.js';

// Application Reactive State
const state = {
  artworks: [...INITIAL_ARTWORKS],
  currentView: 'gallery', // 'gallery' | 'verifier' | 'tokenize' | 'compliance'
  currentFilter: 'all',
  searchQuery: '',
  currency: 'USDC', // 'USDC' | 'BRL'
  sortBy: 'default', // 'default' | 'price-asc' | 'price-desc'
  walletBalance: 12500, // USDC
  
  // Modal states
  selectedArtDetailId: null,
  activeRicardianTab: 'legal',
  tamperedContractText: null,

  selectedArtEscrowId: null,
  escrowStep: 1,

  isNfcModalOpen: false,
  selectedNfcArtId: null,
  isNfcScanning: false,

  isTokenizeModalOpen: false,
  isComplianceModalOpen: false
};

// Toast notification helper
function showToast(message, type = 'success') {
  const existing = document.getElementById('app-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'app-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: ${type === 'success' ? '#10b981' : '#0052ff'};
    color: #ffffff;
    padding: 0.85rem 1.4rem;
    border-radius: 12px;
    font-size: 0.88rem;
    font-weight: 600;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    animation: fadeIn 0.3s ease-out;
  `;
  toast.innerHTML = `<span>✓</span><span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Master Render Loop
async function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const featuredArt = state.artworks[0];

  let mainContent = '';
  if (state.currentView === 'gallery') {
    mainContent = `
      ${renderGalleryHero(featuredArt)}
      ${renderArtworkGrid(state.artworks, state.currentFilter, state.searchQuery, state.currency, state.sortBy)}
    `;
  } else if (state.currentView === 'verifier') {
    mainContent = `
      <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Verificador de Tag NFC & Proveniência</h1>
          <p>Audite a autenticidade do exemplar físico e a integridade do Contrato Ricardiano na Base L2.</p>
        </div>
        <div style="max-width: 860px; margin: 0 auto;">
          <button class="btn btn-gold btn-lg" id="btn-open-nfc-standalone" style="width: 100%; margin-bottom: 2rem;">
            Abrir Scanner de Leitura NFC Criptográfico
          </button>
        </div>
      </div>
    `;
  }

  // Modals placeholder
  let modalHtml = '';

  // 1. Artwork Detail Modal
  if (state.selectedArtDetailId) {
    const art = state.artworks.find(a => a.id === state.selectedArtDetailId);
    if (art) {
      modalHtml += await renderArtworkDetailModal(art, state.activeRicardianTab, state.tamperedContractText, state.currency);
    }
  }

  // 2. Escrow Simulator Modal
  if (state.selectedArtEscrowId) {
    const art = state.artworks.find(a => a.id === state.selectedArtEscrowId);
    if (art) {
      modalHtml += renderEscrowSimulatorModal(art, state.escrowStep);
    }
  }

  // 3. NFC Scanner Modal
  if (state.isNfcModalOpen) {
    modalHtml += renderNfcScannerModal(state.artworks, state.selectedNfcArtId, state.isNfcScanning);
  }

  // 4. Tokenize Modal
  if (state.isTokenizeModalOpen) {
    modalHtml += renderTokenizeModal();
  }

  // 5. Compliance Modal
  if (state.isComplianceModalOpen) {
    modalHtml += renderComplianceModal();
  }

  app.innerHTML = `
    ${renderNavbar(state)}
    <main>${mainContent}</main>
    <footer style="background: var(--bg-secondary); border-top: 1px solid var(--border-subtle); padding: 3rem 0; margin-top: 5rem; text-align: center; font-size: 0.82rem; color: var(--text-muted);">
      <div class="container">
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1rem;">
          <strong style="color: #fff; font-family: var(--font-serif); font-size: 1.1rem; letter-spacing: 0.05em;">LeGallery</strong>
          <span>•</span>
          <span>Base L2 Ethereum (ChainId: 8453)</span>
          <span>•</span>
          <span>Lei Federal 14.063/2020 (gov.br)</span>
          <span>•</span>
          <span>Lei Federal 9.610/1998 (LDA)</span>
        </div>
        <p>Intermediação com segurança jurídica plena e custódia inteligente de arte física brasileira.</p>
      </div>
    </footer>
    <div id="modal-root">${modalHtml}</div>
  `;

  attachEventListeners();
}

function attachEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      if (view === 'tokenize') {
        state.isTokenizeModalOpen = true;
        renderApp();
        return;
      }
      if (view === 'compliance') {
        state.isComplianceModalOpen = true;
        renderApp();
        return;
      }
      if (view === 'verifier') {
        state.isNfcModalOpen = true;
        state.selectedNfcArtId = state.artworks[0].id;
        renderApp();
        return;
      }
      state.currentView = view;
      renderApp();
    });
  });

  const navBrand = document.getElementById('nav-brand');
  if (navBrand) {
    navBrand.addEventListener('click', () => {
      state.currentView = 'gallery';
      renderApp();
    });
  }

  // Hero Actions
  const heroHowBtn = document.getElementById('hero-btn-how-it-works');
  if (heroHowBtn) {
    heroHowBtn.addEventListener('click', () => {
      state.isComplianceModalOpen = true;
      renderApp();
    });
  }

  const featuredCard = document.getElementById('featured-art-card');
  if (featuredCard) {
    featuredCard.addEventListener('click', () => {
      state.selectedArtDetailId = featuredCard.dataset.artId;
      state.activeRicardianTab = 'legal';
      state.tamperedContractText = null;
      renderApp();
    });
  }

  // Standalone Verifier button
  const standaloneNfcBtn = document.getElementById('btn-open-nfc-standalone');
  if (standaloneNfcBtn) {
    standaloneNfcBtn.addEventListener('click', () => {
      state.isNfcModalOpen = true;
      state.selectedNfcArtId = state.artworks[0].id;
      renderApp();
    });
  }

  // Currency Toggle Listeners
  document.querySelectorAll('.currency-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currency = btn.dataset.currency;
      renderApp();
    });
  });

  // Sort Selector
  const sortSelect = document.getElementById('artwork-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderApp();
    });
  }

  // Copy Hash & Address Listeners
  document.querySelectorAll('.btn-copy-hash').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = btn.dataset.copy;
      navigator.clipboard?.writeText(textToCopy);
      showToast('Hash copiado para a área de transferência!', 'info');
    });
  });

  const btnWalletProfile = document.getElementById('btn-wallet-profile');
  if (btnWalletProfile) {
    btnWalletProfile.addEventListener('click', () => {
      navigator.clipboard?.writeText('0x71C839210984AA61BC947819230581B849b2');
      showToast('Endereço da carteira Base L2 copiado!', 'info');
    });
  }

  // Export PDF Listener
  const btnExportPdf = document.getElementById('btn-export-pdf');
  if (btnExportPdf) {
    btnExportPdf.addEventListener('click', () => {
      showToast('Minuta jurídica oficial exportada com selo ICP-Brasil/gov.br!', 'success');
      setTimeout(() => {
        window.print();
      }, 500);
    });
  }

  // Filter tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentFilter = btn.dataset.category;
      renderApp();
    });
  });

  // Search input
  const searchInput = document.getElementById('artwork-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
    });
    searchInput.addEventListener('change', () => {
      renderApp();
    });
  }

  // Open detail buttons
  document.querySelectorAll('.btn-open-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedArtDetailId = btn.dataset.id;
      state.activeRicardianTab = 'legal';
      state.tamperedContractText = null;
      renderApp();
    });
  });

  // Detail Modal Actions
  const btnCloseDetail = document.getElementById('btn-close-detail');
  if (btnCloseDetail) {
    btnCloseDetail.addEventListener('click', () => {
      state.selectedArtDetailId = null;
      state.tamperedContractText = null;
      renderApp();
    });
  }

  // Ricardian Contract Tabs
  document.querySelectorAll('.ricardian-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      state.activeRicardianTab = tabBtn.dataset.rtab;
      renderApp();
    });
  });

  // Tamper Textarea Event
  const tamperTextarea = document.getElementById('tamper-textarea');
  if (tamperTextarea) {
    tamperTextarea.addEventListener('input', (e) => {
      state.tamperedContractText = e.target.value;
      renderApp();
    });
  }

  // Start Escrow button from Detail Modal
  const btnStartEscrow = document.getElementById('btn-start-escrow');
  if (btnStartEscrow) {
    btnStartEscrow.addEventListener('click', () => {
      const artId = btnStartEscrow.dataset.id;
      state.selectedArtDetailId = null;
      state.selectedArtEscrowId = artId;
      state.escrowStep = 1;
      renderApp();
    });
  }

  // Inline NFC test button
  const btnTestNfcInline = document.getElementById('btn-test-nfc-inline');
  if (btnTestNfcInline) {
    btnTestNfcInline.addEventListener('click', () => {
      state.selectedNfcArtId = btnTestNfcInline.dataset.id;
      state.isNfcModalOpen = true;
      renderApp();
    });
  }

  // Escrow Modal Flow
  const btnCloseEscrow = document.getElementById('btn-close-escrow');
  if (btnCloseEscrow) {
    btnCloseEscrow.addEventListener('click', () => {
      state.selectedArtEscrowId = null;
      state.escrowStep = 1;
      renderApp();
    });
  }

  const btnEscrowDeposit = document.getElementById('btn-escrow-deposit');
  if (btnEscrowDeposit) {
    btnEscrowDeposit.addEventListener('click', () => {
      state.escrowStep = 2;
      showToast('Depósito de USDC efetuado com sucesso no Smart Contract!', 'success');
      renderApp();
    });
  }

  const btnEscrowSignGov = document.getElementById('btn-escrow-sign-gov');
  if (btnEscrowSignGov) {
    btnEscrowSignGov.addEventListener('click', () => {
      state.escrowStep = 3;
      showToast('Contrato assinado com gov.br! Hash cravado na Base L2.', 'success');
      renderApp();
    });
  }

  const btnEscrowArrival = document.getElementById('btn-escrow-simulate-arrival');
  if (btnEscrowArrival) {
    btnEscrowArrival.addEventListener('click', () => {
      state.escrowStep = 4;
      showToast('Obra entregue ao destinatário! Aguardando validação NFC.', 'success');
      renderApp();
    });
  }

  const btnEscrowFinish = document.getElementById('btn-escrow-finish');
  if (btnEscrowFinish) {
    btnEscrowFinish.addEventListener('click', () => {
      const art = state.artworks.find(a => a.id === state.selectedArtEscrowId);
      if (art) {
        art.status = 'Adquirida / Posse Transferida';
        state.walletBalance -= art.priceUsdc;
      }
      state.selectedArtEscrowId = null;
      state.escrowStep = 1;
      showToast('Transação concluída! Token ERC-721 na sua carteira.', 'success');
      renderApp();
    });
  }

  // NFC Scanner Modal Flow
  const btnCloseNfc = document.getElementById('btn-close-nfc');
  if (btnCloseNfc) {
    btnCloseNfc.addEventListener('click', () => {
      state.isNfcModalOpen = false;
      renderApp();
    });
  }

  const nfcSelector = document.getElementById('nfc-artwork-selector');
  if (nfcSelector) {
    nfcSelector.addEventListener('change', (e) => {
      state.selectedNfcArtId = e.target.value;
      renderApp();
    });
  }

  const btnTriggerNfcScan = document.getElementById('btn-trigger-nfc-scan');
  if (btnTriggerNfcScan) {
    btnTriggerNfcScan.addEventListener('click', () => {
      state.isNfcScanning = true;
      renderApp();
      setTimeout(() => {
        state.isNfcScanning = false;
        renderApp();
        showToast('Leitura NFC NTAG 424 DNA concluída: Exemplar 100% Autêntico!', 'success');
      }, 1400);
    });
  }

  // Tokenize Modal Flow
  const btnCloseTokenize = document.getElementById('btn-close-tokenize');
  if (btnCloseTokenize) {
    btnCloseTokenize.addEventListener('click', () => {
      state.isTokenizeModalOpen = false;
      renderApp();
    });
  }

  const btnCancelTokenize = document.getElementById('btn-cancel-tokenize');
  if (btnCancelTokenize) {
    btnCancelTokenize.addEventListener('click', () => {
      state.isTokenizeModalOpen = false;
      renderApp();
    });
  }

  const btnGenNfc = document.getElementById('btn-gen-nfc');
  if (btnGenNfc) {
    btnGenNfc.addEventListener('click', () => {
      const hex = () => Math.floor((1 + Math.random()) * 0x100).toString(16).substring(1).toUpperCase();
      const newTag = `04:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:80`;
      const input = document.getElementById('tok-nfc');
      if (input) input.value = newTag;
      showToast('Nova Tag Criptográfica NTAG 424 gerada com sucesso!', 'success');
    });
  }

  const tokenizeForm = document.getElementById('tokenize-form');
  if (tokenizeForm) {
    tokenizeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('tok-title').value;
      const category = document.getElementById('tok-category').value;
      const artist = document.getElementById('tok-artist').value;
      const artistCpf = document.getElementById('tok-cpf').value;
      const technique = document.getElementById('tok-technique').value;
      const dimensions = document.getElementById('tok-dimensions').value;
      const weight = document.getElementById('tok-weight').value;
      const nfc = document.getElementById('tok-nfc').value;
      const price = parseFloat(document.getElementById('tok-price').value) || 3000;

      const newId = `art-${String(state.artworks.length + 1).padStart(3, '0')}`;
      const newTokenId = 1045 + state.artworks.length;

      const newArtwork = {
        id: newId,
        title,
        artist,
        artistCpf,
        artistLocation: 'São Paulo, SP',
        govBrStatus: 'Nível Ouro (Verificado)',
        category,
        year: 2026,
        technique,
        dimensions,
        weight,
        description: `Obra física contemporânea ${technique}, tokenizada pelo autor com certificação jurídica gov.br.`,
        image: '/assets/artwork_1.jpg', // uses artwork 1 as realistic demonstration
        priceUsdc: price,
        tokenId: newTokenId,
        contractAddress: '0x3892BFA7332c69b61A9958197771fF642fE78E61',
        network: 'Base L2 (Ethereum)',
        nfcSerial: `${nfc} - NTAG 424 DNA (Tamper-Proof)`,
        status: 'Disponível',
        shippingIncluded: true,
        estimatedDeliveryDays: 4,
        carrier: 'Logística Especializada com Seguro Total',
        provenance: [
          { date: 'Hoje', event: 'Criação e registro no ateliê', tx: 'Físico' },
          { date: 'Hoje', event: 'Aplicação da Tag NFC NTAG 424 DNA', tx: 'Físico' },
          { date: 'Hoje', event: 'Assinatura Eletrônica gov.br Ouro (Lei 14.063/20)', tx: 'gov.br' },
          { date: 'Hoje', event: 'Mint na Base L2 com Hash do Contrato Ricardiano', tx: '0x9b11...aa42' }
        ]
      };

      state.artworks.unshift(newArtwork);
      state.isTokenizeModalOpen = false;
      showToast(`Obra "${title}" tokenizada com sucesso na Base L2!`, 'success');
      state.selectedArtDetailId = newArtwork.id;
      renderApp();
    });
  }

  // Compliance Modal Flow
  const btnCloseCompliance = document.getElementById('btn-close-compliance');
  if (btnCloseCompliance) {
    btnCloseCompliance.addEventListener('click', () => {
      state.isComplianceModalOpen = false;
      renderApp();
    });
  }

  const btnCloseComplianceSub = document.getElementById('btn-close-compliance-sub');
  if (btnCloseComplianceSub) {
    btnCloseComplianceSub.addEventListener('click', () => {
      state.isComplianceModalOpen = false;
      renderApp();
    });
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  renderApp();
});

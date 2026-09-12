import { formatUSDC, formatBRL } from '../utils/cryptoSim.js';

export function renderArtworkGrid(artworks, currentFilter = 'all', searchQuery = '', currency = 'USDC', sortBy = 'default') {
  let filtered = artworks.filter(art => {
    const matchesFilter = currentFilter === 'all' || art.category.toLowerCase().includes(currentFilter.toLowerCase());
    const matchesSearch = !searchQuery || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.technique.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.priceUsdc - b.priceUsdc);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.priceUsdc - a.priceUsdc);
  }

  const getCount = (cat) => cat === 'all' 
    ? artworks.length 
    : artworks.filter(a => a.category.toLowerCase().includes(cat.toLowerCase())).length;

  return `
    <section class="gallery-section" id="gallery-browse">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>Obras Físicas Disponíveis</h2>
            <p>Cada exemplar inclui custódia via Smart Contract, transporte segurado e Contrato Ricardiano registrado.</p>
          </div>
          <div class="badge badge-gov" style="padding: 0.5rem 1rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Assinaturas com Fé Pública (gov.br)</span>
          </div>
        </div>

        <div class="filter-bar">
          <ul class="category-tabs">
            <li><button class="tab-btn ${currentFilter === 'all' ? 'active' : ''}" data-category="all">Todas (${getCount('all')})</button></li>
            <li><button class="tab-btn ${currentFilter === 'Pintura a Óleo' ? 'active' : ''}" data-category="Pintura a Óleo">Pintura a Óleo (${getCount('Pintura a Óleo')})</button></li>
            <li><button class="tab-btn ${currentFilter === 'Escultura' ? 'active' : ''}" data-category="Escultura">Escultura (${getCount('Escultura')})</button></li>
            <li><button class="tab-btn ${currentFilter === 'Mista / Têxtil' ? 'active' : ''}" data-category="Mista / Têxtil">Mista / Têxtil (${getCount('Mista / Têxtil')})</button></li>
            <li><button class="tab-btn ${currentFilter === 'Pintura Geométrica' ? 'active' : ''}" data-category="Pintura Geométrica">Geométrica (${getCount('Pintura Geométrica')})</button></li>
          </ul>

          <div class="search-sort-box">
            <select id="artwork-sort-select" style="padding: 0.45rem 0.85rem; font-size: 0.82rem; background: var(--bg-tertiary);">
              <option value="default" ${sortBy === 'default' ? 'selected' : ''}>Ordenar: Destaques</option>
              <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>Menor Valor</option>
              <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>Maior Valor</option>
            </select>

            <input 
              type="text" 
              class="search-input" 
              id="artwork-search-input" 
              placeholder="Buscar artista, título..." 
              value="${searchQuery}"
            />
          </div>
        </div>

        <div class="art-grid">
          ${filtered.length > 0 ? filtered.map(art => `
            <article class="art-card" data-id="${art.id}">
              <div class="art-card-thumb">
                <img src="${art.image}" alt="${art.title}" loading="lazy" />
                <div class="art-card-badges">
                  <span class="badge badge-gov">gov.br ${art.govBrStatus.split(' ')[1]}</span>
                  <span class="badge badge-l2">Token #${art.tokenId}</span>
                </div>
              </div>

              <div class="art-card-body">
                <div class="art-card-meta">
                  <span>${art.category}</span>
                  <span>•</span>
                  <span>${art.year}</span>
                  <span>•</span>
                  <span>${art.artistLocation}</span>
                </div>

                <h3 class="art-card-title">${art.title}</h3>
                
                <div class="art-card-artist">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>${art.artist}</span>
                  <span style="font-size: 0.72rem; color: var(--text-muted);">(${art.artistCpf})</span>
                </div>

                <div class="art-card-specs">
                  <div class="spec-item">
                    <span>Dimensões</span>
                    <span>${art.dimensions.split(' ')[0]} ${art.dimensions.split(' ')[1]}</span>
                  </div>
                  <div class="spec-item">
                    <span>Peso</span>
                    <span>${art.weight}</span>
                  </div>
                  <div class="spec-item">
                    <span>Chip NFC</span>
                    <span style="color: var(--gov-green-light);">NTAG 424 DNA</span>
                  </div>
                </div>

                <div class="art-card-footer">
                  <div class="price-box">
                    <span class="price-label">Valor em Escrow</span>
                    <span class="price-val">
                      ${currency === 'BRL' ? formatBRL(art.priceUsdc) : formatUSDC(art.priceUsdc)}
                    </span>
                    <span class="price-sub">
                      ${currency === 'BRL' ? '≈ ' + formatUSDC(art.priceUsdc) : '≈ ' + formatBRL(art.priceUsdc)}
                    </span>
                  </div>

                  <button class="btn btn-secondary btn-sm btn-open-detail" data-id="${art.id}">
                    <span>Ver Obra & Contrato</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            </article>
          `).join('') : `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg);">
              <p style="color: var(--text-muted); font-size: 1.1rem;">Nenhuma obra encontrada para essa busca.</p>
            </div>
          `}
        </div>
      </div>
    </section>
  `;
}

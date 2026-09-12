import { formatETH } from '../utils/cryptoSim.js';

export function renderArtworkGrid(artworks, currentFilter = 'all', searchQuery = '', sortBy = 'default') {
  let filtered = artworks.filter(art => {
    const matchesFilter = currentFilter === 'all' || art.category.toLowerCase().includes(currentFilter.toLowerCase());
    const matchesSearch = !searchQuery || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.technique.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.priceEth - b.priceEth);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.priceEth - a.priceEth);
  }

  const getCount = (cat) => cat === 'all' 
    ? artworks.length 
    : artworks.filter(a => a.category.toLowerCase().includes(cat.toLowerCase())).length;

  return `
    <section class="gallery-section" id="gallery-browse">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>Available Physical Artworks</h2>
            <p>Original masterpieces featuring Smart Contract custody, insured fine art transit, and registered Ricardian Contracts.</p>
          </div>
        </div>

        <div class="filter-bar">
          <ul class="category-tabs">
            <li><button class="tab-btn ${currentFilter === 'all' ? 'active' : ''}" data-category="all">All (${getCount('all')})</button></li>
            <li><button class="tab-btn ${currentFilter === 'Oil Painting' ? 'active' : ''}" data-category="Oil Painting">Oil Painting (${getCount('Oil Painting')})</button></li>
            <li><button class="tab-btn ${currentFilter === 'Sculpture' ? 'active' : ''}" data-category="Sculpture">Sculpture (${getCount('Sculpture')})</button></li>
            <li><button class="tab-btn ${currentFilter === 'Mixed Media / Textile' ? 'active' : ''}" data-category="Mixed Media / Textile">Mixed Media / Textile (${getCount('Mixed Media / Textile')})</button></li>
            <li><button class="tab-btn ${currentFilter === 'Geometric Painting' ? 'active' : ''}" data-category="Geometric Painting">Geometric (${getCount('Geometric Painting')})</button></li>
          </ul>

          <div class="search-sort-box">
            <select id="artwork-sort-select" style="padding: 0.5rem 0.85rem; font-size: 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-medium); border-radius: var(--radius-md); color: var(--text-primary);">
              <option value="default" ${sortBy === 'default' ? 'selected' : ''}>Sort: Curated Highlights</option>
              <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>Lowest Price</option>
              <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>Highest Price</option>
            </select>

            <input 
              type="text" 
              class="search-input" 
              id="artwork-search-input" 
              placeholder="Search artist, title, technique..." 
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
                </div>

                <div class="art-card-specs">
                  <div class="spec-item">
                    <span>Dimensions</span>
                    <span>${art.dimensions.split(' ')[0]} ${art.dimensions.split(' ')[1]}</span>
                  </div>
                  <div class="spec-item">
                    <span>Weight</span>
                    <span>${art.weight}</span>
                  </div>
                  <div class="spec-item">
                    <span>NFC Chip</span>
                    <span style="color: var(--gov-green-light);">NTAG 424 DNA</span>
                  </div>
                </div>

                <div class="art-card-footer">
                  <div class="price-box">
                    <span class="price-label">Price</span>
                    <span class="price-val">${formatETH(art.priceEth)}</span>
                  </div>

                  <button class="btn btn-secondary btn-sm btn-open-detail" data-id="${art.id}">
                    <span>View Artwork & Contract</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            </article>
          `).join('') : `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg);">
              <p style="color: var(--text-muted); font-size: 1.1rem;">No artworks found matching your search.</p>
            </div>
          `}
        </div>
      </div>
    </section>
  `;
}

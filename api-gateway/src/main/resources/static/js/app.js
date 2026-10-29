/**
 * Main Application Orchestrator
 * Connects product catalog, search filters, cart drawer, checkout modal,
 * order tracker, toast alerts, and live microservice health monitor.
 */

// Global Filter State
let currentFilter = {
  query: '',
  category: 'All',
  maxPrice: Infinity,
  minRating: 0,
  sort: 'featured'
};

// Toast Notification System
window.showToast = function({ title, message, type = 'info' }) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
  } else if (type === 'warning') {
    iconSvg = '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
  } else {
    iconSvg = '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close notification">&times;</button>
  `;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'toastFadeOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

/**
 * Confirmation banners: page-level success/failure feedback for API results
 * (order placed, payment declined, catalog fallback). Unlike toasts a banner
 * stays until it is dismissed so the customer can actually read the outcome.
 */
let bannerTimer = null;

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

window.showBanner = function({ type = 'info', title = '', message = '', details = '', autoHideMs = 0 } = {}) {
  const container = document.getElementById('app-banner-container');
  if (!container) return;

  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  };

  container.innerHTML = `
    <div class="app-banner app-banner-${escapeHtml(type)}" role="alert" aria-live="assertive">
      <div class="app-banner-icon">${icons[type] || icons.info}</div>
      <div class="app-banner-body">
        <div class="app-banner-title">${escapeHtml(title)}</div>
        ${message ? `<div class="app-banner-message">${escapeHtml(message)}</div>` : ''}
        ${details ? `<div class="app-banner-details">${escapeHtml(details)}</div>` : ''}
      </div>
      <button type="button" class="app-banner-close" onclick="window.hideBanner()" aria-label="Dismiss message">&times;</button>
    </div>
  `;
  container.classList.add('visible');

  if (bannerTimer) clearTimeout(bannerTimer);
  if (autoHideMs > 0) {
    bannerTimer = setTimeout(() => window.hideBanner(), autoHideMs);
  }
};

window.hideBanner = function() {
  const container = document.getElementById('app-banner-container');
  if (!container) return;
  if (bannerTimer) {
    clearTimeout(bannerTimer);
    bannerTimer = null;
  }
  container.classList.remove('visible');
  container.innerHTML = '';
};

/**
 * Loading state for the catalog grid while GET /api/products is in flight.
 */
function renderCatalogLoadingState() {
  const grid = document.getElementById('product-grid');
  const countEl = document.getElementById('results-count');
  const baseUrl = window.ApiClient ? window.ApiClient.getBaseUrl() : 'http://localhost:8080';

  if (countEl) {
    countEl.innerHTML = `Loading products from <strong>${escapeHtml(baseUrl)}/api/products</strong>…`;
  }

  if (!grid) return;

  grid.innerHTML = Array.from({ length: 8 }).map(() => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-block skeleton-image"></div>
      <div class="skeleton-block skeleton-line w-70"></div>
      <div class="skeleton-block skeleton-line"></div>
      <div class="skeleton-block skeleton-line w-45"></div>
      <div class="skeleton-block skeleton-line w-80"></div>
      <div class="skeleton-block skeleton-button"></div>
    </div>
  `).join('');
}

/**
 * Fetch the live catalog from the Spring Boot API Gateway and render it.
 * Falls back to the bundled demo catalog (with a visible banner) when the
 * gateway or the product service is unavailable.
 */
async function loadCatalogFromGateway() {
  if (!window.ApiClient || !window.ProductCatalog) {
    renderProductGrid();
    return;
  }

  renderCatalogLoadingState();
  const result = await window.ProductCatalog.loadProductsFromGateway();

  if (!result.ok) {
    window.ProductCatalog.useFallbackCatalog();
    renderProductGrid();
    window.ShoppingCart.renderUI();
    window.showBanner({
      type: 'warning',
      title: 'Live catalog unavailable — showing the bundled demo catalog',
      message: result.error || 'The API Gateway did not return a product list.',
      details: `Start the microservices stack so GET ${window.ApiClient.getBaseUrl()}/api/products can serve live data.`
    });
    return;
  }

  renderProductGrid();
  window.ShoppingCart.renderUI();

  if (result.count === 0) {
    window.showBanner({
      type: 'info',
      title: 'The product service returned an empty catalog',
      message: `GET ${window.ApiClient.getBaseUrl()}/api/products answered with 0 products.`,
      details: 'Create products through POST /api/products to see them here.'
    });
  }
}

/**
 * Generate 5-star rating SVG markup
 */
function generateStarsHtml(rating) {
  let starsHtml = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHtml += '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    } else if (i === fullStars + 1 && hasHalfStar) {
      starsHtml += '<svg viewBox="0 0 20 20" fill="currentColor"><defs><linearGradient id="halfGrad"><stop offset="50%" stop-color="#ffa41c"/><stop offset="50%" stop-color="#e3e6e6"/></linearGradient></defs><path fill="url(#halfGrad)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    } else {
      starsHtml += '<svg viewBox="0 0 20 20" fill="#e3e6e6"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
  }

  return starsHtml;
}

/**
 * Render the product grid based on current filters
 */
function renderProductGrid() {
  const grid = document.getElementById('product-grid');
  const countEl = document.getElementById('results-count');
  if (!grid) return;

  const products = window.ProductCatalog.filterProducts(currentFilter);

  if (countEl) {
    countEl.innerHTML = `Showing <strong>${products.length}</strong> of <strong>${window.ProductCatalog.getProducts().length}</strong> products`;
  }

  // Update active filter chip indicator
  const activeChipsContainer = document.getElementById('active-filters-chips');
  if (activeChipsContainer) {
    let chipsHtml = '';
    if (currentFilter.category !== 'All') {
      chipsHtml += `
        <span class="filter-chip">
          Category: ${currentFilter.category}
          <button onclick="setCategoryFilter('All')">&times;</button>
        </span>
      `;
    }
    if (currentFilter.query) {
      chipsHtml += `
        <span class="filter-chip">
          "${currentFilter.query}"
          <button onclick="clearSearchFilter()">&times;</button>
        </span>
      `;
    }
    activeChipsContainer.innerHTML = chipsHtml;
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <h3>No matching products found</h3>
        <p>Try checking your spelling or clearing search filters to see all available items.</p>
        <button class="empty-state-btn" onclick="resetAllFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => {
    // Determine badge markup
    let badgeHtml = '';
    if (p.badgeType === 'amazon') {
      badgeHtml = `<div class="badge badge-amazon"><span>Amazon's</span> Choice</div>`;
    } else if (p.badgeType === 'assured') {
      badgeHtml = `
        <div class="badge badge-assured">
          <svg viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          Assured
        </div>
      `;
    } else if (p.badgeType === 'bestseller') {
      badgeHtml = `<div class="badge badge-bestseller">#1 Bestseller</div>`;
    }

    if (p.discountPercent > 0) {
      badgeHtml += `<div class="badge badge-discount">-${p.discountPercent}% OFF</div>`;
    }

    // Stock status class
    let stockClass = 'stock-in';
    let stockText = 'In Stock';
    if (p.stockQuantity <= 0) {
      stockClass = 'stock-out';
      stockText = 'Currently Unavailable';
    } else if (p.stockQuantity <= 5) {
      stockClass = 'stock-low';
      stockText = `Only ${p.stockQuantity} left in stock - order soon`;
    }

    return `
      <article class="product-card" data-id="${p.id}">
        <div class="card-badges">
          ${badgeHtml}
        </div>

        <button class="card-wishlist-btn" onclick="toggleWishlist(this, ${p.id})" title="Add to Wishlist" aria-label="Add to Wishlist">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>

        <div class="card-image-wrap" onclick="openQuickView(${p.id})">
          <img class="card-image" src="${p.image}" alt="${p.name}" loading="lazy" />
        </div>

        <div class="card-category">${p.category}</div>
        <h3 class="card-title" onclick="openQuickView(${p.id})" title="${p.name}">${p.name}</h3>

        <div class="card-rating">
          <div class="stars-wrap">
            ${generateStarsHtml(p.rating)}
          </div>
          ${p.ratingCount > 0
            ? `<span class="rating-score">${p.rating}</span><span class="rating-count">(${p.ratingCount.toLocaleString()})</span>`
            : `<span class="rating-count">No reviews yet</span>`}
        </div>

        <div class="card-price-section">
          <div class="price-current">
            <span class="price-currency">$</span>${p.price.toFixed(2)}
          </div>
          ${p.originalPrice ? `<span class="price-original">$${p.originalPrice.toFixed(2)}</span>` : ''}
          ${p.discountPercent ? `<span class="price-discount-percent">(${p.discountPercent}% off)</span>` : ''}
        </div>

        <div class="card-delivery-info">
          <span class="delivery-prime-badge">⚡ Prime</span>
          <span>FREE Two-Day Delivery</span>
        </div>

        <div class="card-stock-status ${stockClass}">
          ${stockText}
        </div>

        <div class="card-actions">
          <button class="btn btn-cart" onclick="window.ShoppingCart.addToCart(${p.id}, 1, true)" aria-label="Add to Cart">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Add to Cart
          </button>
          
          <button class="btn btn-buy" onclick="handleBuyNow(${p.id})" aria-label="Buy Now">
            <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/></svg>
            Buy Now
          </button>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * "Buy Now" handler: Add item directly to cart and immediately open checkout modal!
 */
function handleBuyNow(productId) {
  window.ShoppingCart.addToCart(productId, 1, false);
  window.Checkout.openModal();
}

/**
 * Toggle product wishlist heart
 */
function toggleWishlist(btn, productId) {
  btn.classList.toggle('active');
  const isActive = btn.classList.contains('active');
  const product = window.ProductCatalog.getProductById(productId);

  if (window.showToast && product) {
    window.showToast({
      title: isActive ? "Added to Wishlist" : "Removed from Wishlist",
      message: product.name.substring(0, 32),
      type: isActive ? "success" : "info"
    });
  }
}

/**
 * Quick View Product Detail Modal
 */
function openQuickView(productId) {
  const product = window.ProductCatalog.getProductById(productId);
  if (!product) return;

  const content = document.getElementById('quick-view-body');
  if (content) {
    content.innerHTML = `
      <div class="quick-view-content">
        <img class="quick-view-img" src="${product.image}" alt="${product.name}" />
        <div class="quick-view-meta">
          <div class="card-category">${product.category}</div>
          <div class="quick-view-sku">SKU: ${product.sku}</div>
          <h2 style="font-size:1.3rem; font-weight:800; line-height:1.3; margin-bottom:10px;">${product.name}</h2>
          
          <div class="card-rating" style="margin-bottom:14px;">
            <div class="stars-wrap">${generateStarsHtml(product.rating)}</div>
            <span class="rating-score">${product.rating}</span>
            <span class="rating-count">${product.ratingCount > 0 ? `(${product.ratingCount.toLocaleString()} reviews)` : 'No reviews yet'}</span>
          </div>

          <div class="card-price-section" style="margin-bottom:14px;">
            <div class="price-current" style="font-size:1.6rem;"><span class="price-currency">$</span>${product.price.toFixed(2)}</div>
            ${product.originalPrice ? `<span class="price-original" style="font-size:1rem;">$${product.originalPrice.toFixed(2)}</span>` : ''}
            ${product.discountPercent ? `<span class="price-discount-percent" style="font-size:1rem;">Save ${product.discountPercent}%</span>` : ''}
          </div>

          <p class="quick-view-desc">${product.description}</p>

          <div style="margin-top:auto; display:flex; gap:12px; padding-top:16px;">
            <button class="btn btn-cart" style="flex:1; padding:12px;" onclick="window.ShoppingCart.addToCart(${product.id}, 1, true); closeQuickView();">
              Add to Cart
            </button>
            <button class="btn btn-buy" style="flex:1; padding:12px;" onclick="closeQuickView(); handleBuyNow(${product.id});">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    `;
  }

  const modal = document.getElementById('quick-view-backdrop');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-backdrop');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Filter handlers
 */
function setCategoryFilter(category) {
  currentFilter.category = category;

  // Update pills active state
  document.querySelectorAll('.category-pill').forEach(pill => {
    if (pill.dataset.category.toLowerCase() === category.toLowerCase()) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Update nav category select if present
  const select = document.getElementById('nav-search-category');
  if (select) {
    select.value = category;
  }

  renderProductGrid();
}

function clearSearchFilter() {
  currentFilter.query = '';
  const input = document.getElementById('nav-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  if (input) input.value = '';
  if (clearBtn) clearBtn.classList.remove('visible');
  renderProductGrid();
}

function resetAllFilters() {
  currentFilter = {
    query: '',
    category: 'All',
    maxPrice: Infinity,
    minRating: 0,
    sort: 'featured'
  };
  const input = document.getElementById('nav-search-input');
  if (input) input.value = '';
  setCategoryFilter('All');
  renderProductGrid();
}

/**
 * Deal of the Day Countdown Timer
 */
function initCountdownTimer() {
  let totalSeconds = 9 * 3600 + 42 * 60 + 18; // 9 hours, 42 minutes, 18 seconds
  const hoursEl = document.getElementById('timer-hours');
  const minsEl = document.getElementById('timer-mins');
  const secsEl = document.getElementById('timer-secs');

  setInterval(() => {
    if (totalSeconds <= 0) totalSeconds = 24 * 3600;
    totalSeconds--;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
  }, 1000);
}

/**
 * Initialize event bindings on DOM Ready
 */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Modules
  window.ShoppingCart.init();
  window.Checkout.init();
  initCountdownTimer();

  // 2. Show the loading state, then fetch and render the live catalog
  renderCatalogLoadingState();
  loadCatalogFromGateway();

  // 3. Search Bar Bindings
  const searchInput = document.getElementById('nav-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const categorySelect = document.getElementById('nav-search-category');
  const searchForm = document.getElementById('nav-search-form');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilter.query = e.target.value;
      if (clearBtn) {
        if (e.target.value.length > 0) clearBtn.classList.add('visible');
        else clearBtn.classList.remove('visible');
      }
      renderProductGrid();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearSearchFilter);
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      setCategoryFilter(e.target.value);
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      renderProductGrid();
    });
  }

  // 4. Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentFilter.sort = e.target.value;
      renderProductGrid();
    });
  }

  // 5. Category Pills click listeners
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.dataset.category;
      setCategoryFilter(cat);
    });
  });

  // 6. Cart Drawer & Checkout Triggers
  const cartBtn = document.getElementById('nav-cart-btn');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartClose = document.getElementById('cart-close-btn');

  if (cartBtn) cartBtn.addEventListener('click', window.ShoppingCart.openDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', window.ShoppingCart.closeDrawer);
  if (cartClose) cartClose.addEventListener('click', window.ShoppingCart.closeDrawer);

  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', window.Checkout.openModal);

  // 7. Checkout Modal Triggers
  const checkoutBackdrop = document.getElementById('checkout-backdrop');
  const checkoutClose = document.getElementById('checkout-close-btn');
  const checkoutSubmit = document.getElementById('checkout-submit-btn');

  if (checkoutBackdrop) {
    checkoutBackdrop.addEventListener('click', (e) => {
      if (e.target === checkoutBackdrop) window.Checkout.closeModal();
    });
  }
  if (checkoutClose) checkoutClose.addEventListener('click', window.Checkout.closeModal);
  if (checkoutSubmit) checkoutSubmit.addEventListener('click', window.Checkout.submitCheckout);

  // 8. Order Tracker Triggers
  const navTrackBtn = document.getElementById('nav-track-btn');
  const trackerBackdrop = document.getElementById('tracker-backdrop');
  const trackerClose = document.getElementById('tracker-close-btn');
  const trackerSearchBtn = document.getElementById('tracker-search-btn');
  const trackerInput = document.getElementById('tracker-search-input');

  if (navTrackBtn) navTrackBtn.addEventListener('click', window.OrderTracker.openTracker);
  if (trackerBackdrop) {
    trackerBackdrop.addEventListener('click', (e) => {
      if (e.target === trackerBackdrop) window.OrderTracker.closeTracker();
    });
  }
  if (trackerClose) trackerClose.addEventListener('click', window.OrderTracker.closeTracker);
  if (trackerSearchBtn && trackerInput) {
    trackerSearchBtn.addEventListener('click', () => {
      window.OrderTracker.trackOrder(trackerInput.value);
    });
    trackerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.OrderTracker.trackOrder(trackerInput.value);
      }
    });
  }

  // 9. Quick View Close
  const quickViewBackdrop = document.getElementById('quick-view-backdrop');
  const quickViewClose = document.getElementById('quick-view-close-btn');
  if (quickViewBackdrop) {
    quickViewBackdrop.addEventListener('click', (e) => {
      if (e.target === quickViewBackdrop) closeQuickView();
    });
  }
  if (quickViewClose) quickViewClose.addEventListener('click', closeQuickView);

  // 10. Back to top button
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  });

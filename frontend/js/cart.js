/**
 * Shopping Cart Manager
 * Manages cart state, localStorage persistence, drawer rendering,
 * free shipping calculations, and checkout triggers.
 */

const CART_STORAGE_KEY = 'ecommerce_cart_items_v1';
const FREE_SHIPPING_THRESHOLD = 50.00;
const STANDARD_SHIPPING_FEE = 5.99;
const TAX_RATE = 0.08; // 8% sales tax

let cartItems = [];

// Initialize cart from localStorage
function initCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      cartItems = JSON.parse(saved);
    } else {
      // Seed initial sample item for rich initial view
      cartItems = [
        { productId: 2, quantity: 1 }
      ];
    }
  } catch (e) {
    console.error('Failed to load cart from storage', e);
    cartItems = [];
  }
  renderCartUI();
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (e) {
    console.error('Failed to save cart to storage', e);
  }
}

function getCartItems() {
  return cartItems;
}

function getCartCount() {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotals() {
  let subtotal = 0;
  let totalSavings = 0;

  cartItems.forEach(item => {
    const product = window.ProductCatalog.getProductById(item.productId);
    if (product) {
      subtotal += product.price * item.quantity;
      if (product.originalPrice && product.originalPrice > product.price) {
        totalSavings += (product.originalPrice - product.price) * item.quantity;
      }
    }
  });

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + shipping + tax;

  return {
    subtotal,
    shipping,
    tax,
    totalSavings,
    grandTotal,
    qualifiesForFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
    amountNeededForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  };
}

/**
 * Add a product to cart
 */
function addToCart(productId, qty = 1, openDrawer = true) {
  const product = window.ProductCatalog.getProductById(productId);
  if (!product) return;

  const existing = cartItems.find(item => item.productId === Number(productId));
  if (existing) {
    existing.quantity += qty;
  } else {
    cartItems.push({
      productId: Number(productId),
      quantity: qty
    });
  }

  saveCart();
  renderCartUI();
  animateCartBadge();

  if (window.showToast) {
    window.showToast({
      title: "Added to Cart!",
      message: `${product.name.substring(0, 32)}...`,
      type: "success"
    });
  }

  if (openDrawer) {
    openCartDrawer();
  }
}

/**
 * Update quantity of a product in cart
 */
function updateQuantity(productId, qty) {
  const item = cartItems.find(i => i.productId === Number(productId));
  if (!item) return;

  if (qty <= 0) {
    removeFromCart(productId);
  } else {
    item.quantity = qty;
    saveCart();
    renderCartUI();
  }
}

/**
 * Remove product from cart
 */
function removeFromCart(productId) {
  const product = window.ProductCatalog.getProductById(productId);
  cartItems = cartItems.filter(i => i.productId !== Number(productId));
  saveCart();
  renderCartUI();

  if (window.showToast && product) {
    window.showToast({
      title: "Removed from Cart",
      message: product.name.substring(0, 30),
      type: "warning"
    });
  }
}

/**
 * Empty the entire cart
 */
function clearCart() {
  cartItems = [];
  saveCart();
  renderCartUI();
}

/**
 * Open Slide-out Drawer
 */
function openCartDrawer() {
  const backdrop = document.getElementById('cart-backdrop');
  const drawer = document.getElementById('cart-drawer');
  if (backdrop && drawer) {
    backdrop.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close Slide-out Drawer
 */
function closeCartDrawer() {
  const backdrop = document.getElementById('cart-backdrop');
  const drawer = document.getElementById('cart-drawer');
  if (backdrop && drawer) {
    backdrop.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Bounce animation on cart counter in nav bar
 */
function animateCartBadge() {
  const badge = document.getElementById('nav-cart-count');
  if (badge) {
    badge.classList.remove('bump');
    void badge.offsetWidth; // Trigger reflow
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 300);
  }
}

/**
 * Render entire cart UI (header count, list of items, summary)
 */
function renderCartUI() {
  const count = getCartCount();
  const totals = getCartTotals();

  // Top nav cart badge
  const navCount = document.getElementById('nav-cart-count');
  if (navCount) {
    navCount.textContent = count;
  }

  // Top nav cart subtotal text
  const navTotal = document.getElementById('nav-cart-total');
  if (navTotal) {
    navTotal.textContent = `$${totals.subtotal.toFixed(2)}`;
  }

  // Drawer title count
  const drawerCount = document.getElementById('drawer-cart-count');
  if (drawerCount) {
    drawerCount.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  }

  // Free delivery progress bar
  const shippingBarText = document.getElementById('shipping-bar-text');
  const shippingBarFill = document.getElementById('shipping-bar-fill');
  if (shippingBarText && shippingBarFill) {
    if (totals.subtotal === 0) {
      shippingBarText.innerHTML = `<span>Free delivery on orders over <strong>$${FREE_SHIPPING_THRESHOLD.toFixed(2)}</strong></span>`;
      shippingBarFill.style.width = '0%';
    } else if (totals.qualifiesForFreeShipping) {
      shippingBarText.innerHTML = `<span>🎉 <strong>You've unlocked FREE Delivery!</strong></span>`;
      shippingBarFill.style.width = '100%';
    } else {
      const pct = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      shippingBarText.innerHTML = `<span>Add <strong>$${totals.amountNeededForFreeShipping.toFixed(2)}</strong> more for <strong>FREE Delivery</strong></span>`;
      shippingBarFill.style.width = `${pct}%`;
    }
  }

  // Drawer items container
  const itemsContainer = document.getElementById('cart-items-container');
  const emptyContainer = document.getElementById('cart-empty-container');
  const footerContainer = document.getElementById('cart-footer-container');

  if (!itemsContainer) return;

  if (cartItems.length === 0) {
    itemsContainer.style.display = 'none';
    if (footerContainer) footerContainer.style.display = 'none';
    if (emptyContainer) emptyContainer.style.display = 'flex';
    return;
  }

  itemsContainer.style.display = 'flex';
  if (emptyContainer) emptyContainer.style.display = 'none';
  if (footerContainer) footerContainer.style.display = 'block';

  // Render cart items HTML
  itemsContainer.innerHTML = cartItems.map(item => {
    const product = window.ProductCatalog.getProductById(item.productId);
    if (!product) return '';

    const itemTotal = (product.price * item.quantity).toFixed(2);

    return `
      <div class="cart-item" data-id="${product.id}">
        <img class="cart-item-img" src="${product.image}" alt="${product.name}" />
        <div class="cart-item-info">
          <h4 class="cart-item-title" title="${product.name}">${product.name}</h4>
          <div class="cart-item-price">$${product.price.toFixed(2)} <span style="font-size:0.75rem; color:#6b7280; font-weight:normal;">($${itemTotal})</span></div>
          
          <div class="cart-item-controls">
            <div class="qty-stepper">
              <button class="qty-btn" onclick="window.ShoppingCart.updateQuantity(${product.id}, ${item.quantity - 1})" aria-label="Decrease quantity">−</button>
              <input class="qty-input" type="text" value="${item.quantity}" readonly />
              <button class="qty-btn" onclick="window.ShoppingCart.updateQuantity(${product.id}, ${item.quantity + 1})" aria-label="Increase quantity">+</button>
            </div>
            
            <button class="cart-remove-btn" onclick="window.ShoppingCart.removeFromCart(${product.id})">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Update Footer summary numbers
  const subtotalEl = document.getElementById('cart-summary-subtotal');
  const shippingEl = document.getElementById('cart-summary-shipping');
  const taxEl = document.getElementById('cart-summary-tax');
  const totalEl = document.getElementById('cart-summary-total');
  const savingsRow = document.getElementById('cart-savings-row');
  const savingsEl = document.getElementById('cart-summary-savings');

  if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${totals.tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${totals.grandTotal.toFixed(2)}`;

  if (savingsRow && savingsEl) {
    if (totals.totalSavings > 0) {
      savingsRow.style.display = 'flex';
      savingsEl.textContent = `-$${totals.totalSavings.toFixed(2)}`;
    } else {
      savingsRow.style.display = 'none';
    }
  }
}

// Global Export
window.ShoppingCart = {
  init: initCart,
  getCartItems,
  getCartCount,
  getCartTotals,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  openDrawer: openCartDrawer,
  closeDrawer: closeCartDrawer,
  renderUI: renderCartUI
};

/**
 * Checkout & Payment Modal Controller
 * Manages form fields, live credit card preview synchronization,
 * coupon discounts, form validation, and payment execution.
 */

let activePaymentMethod = 'CREDIT_CARD';
let appliedDiscountPercent = 0;
let appliedCouponCode = '';

/**
 * Storefront payment tab -> backend PaymentMethod enum
 * (PaymentMethod: CREDIT_CARD, DEBIT_CARD, PAYPAL, UPI, BANK_TRANSFER).
 * "Net Banking" maps to BANK_TRANSFER. Cash on Delivery has no counterpart in
 * the payment service, so null means "place the order, collect cash on delivery".
 */
const PAYMENT_METHOD_MAP = {
  CREDIT_CARD: 'CREDIT_CARD',
  UPI: 'UPI',
  NET_BANKING: 'BANK_TRANSFER',
  CASH_ON_DELIVERY: null
};

// The Order Service requires a numeric customerId (CreateOrderRequest.customerId @NotNull).
// This stack has no auth service yet, so a stable demo customer id is used.
const CHECKOUT_CUSTOMER_ID = 101;

function initCheckout() {
  bindCardInputs();
  bindPaymentTabs();
  bindCouponInput();
}

/**
 * Open Checkout Modal
 */
function openCheckoutModal() {
  const cartItems = window.ShoppingCart.getCartItems();
  if (cartItems.length === 0) {
    if (window.showToast) {
      window.showToast({
        title: "Cart is Empty",
        message: "Add some items to your cart before proceeding to checkout.",
        type: "warning"
      });
    }
    return;
  }

  // Close cart drawer if open
  window.ShoppingCart.closeDrawer();

  // Reset order success state
  const formCol = document.getElementById('checkout-form-col');
  const summaryCol = document.getElementById('checkout-summary-col');
  const successView = document.getElementById('checkout-success-view');

  if (formCol) formCol.style.display = 'block';
  if (summaryCol) summaryCol.style.display = 'flex';
  if (successView) successView.style.display = 'none';

  renderCheckoutSummary();

  const backdrop = document.getElementById('checkout-backdrop');
  if (backdrop) {
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close Checkout Modal
 */
function closeCheckoutModal() {
  const backdrop = document.getElementById('checkout-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Render order items review in the right column of checkout modal
 */
function renderCheckoutSummary() {
  const cartItems = window.ShoppingCart.getCartItems();
  const totals = window.ShoppingCart.getCartTotals();

  // Render items list
  const listEl = document.getElementById('checkout-items-list');
  if (listEl) {
    listEl.innerHTML = cartItems.map(item => {
      const product = window.ProductCatalog.getProductById(item.productId);
      if (!product) return '';
      return `
        <div class="summary-item-row">
          <img class="summary-item-img" src="${product.image}" alt="${product.name}" />
          <div class="summary-item-details">
            <div class="summary-item-name" title="${product.name}">${product.name}</div>
            <div class="summary-item-qty">Qty: ${item.quantity} × $${product.price.toFixed(2)}</div>
          </div>
          <div class="summary-item-price">$${(product.price * item.quantity).toFixed(2)}</div>
        </div>
      `;
    }).join('');
  }

  // Calculate discount if coupon applied
  const discountAmount = (totals.subtotal * appliedDiscountPercent) / 100;
  const finalSubtotal = Math.max(0, totals.subtotal - discountAmount);
  const finalShipping = totals.shipping;
  const finalTax = finalSubtotal * 0.08;
  const finalGrandTotal = finalSubtotal + finalShipping + finalTax;

  // Update breakdown
  const subtotalEl = document.getElementById('checkout-subtotal');
  const shippingEl = document.getElementById('checkout-shipping');
  const taxEl = document.getElementById('checkout-tax');
  const discountRow = document.getElementById('checkout-discount-row');
  const discountEl = document.getElementById('checkout-discount');
  const totalEl = document.getElementById('checkout-total');
  const submitBtnText = document.getElementById('checkout-btn-text');

  if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = finalShipping === 0 ? 'FREE' : `$${finalShipping.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${finalTax.toFixed(2)}`;

  if (discountRow && discountEl) {
    if (discountAmount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `-$${discountAmount.toFixed(2)} (${appliedDiscountPercent}%)`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (totalEl) totalEl.textContent = `$${finalGrandTotal.toFixed(2)}`;
  if (submitBtnText) submitBtnText.textContent = `Place Order & Pay $${finalGrandTotal.toFixed(2)}`;
}

/**
 * Payment method tab selection (Card, UPI, Net Banking, COD)
 */
function bindPaymentTabs() {
  const tabs = document.querySelectorAll('.payment-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      activePaymentMethod = tab.dataset.method;

      // Toggle Panels
      const cardPanel = document.getElementById('card-payment-panel');
      const upiPanel = document.getElementById('upi-payment-panel');
      const nbPanel = document.getElementById('nb-payment-panel');
      const codPanel = document.getElementById('cod-payment-panel');

      if (cardPanel) cardPanel.style.display = activePaymentMethod === 'CREDIT_CARD' ? 'block' : 'none';
      if (upiPanel) upiPanel.style.display = activePaymentMethod === 'UPI' ? 'block' : 'none';
      if (nbPanel) nbPanel.style.display = activePaymentMethod === 'NET_BANKING' ? 'block' : 'none';
      if (codPanel) codPanel.style.display = activePaymentMethod === 'CASH_ON_DELIVERY' ? 'block' : 'none';
    });
  });
}

/**
 * Synchronize Card Inputs to the 3D Virtual Card Preview in real time
 */
function bindCardInputs() {
  const cardNumInput = document.getElementById('card-number-input');
  const cardHolderInput = document.getElementById('card-holder-input');
  const cardExpiryInput = document.getElementById('card-expiry-input');

  const previewNumber = document.getElementById('preview-card-number');
  const previewHolder = document.getElementById('preview-card-holder');
  const previewExpiry = document.getElementById('preview-card-expiry');
  const previewBrand = document.getElementById('preview-card-brand');
  const inputBrandIcon = document.getElementById('card-brand-icon');

  if (cardNumInput) {
    cardNumInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      // Format with spaces
      let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
      e.target.value = formatted;

      // Update Preview
      if (previewNumber) {
        if (!val) {
          previewNumber.textContent = '•••• •••• •••• ••••';
        } else {
          // Pad remaining digits with dots
          let padded = val.padEnd(16, '•');
          previewNumber.textContent = padded.match(/.{1,4}/g)?.join(' ') || '';
        }
      }

      // Detect Brand
      let brand = 'VISA';
      if (val.startsWith('4')) {
        brand = 'VISA';
      } else if (val.startsWith('5') || val.startsWith('2')) {
        brand = 'MASTERCARD';
      } else if (val.startsWith('34') || val.startsWith('37')) {
        brand = 'AMEX';
      } else if (val.startsWith('60') || val.startsWith('65')) {
        brand = 'RUPAY';
      }

      if (previewBrand) previewBrand.textContent = brand;
      if (inputBrandIcon) inputBrandIcon.textContent = brand;
    });
  }

  if (cardHolderInput) {
    cardHolderInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (previewHolder) {
        previewHolder.textContent = val ? val.toUpperCase() : 'JOHN DOE';
      }
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 3) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
      e.target.value = val;
      if (previewExpiry) {
        previewExpiry.textContent = val ? val : 'MM/YY';
      }
    });
  }
}

/**
 * Promo code / Coupon handler
 */
function bindCouponInput() {
  const couponBtn = document.getElementById('apply-coupon-btn');
  const couponInput = document.getElementById('coupon-input');

  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (code === 'SAVE20') {
        appliedDiscountPercent = 20;
        appliedCouponCode = code;
        renderCheckoutSummary();
        if (window.showToast) {
          window.showToast({
            title: "Coupon Applied!",
            message: "You saved 20% on this order with code SAVE20!",
            type: "success"
          });
        }
      } else if (code === 'WELCOME10') {
        appliedDiscountPercent = 10;
        appliedCouponCode = code;
        renderCheckoutSummary();
        if (window.showToast) {
          window.showToast({
            title: "Coupon Applied!",
            message: "You saved 10% on your first order!",
            type: "success"
          });
        }
      } else if (code === '') {
        appliedDiscountPercent = 0;
        appliedCouponCode = '';
        renderCheckoutSummary();
      } else {
        if (window.showToast) {
          window.showToast({
            title: "Invalid Coupon",
            message: "Try code 'SAVE20' or 'WELCOME10'",
            type: "error"
          });
        }
      }
    });
  }
}

/**
 * Validate form inputs
 */
function validateCheckoutForm() {
  let isValid = true;

  const fields = [
    { id: 'ship-name', validate: val => val.trim().length >= 2 },
    { id: 'ship-phone', validate: val => val.replace(/\D/g, '').length >= 10 },
    { id: 'ship-email', validate: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) },
    { id: 'ship-address', validate: val => val.trim().length >= 5 },
    { id: 'ship-city', validate: val => val.trim().length >= 2 },
    { id: 'ship-zip', validate: val => val.trim().length >= 4 }
  ];

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el) {
      if (!f.validate(el.value)) {
        el.classList.add('input-error');
        isValid = false;
      } else {
        el.classList.remove('input-error');
      }
    }
  });

  // Card validation if credit card selected
  if (activePaymentMethod === 'CREDIT_CARD') {
    const cardNum = document.getElementById('card-number-input');
    const cardHolder = document.getElementById('card-holder-input');
    const cardExpiry = document.getElementById('card-expiry-input');
    const cardCvv = document.getElementById('card-cvv-input');

    if (cardNum && cardNum.value.replace(/\D/g, '').length !== 16) {
      cardNum.classList.add('input-error');
      isValid = false;
    } else if (cardNum) cardNum.classList.remove('input-error');

    if (cardHolder && cardHolder.value.trim().length < 3) {
      cardHolder.classList.add('input-error');
      isValid = false;
    } else if (cardHolder) cardHolder.classList.remove('input-error');

    if (cardExpiry && cardExpiry.value.length < 5) {
      cardExpiry.classList.add('input-error');
      isValid = false;
    } else if (cardExpiry) cardExpiry.classList.remove('input-error');

    if (cardCvv && cardCvv.value.length < 3) {
      cardCvv.classList.add('input-error');
      isValid = false;
    } else if (cardCvv) cardCvv.classList.remove('input-error');
  }

  // UPI validation when an instant transfer is selected
  if (activePaymentMethod === 'UPI') {
    const upiInput = document.getElementById('upi-id-input');
    const upiValid = !!upiInput && /^[\w.\-]{2,}@[A-Za-z]{2,}$/.test(upiInput.value.trim());
    if (upiInput) upiInput.classList.toggle('input-error', !upiValid);
    if (!upiValid) isValid = false;
  }

  return isValid;
}

/**
 * Toggle the checkout button spinner and step label while API calls run.
 */
function setCheckoutLoading(isLoading, label) {
  const submitBtn = document.getElementById('checkout-submit-btn');
  const btnText = document.getElementById('checkout-btn-text');

  if (submitBtn) {
    submitBtn.classList.toggle('loading', isLoading);
    submitBtn.disabled = isLoading;
    submitBtn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  }

  if (btnText) {
    if (isLoading) {
      btnText.textContent = label || 'Processing…';
    } else {
      renderCheckoutSummary(); // restores the "Place Order & Pay $X" label
    }
  }
}

/**
 * Handle checkout submission
 */
async function submitCheckout() {
  if (!validateCheckoutForm()) {
    if (window.showToast) {
      window.showToast({
        title: "Missing Information",
        message: "Please fill out all required fields marked in red.",
        type: "error"
      });
    }
    return;
  }

  const cartItems = window.ShoppingCart.getCartItems();
  if (cartItems.length === 0) {
    if (window.showToast) {
      window.showToast({
        title: "Cart is Empty",
        message: "Add some items to your cart before placing an order.",
        type: "warning"
      });
    }
    return;
  }

  // Gather the customer + address payload
  const name = document.getElementById('ship-name').value.trim();
  const phone = document.getElementById('ship-phone').value.trim();
  const email = document.getElementById('ship-email').value.trim();
  const address = document.getElementById('ship-address').value.trim();
  const city = document.getElementById('ship-city').value.trim();
  const zip = document.getElementById('ship-zip').value.trim();
  const fullAddress = `${address}, ${city} - ${zip}`;

  // Client-side estimate; the authoritative total comes back from the Order Service
  const totals = window.ShoppingCart.getCartTotals();
  const discountAmount = (totals.subtotal * appliedDiscountPercent) / 100;
  const discountedSubtotal = Math.max(0, totals.subtotal - discountAmount);
  const estimatedTotal = discountedSubtotal + totals.shipping + (discountedSubtotal * 0.08);

  window.hideBanner();
  setCheckoutLoading(true, 'Creating order…');

  // ── 1. POST /api/orders (CreateOrderRequest) ───────────────────────────────
  const orderPayload = {
    customerId: CHECKOUT_CUSTOMER_ID,
    items: cartItems.map(item => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity)
    })),
    shippingAddress: fullAddress,
    notes: `Customer: ${name} | ${phone} | ${email}` + (appliedCouponCode ? ` | Coupon: ${appliedCouponCode}` : '')
  };

  const orderResult = await window.ApiClient.submitOrderToGateway(orderPayload);

  if (!orderResult.ok) {
    setCheckoutLoading(false);
    window.showBanner({
      type: 'error',
      title: 'Order could not be placed',
      message: orderResult.error || 'The order service rejected the request.',
      details: `POST ${window.ApiClient.getBaseUrl()}/api/orders returned ${orderResult.status || 'no response'}. Your cart has been kept, nothing was charged.`
    });
    return;
  }

  const order = orderResult.data || {};
  const orderNumber = order.orderNumber || (order.id != null ? `#${order.id}` : 'unknown');
  const backendTotal = Number(order.totalAmount);
  const payableAmount = Number.isFinite(backendTotal) && backendTotal > 0 ? backendTotal : estimatedTotal;
  const backendPaymentMethod = PAYMENT_METHOD_MAP[activePaymentMethod];

  if (order.id == null) {
    setCheckoutLoading(false);
    window.showBanner({
      type: 'error',
      title: 'Order created without an id',
      message: `The order service answered but returned no order id, so payment could not be started.`,
      details: `Order reference: ${orderNumber}. Check the order service logs before retrying.`
    });
    return;
  }

  // ── 2. Cash on delivery: order only, no online transaction ────────────────
  if (!backendPaymentMethod) {
    setCheckoutLoading(false);
    window.ShoppingCart.clearCart();
    showOrderSuccess({
      orderNumber,
      address: fullAddress,
      total: payableAmount,
      paymentStatus: 'PAY_ON_DELIVERY'
    });
    return;
  }

  // ── 3. POST /api/payments (PaymentRequest) ────────────────────────────────
  setCheckoutLoading(true, 'Processing payment…');

  const isCardPayment = activePaymentMethod === 'CREDIT_CARD';
  const paymentPayload = {
    orderId: Number(order.id),
    customerId: CHECKOUT_CUSTOMER_ID,
    amount: payableAmount,
    paymentMethod: backendPaymentMethod,
    cardNumber: isCardPayment ? (document.getElementById('card-number-input')?.value || '').replace(/\s/g, '') || null : null,
    cvv: isCardPayment ? (document.getElementById('card-cvv-input')?.value || null) : null,
    expiryDate: isCardPayment ? (document.getElementById('card-expiry-input')?.value || null) : null,
    upiId: activePaymentMethod === 'UPI' ? (document.getElementById('upi-id-input')?.value.trim() || null) : null
  };

  const paymentResult = await window.ApiClient.submitPaymentToGateway(paymentPayload);
  setCheckoutLoading(false);

  if (!paymentResult.ok) {
    window.showBanner({
      type: 'error',
      title: `Payment failed for order ${orderNumber}`,
      message: paymentResult.error || 'The payment service declined the transaction.',
      details: `POST ${window.ApiClient.getBaseUrl()}/api/payments returned ${paymentResult.status || 'no response'}. The order exists but is unpaid — no stock was released.`
    });
    return;
  }

  // ── 4. Paid: clear the cart and confirm ───────────────────────────────────
  window.ShoppingCart.clearCart();
  showOrderSuccess({
    orderNumber,
    address: fullAddress,
    total: payableAmount,
    paymentStatus: paymentResult.paymentStatus || 'SUCCESS',
    transactionId: paymentResult.transactionId
  });
}

/**
 * Display Order Success confirmation with the real backend order number,
 * the server-calculated total and the payment outcome.
 */
function showOrderSuccess({ orderNumber, address, total, paymentStatus = 'SUCCESS', transactionId = null }) {
  const formCol = document.getElementById('checkout-form-col');
  const summaryCol = document.getElementById('checkout-summary-col');
  const successView = document.getElementById('checkout-success-view');

  if (formCol) formCol.style.display = 'none';
  if (summaryCol) summaryCol.style.display = 'none';

  if (successView) {
    successView.style.display = 'flex';
    document.getElementById('success-order-id').textContent = orderNumber;
    document.getElementById('success-address').textContent = address;
    document.getElementById('success-total').textContent = `$${total.toFixed(2)}`;

    // Set tracker trigger button
    const trackBtn = document.getElementById('success-track-btn');
    if (trackBtn) {
      trackBtn.onclick = () => {
        closeCheckoutModal();
        window.OrderTracker.openTrackerWithOrder(orderNumber);
      };
    }
  }

  const paymentLine = paymentStatus === 'PAY_ON_DELIVERY'
    ? 'Payment due on delivery (no online transaction recorded).'
    : `Payment ${paymentStatus}${transactionId ? ` • Transaction ${transactionId}` : ''}.`;

  window.showBanner({
    type: 'success',
    title: `Order ${orderNumber} confirmed`,
    message: `Total $${total.toFixed(2)} — ${paymentLine}`,
    details: `Shipping to ${address}`,
    autoHideMs: 10000
  });

  if (window.showToast) {
    window.showToast({
      title: "Order Placed Successfully!",
      message: `Order #${orderNumber} confirmed. Thank you!`,
      type: "success"
    });
  }
}

// Global Export
window.Checkout = {
  init: initCheckout,
  openModal: openCheckoutModal,
  closeModal: closeCheckoutModal,
  submitCheckout
};

/**
 * Backend API Client
 * Communicates with Spring Cloud API Gateway (Default: http://localhost:8080)
 * Gracefully switches between live microservice backend and simulated demo mode.
 */

const DEFAULT_API_BASE_URL = 'http://localhost:8080';

let currentApiBase = DEFAULT_API_BASE_URL;
let isBackendOnline = false;

/**
 * Check if the Spring Boot API Gateway is reachable
 */
async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${currentApiBase}/api/products`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      isBackendOnline = true;
      updateStatusBadge(true);
      return true;
    }
  } catch (err) {
    // Gateway is offline or CORS blocked -> fallback to standalone demo mode
  }

  isBackendOnline = false;
  updateStatusBadge(false);
  return false;
}

/**
 * Update the Status Pill in toolbar
 */
function updateStatusBadge(online) {
  const pill = document.getElementById('api-status-pill');
  if (pill) {
    if (online) {
      pill.className = 'api-status-pill';
      pill.innerHTML = `<span class="api-status-dot"></span> Gateway: Connected (:8080)`;
      pill.title = 'Live Spring Cloud API Gateway connection active';
    } else {
      pill.className = 'api-status-pill offline';
      pill.innerHTML = `<span class="api-status-dot"></span> Gateway: Standalone Demo Mode`;
      pill.title = 'Running standalone in client mode. Start docker-compose or Spring Boot gateway on :8080 to sync live microservices.';
    }
  }
}

/**
 * Fetch products from Spring Boot Product Service via API Gateway
 */
async function fetchProductsFromGateway() {
  try {
    const res = await fetch(`${currentApiBase}/api/products`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API Gateway not reachable, using fallback catalog');
  }
  return null;
}

/**
 * Post an Order to Spring Boot Order Service via API Gateway
 * Matching CreateOrderRequest: { customerId, items: [{ productId, quantity }], shippingAddress, notes }
 */
async function submitOrderToGateway(orderRequest) {
  if (!isBackendOnline) {
    // Return mock successful order response
    return {
      success: true,
      data: {
        id: Math.floor(1000 + Math.random() * 9000),
        orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'CONFIRMED',
        totalAmount: orderRequest.totalAmount,
        shippingAddress: orderRequest.shippingAddress,
        createdAt: new Date().toISOString()
      }
    };
  }

  try {
    const res = await fetch(`${currentApiBase}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderRequest)
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    } else {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.message || 'Gateway returned order error' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Post a Payment to Spring Boot Payment Service via API Gateway
 * Matching PaymentRequest: { orderId, customerId, amount, paymentMethod, cardNumber, cvv, expiryDate, upiId }
 */
async function submitPaymentToGateway(paymentRequest) {
  if (!isBackendOnline) {
    return {
      success: true,
      data: {
        id: Math.floor(5000 + Math.random() * 5000),
        transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
        status: 'SUCCESS',
        amount: paymentRequest.amount
      }
    };
  }

  try {
    const res = await fetch(`${currentApiBase}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentRequest)
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    } else {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.message || 'Payment processing failed' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Track order by Order Number or ID
 */
async function fetchOrderDetails(orderIdOrNumber) {
  if (!isBackendOnline) {
    return null; // Fallback will handle demo order
  }

  try {
    const url = isNaN(orderIdOrNumber)
      ? `${currentApiBase}/api/orders/number/${orderIdOrNumber}`
      : `${currentApiBase}/api/orders/${orderIdOrNumber}`;

    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to fetch order from gateway', e);
  }
  return null;
}

// Global Export
window.ApiClient = {
  checkBackendHealth,
  fetchProductsFromGateway,
  submitOrderToGateway,
  submitPaymentToGateway,
  fetchOrderDetails,
  isOnline: () => isBackendOnline
};

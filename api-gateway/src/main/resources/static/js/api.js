/**
 * Backend API Client
 * Communicates with the Spring Cloud API Gateway (default: http://localhost:8080)
 *
 * Endpoints wired up here:
 *   GET  /api/products                            -> ProductResponse[]
 *   POST /api/orders                              -> CreateOrderRequest -> OrderResponse (201)
 *   POST /api/payments                            -> PaymentRequest -> PaymentResponse (201 SUCCESS / 402 FAILED)
 *   GET  /api/orders/{id} | /api/orders/number/{n} -> OrderResponse
 *
 * Every call resolves to { ok, status, data, error, durationMs } so the UI can
 * render a real success/failure banner instead of guessing. Order and payment
 * calls are never mocked: if the gateway is unreachable the customer is told.
 */

const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const API_TIMEOUT_MS = 8000;    // catalog, order and payment calls
const HEALTH_TIMEOUT_MS = 2500; // quick gateway probe

let currentApiBase = DEFAULT_API_BASE_URL;
let isBackendOnline = false;

/**
 * Turn any Spring Boot / gateway error body into one readable sentence.
 * Covers ErrorResponse {timestamp,status,error,message,path}, bean-validation
 * bodies {errors:{field:msg}} and non-JSON (HTML) error pages.
 */
function extractApiError(payload, fallback) {
  if (payload == null) return fallback;

  if (typeof payload === 'string') {
    const text = payload.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.slice(0, 200) : fallback;
  }

  if (typeof payload.message === 'string' && payload.message) return payload.message;
  if (typeof payload.error === 'string' && payload.error) return payload.error;

  if (payload.errors && typeof payload.errors === 'object') {
    const parts = Object.entries(payload.errors).map(([field, msg]) => `${field}: ${msg}`);
    if (parts.length) return parts.join('; ');
  }

  return fallback;
}

/**
 * Network, CORS and timeout failures need a different explanation than a 4xx.
 */
function describeNetworkFailure(err, url) {
  if (err && err.name === 'AbortError') {
    return `No response from ${url} (timed out). Is the API Gateway running on ${currentApiBase}?`;
  }
  return `Cannot reach ${url}. The API Gateway is not responding, or CORS blocked the request from ${window.location.origin || 'this origin'}.`;
}

/**
 * Low-level fetch helper: JSON in / JSON out, hard timeout, never throws.
 * @returns {Promise<{ok:boolean,status:number,data:any,error?:string,durationMs:number,networkError?:boolean}>}
 */
async function apiRequest(path, { method = 'GET', body, timeoutMs = API_TIMEOUT_MS } = {}) {
  const url = `${currentApiBase}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const res = await fetch(url, {
      method,
      mode: 'cors',
      cache: 'no-store',
      headers: body
        ? { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        : { 'Accept': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    const raw = await res.text();
    let data = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (parseErr) {
        data = raw; // HTML/text error page from the gateway
      }
    }

    const durationMs = Date.now() - startedAt;

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data,
        durationMs,
        error: extractApiError(data, `${method} ${path} failed with HTTP ${res.status}`)
      };
    }

    return { ok: true, status: res.status, data, durationMs };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      durationMs: Date.now() - startedAt,
      networkError: true,
      error: describeNetworkFailure(err, url)
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Update the Status Pill in the catalog toolbar.
 * Accepts 'connecting' | 'online' | 'degraded' | 'offline' (booleans still work).
 */
function updateStatusBadge(state) {
  const pill = document.getElementById('api-status-pill');
  if (!pill) return;

  const resolved = state === true ? 'online' : state === false ? 'offline' : state;
  const host = currentApiBase.replace(/^https?:\/\//, '');

  const views = {
    connecting: {
      cls: 'api-status-pill offline',
      label: 'Gateway: Connecting…',
      title: `Requesting ${currentApiBase}/api/products`
    },
    online: {
      cls: 'api-status-pill',
      label: `Gateway: Connected (${host})`,
      title: 'Live Spring Cloud API Gateway connection active'
    },
    degraded: {
      cls: 'api-status-pill offline',
      label: 'Gateway: Degraded',
      title: 'The gateway answered, but the downstream service is unavailable (circuit breaker fallback).'
    },
    offline: {
      cls: 'api-status-pill offline',
      label: 'Gateway: Offline — bundled catalog',
      title: `Could not reach ${currentApiBase}. Start the microservices stack to load live products.`
    }
  };

  const view = views[resolved] || views.offline;
  pill.className = view.cls;
  pill.innerHTML = `<span class="api-status-dot"></span> ${view.label}`;
  pill.title = view.title;
}

/**
 * Quick probe of the Spring Boot API Gateway.
 * @returns {Promise<boolean>} true when GET /api/products answered 2xx
 */
async function checkBackendHealth() {
  updateStatusBadge('connecting');
  const res = await apiRequest('/api/products', { timeoutMs: HEALTH_TIMEOUT_MS });

  isBackendOnline = res.ok;
  updateStatusBadge(res.ok ? 'online' : (res.networkError ? 'offline' : 'degraded'));
  return res.ok;
}

/**
 * Fetch the product catalog from the Product Service via the gateway.
 * @returns {Promise<{ok:boolean,status:number,data:any,error?:string}>}
 */
async function fetchProductsFromGateway() {
  updateStatusBadge('connecting');
  const res = await apiRequest('/api/products');

  isBackendOnline = res.ok;
  updateStatusBadge(res.ok ? 'online' : (res.networkError ? 'offline' : 'degraded'));
  return res;
}

/**
 * POST a new order to the Order Service via the gateway.
 * Payload matches CreateOrderRequest: { customerId, items:[{productId,quantity}], shippingAddress, notes }
 * The order total is calculated server-side from the Product Service prices.
 */
async function submitOrderToGateway(orderRequest) {
  return apiRequest('/api/orders', { method: 'POST', body: orderRequest });
}

/**
 * POST a payment to the Payment Service via the gateway.
 * Payload matches PaymentRequest: { orderId, customerId, amount, paymentMethod, cardNumber, cvv, expiryDate, upiId }
 * A declined payment comes back as HTTP 402 with a PaymentResponse body
 * ({status:'FAILED', failureReason}), so that reason is surfaced to the caller.
 */
async function submitPaymentToGateway(paymentRequest) {
  const res = await apiRequest('/api/payments', { method: 'POST', body: paymentRequest });

  if (!res.ok && res.data && typeof res.data === 'object' && res.data.status === 'FAILED') {
    res.error = res.data.failureReason || 'Payment was declined by the payment gateway.';
  }

  if (res.data && typeof res.data === 'object' && res.data.status) {
    res.paymentStatus = res.data.status;
    res.transactionId = res.data.transactionId;
  }

  return res;
}

/**
 * Fetch a single order by numeric id or by order number (e.g. ORD-202401011200-AB12CD).
 * @returns {Promise<object|null>} the OrderResponse, or null when it cannot be resolved
 */
async function fetchOrderDetails(orderIdOrNumber) {
  const query = String(orderIdOrNumber || '').trim();
  if (!query) return null;

  const path = /^\d+$/.test(query)
    ? `/api/orders/${query}`
    : `/api/orders/number/${encodeURIComponent(query)}`;

  const res = await apiRequest(path);
  return res.ok ? res.data : null;
}

/**
 * Point the client at another gateway host (defaults to http://localhost:8080).
 */
function setApiBaseUrl(baseUrl) {
  if (baseUrl) {
    currentApiBase = String(baseUrl).replace(/\/+$/, '');
  }
  return currentApiBase;
}

// Global Export
window.ApiClient = {
  checkBackendHealth,
  fetchProductsFromGateway,
  submitOrderToGateway,
  submitPaymentToGateway,
  fetchOrderDetails,
  setBaseUrl: setApiBaseUrl,
  getBaseUrl: () => currentApiBase,
  isOnline: () => isBackendOnline,
  updateStatusBadge
};
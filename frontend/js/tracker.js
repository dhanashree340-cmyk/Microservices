/**
 * Order Tracking & Timeline Stepper Controller
 * Syncs with Spring Boot Order Service via API Gateway
 * or renders simulated tracking timeline for instant demos.
 */

const DEMO_ORDERS = {
  'ORD-849201': {
    orderNumber: 'ORD-849201',
    status: 'SHIPPED',
    carrier: 'BlueDart Express',
    trackingNumber: 'BD-993820194US',
    estimatedDelivery: 'Tomorrow by 8:00 PM',
    shippingAddress: '742 Evergreen Terrace, Springfield, OR - 97477',
    stepIndex: 3, // 1 to 5
    logs: [
      { time: 'Today, 2:30 PM', desc: 'Package arrived at regional sorting facility, Portland' },
      { time: 'Today, 8:15 AM', desc: 'In transit to destination facility via Air Freight' },
      { time: 'Yesterday, 6:40 PM', desc: 'Package picked up by carrier BlueDart Express' },
      { time: 'Yesterday, 3:10 PM', desc: 'Order verified & safely packed at Seattle Fulfilment Center' },
      { time: 'Yesterday, 11:20 AM', desc: 'Order placed & payment verified successfully' }
    ]
  },
  'ORD-552190': {
    orderNumber: 'ORD-552190',
    status: 'OUT_FOR_DELIVERY',
    carrier: 'Amazon Logistics',
    trackingNumber: 'TBA-482019284',
    estimatedDelivery: 'Today by 5:00 PM',
    shippingAddress: '100 King St W, Toronto, ON - M5X 1A9',
    stepIndex: 4,
    logs: [
      { time: 'Today, 9:15 AM', desc: 'Out for delivery with delivery associate' },
      { time: 'Today, 6:00 AM', desc: 'Arrived at local delivery station' },
      { time: 'Yesterday, 4:20 PM', desc: 'Departed sorting facility' },
      { time: '2 days ago', desc: 'Order placed & packed' }
    ]
  }
};

function openTrackerModal() {
  const backdrop = document.getElementById('tracker-backdrop');
  if (backdrop) {
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Pre-load default sample order if none selected
  const input = document.getElementById('tracker-search-input');
  if (input && !input.value) {
    input.value = 'ORD-849201';
  }
  trackOrder(input?.value || 'ORD-849201');
}

function closeTrackerModal() {
  const backdrop = document.getElementById('tracker-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Open tracker with a specific order ID directly (e.g. from checkout success)
 */
function openTrackerWithOrder(orderNumber) {
  openTrackerModal();
  const input = document.getElementById('tracker-search-input');
  if (input) {
    input.value = orderNumber;
  }
  trackOrder(orderNumber);
}

/**
 * Perform tracking lookup
 */
async function trackOrder(orderQuery) {
  if (!orderQuery) return;
  const q = orderQuery.trim().toUpperCase();

  // 1. Check if live backend can resolve it
  const liveOrder = await window.ApiClient.fetchOrderDetails(q);
  if (liveOrder) {
    renderTrackerView({
      orderNumber: liveOrder.orderNumber || q,
      status: liveOrder.status || 'CONFIRMED',
      carrier: 'Spring Cloud Logistics',
      trackingNumber: `SCL-${liveOrder.id || '99201'}`,
      estimatedDelivery: '2 business days',
      shippingAddress: liveOrder.shippingAddress || 'Customer Address',
      stepIndex: liveOrder.status === 'DELIVERED' ? 5 : (liveOrder.status === 'SHIPPED' ? 3 : 2),
      logs: [
        { time: 'Just now', desc: `Status updated via Order Service: ${liveOrder.status}` },
        { time: 'Earlier', desc: 'Order processed by Spring Cloud Gateway' }
      ]
    });
    return;
  }

  // 2. Check pre-seeded demo orders
  if (DEMO_ORDERS[q]) {
    renderTrackerView(DEMO_ORDERS[q]);
    return;
  }

  // 3. Fallback: Generate dynamic realistic tracking for newly generated orders!
  const generatedOrder = {
    orderNumber: q,
    status: 'CONFIRMED',
    carrier: 'Express Prime Carrier',
    trackingNumber: `PRM-${Math.floor(100000 + Math.random() * 900000)}`,
    estimatedDelivery: 'Arriving in 2-3 business days',
    shippingAddress: 'Standard Delivery Address',
    stepIndex: 1, // Order Confirmed
    logs: [
      { time: 'Just now', desc: 'Order received and inventory reserved at warehouse' },
      { time: 'Just now', desc: 'Payment authorized & transaction confirmed' }
    ]
  };

  renderTrackerView(generatedOrder);
}

/**
 * Render visual stepper and activity log
 */
function renderTrackerView(order) {
  // Update Meta
  const numEl = document.getElementById('tracker-order-num');
  const carrierEl = document.getElementById('tracker-carrier');
  const deliveryEl = document.getElementById('tracker-est-delivery');
  const addressEl = document.getElementById('tracker-address');
  const statusEl = document.getElementById('tracker-status-tag');

  if (numEl) numEl.textContent = order.orderNumber;
  if (carrierEl) carrierEl.textContent = `${order.carrier} (#${order.trackingNumber})`;
  if (deliveryEl) deliveryEl.textContent = order.estimatedDelivery;
  if (addressEl) addressEl.textContent = order.shippingAddress;

  if (statusEl) {
    statusEl.textContent = order.status;
    statusEl.className = 'tracker-status-tag';
    if (order.status.includes('DELIVERED')) statusEl.classList.add('status-tag-delivered');
    else if (order.status.includes('SHIP')) statusEl.classList.add('status-tag-shipped');
    else statusEl.classList.add('status-tag-confirmed');
  }

  // Update Stepper Nodes (1 = Confirmed, 2 = Packed, 3 = Shipped, 4 = Out for Delivery, 5 = Delivered)
  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4'),
    document.getElementById('step-5')
  ];

  const fillEl = document.getElementById('stepper-progress-fill');

  steps.forEach((node, index) => {
    if (!node) return;
    const stepNum = index + 1;
    node.classList.remove('completed', 'active');

    if (stepNum < order.stepIndex) {
      node.classList.add('completed');
    } else if (stepNum === order.stepIndex) {
      node.classList.add('active');
    }
  });

  // Stepper progress line width
  if (fillEl) {
    const percentages = [0, 25, 50, 75, 100];
    const targetPct = percentages[Math.min(order.stepIndex - 1, 4)];
    fillEl.style.width = `calc(${targetPct}% * 0.9)`;
  }

  // Update Activity Logs
  const logsContainer = document.getElementById('tracker-logs-container');
  if (logsContainer && order.logs) {
    logsContainer.innerHTML = order.logs.map(log => `
      <div class="log-item">
        <div class="log-time">${log.time}</div>
        <div class="log-desc"><strong>${log.desc}</strong></div>
      </div>
    `).join('');
  }
}

// Global Export
window.OrderTracker = {
  openTracker: openTrackerModal,
  closeTracker: closeTrackerModal,
  openTrackerWithOrder,
  trackOrder
};

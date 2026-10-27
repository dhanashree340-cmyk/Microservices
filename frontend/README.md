# 🛒 ShopSphere - Enterprise E-Commerce Frontend UI

A responsive, high-performance **E-Commerce Frontend UI** inspired by the visual design systems of **Amazon** and **Flipkart**. Built with clean HTML5, modern modular CSS (Flexbox, Grid, CSS Variables), and vanilla JavaScript.

---

## 🎨 Design System & Aesthetics (Amazon & Flipkart Fusion)

| Element | Color / Palette | Inspiration |
|---|---|---|
| **Header Bar** | Deep Navy (`#131921`) & Subnav (`#232f3e`) | Amazon Main Nav & Departments |
| **Highlights & Badges** | Royal Blue (`#2874f0`) & Plus Badge | Flipkart Assured & Flipkart Plus |
| **"Add to Cart" CTA** | Vibrant Amazon Amber (`#ffd814` / `#f7ca00`) | Amazon Primary Buying CTA |
| **"Buy Now" CTA** | Electric Shopping Orange (`#fb641b` / `#fa5600`) | Flipkart Quick Purchase CTA |
| **Page Background** | Clean Soft Gray (`#f1f3f6`) | Flipkart Minimalist Storefront |
| **Product Cards** | Crisp White (`#ffffff`) with subtle elevations | Amazon & Flipkart Clean Card Layout |
| **Typography** | Google Fonts (`Inter` & `Plus Jakarta Sans`) | Modern high-readability web typography |

---

## 🚀 Key Features Implemented

### 1. Sticky Top Navigation Bar
- **Brand Identity**: ShopSphere logo with smile shopping cart icon and Flipkart `⚡ Plus` badge.
- **Location Selector**: Deliver to New York 10001 (or custom postal code).
- **Search Bar**:
  - Category selector dropdown (All Categories, Smartphones, Audio, Laptops, Electronics, Watches, Fashion, Home).
  - Instant live search input with real-time product filtering.
  - One-click clear search button (`×`).
  - Amazon-style magnifying glass yellow search submit button.
- **Account & Orders**:
  - "Hello, Guest / Account & Lists" menu trigger.
  - "Returns & Track Orders" button opening the live package tracking timeline.
- **Cart Counter Badge**: Trolley icon with live item count and subtotal amount. Bounces with a pop animation when items are added.
- **Sub-Navigation Strip**: Quick department links, "Today's Mega Deals" shortcut, and free express delivery announcement banner.

### 2. Promotional Hero Showcase Banner
- High-contrast gradient banner with dynamic glow.
- Headline: *"Upgrade Your Tech. Save Up To 40% Today."*
- **Real-Time Countdown Timer**: Live ticking hours, minutes, and seconds countdown for the Deal of the Day.
- 4 Key Trust Badges: 100% Authentic, Express 2-Day Delivery, PCI-DSS Secure Payments, 7-Day Hassle-Free Returns.

### 3. Category Quick Filter Strip
- Horizontally scrollable category pills (All, Smartphones, Audio, Laptops, Electronics, Watches, Fashion, Home).
- Active state indicators that instantly update the product grid.

### 4. Responsive Product Grid & Cards
- CSS Grid with automatic layout reflow (`repeat(auto-fill, minmax(260px, 1fr))`).
- **Product Card Features**:
  - Status Badges: `AMAZON'S CHOICE`, `FLIPKART ASSURED`, `BESTSELLER`, `-XX% OFF`.
  - Heart Wishlist toggle with toast feedback.
  - High-definition SVG product illustrations (zero broken image placeholders).
  - Category tag and 2-line clamped title.
  - 5-Star Visual Rating System with numerical score and review count.
  - Dynamic Pricing: Bold current price, strikethrough MSRP, and savings discount.
  - Prime delivery badge ("⚡ Prime FREE Two-Day Delivery").
  - Stock urgency indicator ("In Stock" or "Only 3 left in stock - order soon").
  - Dual action buttons: **Add to Cart** (Amazon Yellow) and **Buy Now** (Flipkart Orange).
  - Quick View detail modal on card click with full specifications and SKU.

### 5. Slide-Out Shopping Cart Drawer
- Smooth slide animation from the right edge with a blurred backdrop overlay (`backdrop-filter: blur(4px)`).
- **Free Delivery Progress Bar**: Dynamically calculates progress toward the $50 free shipping threshold ("Add $X.XX more for FREE Delivery!").
- Cart item listing with thumbnail, title, unit price, and item total.
- Interactive quantity stepper (`[-]` input `[+]`) and trash remove button.
- Summary breakdown: Subtotal, Estimated Taxes (8%), Total Savings, and Grand Total.
- **Proceed to Checkout** CTA button.
- Friendly empty-state illustration when cart is empty with a "Shop Today's Deals" shortcut.

### 6. Clean Checkout & Payment Modal
- Centered 2-column modal with 256-bit SSL security badge.
- **Step 1: Delivery Address Form**: Full Name, Phone Number, Email, Street Address, City, ZIP Code with validation.
- **Step 2: Selectable Payment Tabs**:
  1. **Credit / Debit Card**
  2. **UPI / Instant Pay**
  3. **Net Banking**
  4. **Cash on Delivery**
- **Interactive 3D Virtual Credit Card Preview**:
  - Live card preview that formats the 16-digit card number with spacing in real time.
  - Automatic Card Brand detection (Visa, Mastercard, Amex, RuPay).
  - Live synchronization of Cardholder Name and Expiration Date (`MM/YY`).
  - EMV Chip graphic and holographic sheen.
- **Order Review Column**:
  - Thumbnail item list with quantities.
  - Promo Code input with instant discount calculation (`SAVE20` gives 20% off!).
  - Price breakdown and primary "Place Order & Pay" button with loading spinner state.
- **Order Success Screen**:
  - Pop-up confirmation with generated Order ID (`ORD-XXXXXX`), delivery summary, and direct "Track Package Status" button.

### 7. Live Order Tracking Modal & Visual Stepper
- Package tracking modal supporting search by Order Number.
- **5-Step Visual Stepper Timeline**:
  1. **Ordered** (Confirmed)
  2. **Packed** (Warehouse Fulfillment)
  3. **Shipped** (Carrier In Transit)
  4. **Out for Delivery** (Local Delivery Hub)
  5. **Delivered** (Destination Receipt)
- Carrier information, estimated delivery date, and detailed activity log table.

### 8. Spring Cloud Microservices Backend Integration
- Integrated with the project's Spring Cloud API Gateway at `http://localhost:8080`.
- **Automatic Health Check**: Toolbar status pill displays live connection status (`Gateway: Connected (:8080)` vs `Gateway: Standalone Demo Mode`).
- Compatible endpoints:
  - Catalog: `GET /api/products`
  - Order Lifecycle: `POST /api/orders`, `GET /api/orders/{id}`, `GET /api/orders/number/{orderNumber}`
  - Payments: `POST /api/payments`
- Works 100% out-of-the-box in standalone client mode if the backend microservices are offline.

---

## 📁 File Structure

```
frontend/
├── index.html                 # Main e-commerce dashboard shell
├── README.md                  # Comprehensive documentation
├── css/
│   ├── variables.css          # Design tokens (Amazon navy, Flipkart blue/orange, shadows)
│   ├── styles.css             # Base resets, top nav, sub-nav, hero banner, category pills
│   ├── components.css         # Product cards, badges, buttons, star ratings, toast alerts
│   ├── cart.css               # Slide-out cart drawer, free shipping meter, summary
│   ├── checkout.css           # 2-column checkout modal, 3D virtual card, form controls
│   ├── tracker.css            # Order tracking modal and 5-step timeline stepper
│   └── responsive.css         # Breakpoints for mobile, tablet, and desktop
└── js/
    ├── products.js            # Mock product catalog matching backend DTO schema
    ├── cart.js                # Cart state management, localStorage persistence
    ├── api.js                 # API client communicating with Spring Cloud Gateway
    ├── checkout.js            # Form validation, virtual card syncing, order placement
    ├── tracker.js             # Order tracking simulation and status timeline
    └── app.js                 # App initialization, search filtering, event listeners
```

---

## ⚡ How to Run Locally

You can launch the frontend using Python's built-in HTTP server or any static web server:

```bash
# Using Python
cd frontend
python -m http.server 5500

# Open in browser
# http://localhost:5500
```

Or simply double-click [index.html](file:///d:/Microservices/frontend/index.html) to open directly in any modern browser!

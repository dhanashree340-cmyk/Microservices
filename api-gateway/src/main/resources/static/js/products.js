/**
 * E-Commerce Product Catalog
 * Matches the Spring Boot ProductService entity & DTO models:
 * id, name, description, price, stockQuantity, category, sku, active
 */

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Apple iPhone 15 Pro Max (256 GB) - Natural Titanium",
    description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.",
    price: 1199.99,
    originalPrice: 1299.99,
    discountPercent: 8,
    stockQuantity: 14,
    category: "Mobiles",
    sku: "SKU-IPH15PM-256",
    active: true,
    rating: 4.8,
    ratingCount: 4210,
    badge: "Amazon's Choice",
    badgeType: "amazon",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><rect x='130' y='50' width='140' height='300' rx='28' fill='%231e293b' stroke='%2394a3b8' stroke-width='6'/><rect x='138' y='58' width='124' height='284' rx='22' fill='%230f172a'/><rect x='170' y='64' width='60' height='14' rx='7' fill='%23000000'/><circle cx='180' cy='71' r='4' fill='%231e293b'/><circle cx='218' cy='71' r='3' fill='%230284c7'/><circle cx='162' cy='112' r='20' fill='%231e293b' stroke='%23475569' stroke-width='3'/><circle cx='162' cy='168' r='20' fill='%231e293b' stroke='%23475569' stroke-width='3'/><circle cx='212' cy='140' r='20' fill='%231e293b' stroke='%23475569' stroke-width='3'/><text x='200' y='270' fill='%2338bdf8' font-size='16' font-family='sans-serif' font-weight='bold' text-anchor='middle'>iPhone 15 Pro</text><text x='200' y='292' fill='%2394a3b8' font-size='12' font-family='sans-serif' text-anchor='middle'>Titanium • A17 Pro</text></svg>"
  },
  {
    id: 2,
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    description: "Industry-leading noise cancellation with two processors and 8 microphones. Magnificent sound engineered to perfection with Ultra-clear hands-free calling.",
    price: 349.99,
    originalPrice: 399.99,
    discountPercent: 13,
    stockQuantity: 28,
    category: "Audio",
    sku: "SKU-SNY-WH1000XM5",
    active: true,
    rating: 4.7,
    ratingCount: 3120,
    badge: "Flipkart Assured",
    badgeType: "assured",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><path d='M100 200 C 100 90, 300 90, 300 200' fill='none' stroke='%231e293b' stroke-width='16' stroke-linecap='round'/><path d='M130 140 C 130 110, 270 110, 270 140' fill='none' stroke='%23334155' stroke-width='8'/><rect x='85' y='180' width='38' height='80' rx='18' fill='%230f172a' stroke='%23cbd5e1' stroke-width='3'/><rect x='277' y='180' width='38' height='80' rx='18' fill='%230f172a' stroke='%23cbd5e1' stroke-width='3'/><ellipse cx='104' cy='220' rx='12' ry='28' fill='%23334155'/><ellipse cx='296' cy='220' rx='12' ry='28' fill='%23334155'/><text x='200' y='320' fill='%230f172a' font-size='16' font-family='sans-serif' font-weight='bold' text-anchor='middle'>SONY WH-1000XM5</text><text x='200' y='342' fill='%2364748b' font-size='12' font-family='sans-serif' text-anchor='middle'>Hi-Res Audio • ANC</text></svg>"
  },
  {
    id: 3,
    name: "Apple MacBook Pro 14\" M3 Chip (16GB RAM, 512GB SSD)",
    description: "Liquid Retina XDR display, up to 22 hours of battery life, pro ports including Thunderbolt 4, HDMI, SDXC, headphone jack, and MagSafe 3.",
    price: 1599.00,
    originalPrice: 1799.00,
    discountPercent: 11,
    stockQuantity: 6,
    category: "Laptops",
    sku: "SKU-MBP14-M3-512",
    active: true,
    rating: 4.9,
    ratingCount: 1890,
    badge: "Bestseller",
    badgeType: "bestseller",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><rect x='80' y='90' width='240' height='150' rx='10' fill='%230f172a' stroke='%2364748b' stroke-width='5'/><rect x='90' y='100' width='220' height='130' rx='4' fill='%230284c7'/><path d='M50 240 L350 240 L330 265 L70 265 Z' fill='%2394a3b8' stroke='%23475569' stroke-width='2'/><rect x='170' y='242' width='60' height='6' rx='3' fill='%23475569'/><circle cx='200' cy='165' r='18' fill='%23ffffff' opacity='0.85'/><text x='200' y='310' fill='%230f172a' font-size='16' font-family='sans-serif' font-weight='bold' text-anchor='middle'>MacBook Pro 14&quot;</text><text x='200' y='332' fill='%2364748b' font-size='12' font-family='sans-serif' text-anchor='middle'>Apple M3 • Space Gray</text></svg>"
  },
  {
    id: 4,
    name: "Samsung Galaxy S24 Ultra 5G (512GB, 12GB RAM) AI Smartphone",
    description: "Welcome to the era of mobile AI. Meet Galaxy S24 Ultra with Circle to Search, Live Translate, Note Assist, 200MP camera and built-in S Pen.",
    price: 1299.99,
    originalPrice: 1419.99,
    discountPercent: 9,
    stockQuantity: 9,
    category: "Mobiles",
    sku: "SKU-SAMS24U-512",
    active: true,
    rating: 4.8,
    ratingCount: 2540,
    badge: "Amazon's Choice",
    badgeType: "amazon",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><rect x='125' y='50' width='150' height='300' rx='16' fill='%23334155' stroke='%2364748b' stroke-width='5'/><rect x='132' y='58' width='136' height='284' rx='10' fill='%23090d16'/><circle cx='200' cy='72' r='4' fill='%2338bdf8'/><circle cx='155' cy='105' r='14' fill='%231e293b' stroke='%2394a3b8' stroke-width='2'/><circle cx='155' cy='145' r='14' fill='%231e293b' stroke='%2394a3b8' stroke-width='2'/><circle cx='155' cy='185' r='14' fill='%231e293b' stroke='%2394a3b8' stroke-width='2'/><circle cx='185' cy='125' r='10' fill='%231e293b' stroke='%2394a3b8' stroke-width='2'/><text x='200' y='265' fill='%2360a5fa' font-size='16' font-family='sans-serif' font-weight='bold' text-anchor='middle'>Galaxy S24 Ultra</text><text x='200' y='287' fill='%2394a3b8' font-size='12' font-family='sans-serif' text-anchor='middle'>Galaxy AI • 200MP</text></svg>"
  },
  {
    id: 5,
    name: "Samsung 55\" Crystal 4K UHD Smart TV (HDR, Dynamic Color)",
    description: "Feel lifelike shade of color as intended in powerful 4K. Crystal Processor 4K delivers sharp, crisp and vivid visuals with Q-Symphony sound.",
    price: 479.99,
    originalPrice: 629.99,
    discountPercent: 24,
    stockQuantity: 18,
    category: "Electronics",
    sku: "SKU-SAMTV-55C4K",
    active: true,
    rating: 4.6,
    ratingCount: 1650,
    badge: "Flipkart Assured",
    badgeType: "assured",
    primeEligible: false,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><rect x='50' y='80' width='300' height='180' rx='6' fill='%230f172a' stroke='%23475569' stroke-width='6'/><rect x='60' y='90' width='280' height='160' rx='3' fill='%231e3a8a'/><polygon points='160,140 240,170 160,200' fill='%2338bdf8'/><rect x='192' y='260' width='16' height='40' fill='%23334155'/><rect x='140' y='298' width='120' height='8' rx='4' fill='%23475569'/><text x='200' y='340' fill='%230f172a' font-size='15' font-family='sans-serif' font-weight='bold' text-anchor='middle'>Samsung Crystal 4K 55&quot;</text></svg>"
  },
  {
    id: 6,
    name: "Apple Watch Series 9 GPS + Cellular 45mm Midnight Aluminum",
    description: "S9 SiP chip with Double Tap gesture control, brighter Always-On display, advanced health sensors including Blood Oxygen and ECG monitoring.",
    price: 399.00,
    originalPrice: 479.00,
    discountPercent: 17,
    stockQuantity: 3,
    category: "Watches",
    sku: "SKU-AW9-45-MID",
    active: true,
    rating: 4.8,
    ratingCount: 980,
    badge: "Bestseller",
    badgeType: "bestseller",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><rect x='170' y='40' width='60' height='80' rx='8' fill='%231e293b'/><rect x='170' y='280' width='60' height='80' rx='8' fill='%231e293b'/><rect x='140' y='110' width='120' height='180' rx='28' fill='%23020617' stroke='%23475569' stroke-width='6'/><circle cx='200' cy='200' r='45' fill='none' stroke='%23ec4899' stroke-width='6'/><circle cx='200' cy='200' r='33' fill='none' stroke='%2310b981' stroke-width='6'/><circle cx='200' cy='200' r='21' fill='none' stroke='%2306b6d4' stroke-width='6'/><rect x='260' y='145' width='6' height='26' rx='3' fill='%2394a3b8'/><text x='200' y='325' fill='%230f172a' font-size='15' font-family='sans-serif' font-weight='bold' text-anchor='middle'>Apple Watch Series 9</text></svg>"
  },
  {
    id: 7,
    name: "Sony PlayStation 5 Slim Console (1TB SSD, DualSense)",
    description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.",
    price: 499.99,
    originalPrice: 549.99,
    discountPercent: 9,
    stockQuantity: 11,
    category: "Electronics",
    sku: "SKU-PS5-SLIM-1TB",
    active: true,
    rating: 4.9,
    ratingCount: 5430,
    badge: "Amazon's Choice",
    badgeType: "amazon",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><path d='M160 70 L240 70 L250 280 L150 280 Z' fill='%230f172a'/><path d='M150 60 C155 120, 145 220, 140 290' stroke='%23e2e8f0' stroke-width='16' stroke-linecap='round' fill='none'/><path d='M250 60 C245 120, 255 220, 260 290' stroke='%23e2e8f0' stroke-width='16' stroke-linecap='round' fill='none'/><ellipse cx='200' cy='295' rx='70' ry='12' fill='%23334155'/><circle cx='180' cy='120' r='4' fill='%2338bdf8'/><text x='200' y='340' fill='%230f172a' font-size='16' font-family='sans-serif' font-weight='bold' text-anchor='middle'>PlayStation 5 Slim</text></svg>"
  },
  {
    id: 8,
    name: "Nike Air Jordan 1 Retro High OG 'Chicago' Basketball Shoes",
    description: "Classic court look infused with timeless Chicago heritage. Premium leather upper, encapsulated Air-Sole cushioning and iconic wings logo.",
    price: 180.00,
    originalPrice: 220.00,
    discountPercent: 18,
    stockQuantity: 8,
    category: "Fashion",
    sku: "SKU-NK-AJ1-CHI",
    active: true,
    rating: 4.7,
    ratingCount: 1420,
    badge: "Flipkart Assured",
    badgeType: "assured",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><path d='M80 230 C80 180, 160 160, 200 130 C240 100, 280 120, 310 170 C330 200, 320 250, 310 260 L80 260 Z' fill='%23dc2626'/><path d='M70 255 L320 255 L320 280 L70 280 Z' fill='%23f8fafc' stroke='%230f172a' stroke-width='3'/><path d='M140 180 C180 180, 240 210, 290 200' fill='none' stroke='%230f172a' stroke-width='14' stroke-linecap='round'/><text x='200' y='325' fill='%230f172a' font-size='15' font-family='sans-serif' font-weight='bold' text-anchor='middle'>Air Jordan 1 Retro</text></svg>"
  },
  {
    id: 9,
    name: "Dyson V15 Detect Cordless Vacuum Cleaner (Laser Slim Fluffy)",
    description: "Dyson's most intelligent cordless vacuum. Laser reveals microscopic dust, piezo sensor counts particles, and LCD screen displays proof of deep clean.",
    price: 649.99,
    originalPrice: 749.99,
    discountPercent: 13,
    stockQuantity: 15,
    category: "Home",
    sku: "SKU-DYS-V15D",
    active: true,
    rating: 4.8,
    ratingCount: 1120,
    badge: "Amazon's Choice",
    badgeType: "amazon",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><rect x='80' y='180' width='70' height='70' rx='14' fill='%237c3aed'/><rect x='140' y='195' width='160' height='14' fill='%23eab308'/><rect x='290' y='170' width='40' height='60' rx='6' fill='%230f172a'/><path d='M60 210 L80 210 L80 250 L60 250 Z' fill='%23334155'/><text x='200' y='315' fill='%230f172a' font-size='15' font-family='sans-serif' font-weight='bold' text-anchor='middle'>Dyson V15 Detect</text></svg>"
  },
  {
    id: 10,
    name: "Amazon Echo Studio - High-Fidelity Smart Speaker with 3D Audio",
    description: "Immersive sound with 5 directional speakers, Dolby Atmos processing, automatic room adaptation, and built-in Zigbee smart home hub with Alexa.",
    price: 199.99,
    originalPrice: 229.99,
    discountPercent: 13,
    stockQuantity: 24,
    category: "Audio",
    sku: "SKU-AMZ-ECHST",
    active: true,
    rating: 4.6,
    ratingCount: 4890,
    badge: "Amazon's Choice",
    badgeType: "amazon",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><rect x='130' y='90' width='140' height='180' rx='20' fill='%231e293b' stroke='%23475569' stroke-width='4'/><ellipse cx='200' cy='95' rx='60' ry='14' fill='%230284c7'/><circle cx='200' cy='180' r='36' fill='%230f172a'/><rect x='155' y='230' width='90' height='12' rx='6' fill='%2338bdf8' opacity='0.7'/><text x='200' y='320' fill='%230f172a' font-size='16' font-family='sans-serif' font-weight='bold' text-anchor='middle'>Echo Studio Smart Speaker</text></svg>"
  },
  {
    id: 11,
    name: "Dell XPS 15 9530 (13th Gen i7, 32GB RAM, 1TB SSD, RTX 4060)",
    description: "InfinityEdge 3.5K OLED touchscreen display, high-performance CNC machined aluminum, carbon fiber palm rest, and NVIDIA Studio drivers.",
    price: 1849.00,
    originalPrice: 2099.00,
    discountPercent: 12,
    stockQuantity: 4,
    category: "Laptops",
    sku: "SKU-DEL-XPS15",
    active: true,
    rating: 4.7,
    ratingCount: 870,
    badge: "Bestseller",
    badgeType: "bestseller",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><rect x='75' y='90' width='250' height='155' rx='6' fill='%23020617' stroke='%23334155' stroke-width='4'/><rect x='85' y='100' width='230' height='135' rx='2' fill='%231e293b'/><circle cx='200' cy='168' r='24' fill='none' stroke='%2338bdf8' stroke-width='3'/><path d='M45 245 L355 245 L335 270 L65 270 Z' fill='%2364748b'/><text x='200' y='315' fill='%230f172a' font-size='16' font-family='sans-serif' font-weight='bold' text-anchor='middle'>Dell XPS 15 Creator</text></svg>"
  },
  {
    id: 12,
    name: "Levi's Men's 511 Slim Fit Stretch Denim Jeans",
    description: "A modern slim with room to move. Added stretch for all-day comfort and authentic denim wash, engineered with Levi's Flex technology.",
    price: 49.99,
    originalPrice: 79.50,
    discountPercent: 37,
    stockQuantity: 42,
    category: "Fashion",
    sku: "SKU-LEV-511-SLIM",
    active: true,
    rating: 4.5,
    ratingCount: 6840,
    badge: "Flipkart Assured",
    badgeType: "assured",
    primeEligible: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'><rect width='400' height='400' fill='%23f8fafc'/><path d='M130 90 L270 90 L280 270 L220 270 L200 150 L180 270 L120 270 Z' fill='%231e3a8a' stroke='%23172554' stroke-width='3'/><rect x='130' y='90' width='140' height='18' fill='%23172554'/><rect x='230' y='114' width='28' height='24' rx='3' fill='%23b91c1c'/><text x='200' y='325' fill='%230f172a' font-size='15' font-family='sans-serif' font-weight='bold' text-anchor='middle'>Levi&apos;s 511 Slim Jeans</text></svg>"
  }
];

// In-memory catalog state
let productsCatalog = [...DEFAULT_PRODUCTS];

/**
 * Returns full catalog
 */
function getProducts() {
  return productsCatalog;
}

/**
 * Get product by ID
 */
function getProductById(id) {
  return productsCatalog.find(p => p.id === Number(id));
}

/**
 * Filter products by search query, category, price, and rating
 */
function filterProducts({ query = '', category = 'All', maxPrice = Infinity, minRating = 0, sort = 'featured' } = {}) {
  let filtered = productsCatalog.filter(p => {
    // Category match
    if (category && category !== 'All' && p.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    // Query match
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCategory) {
        return false;
      }
    }

    // Max Price
    if (p.price > maxPrice) {
      return false;
    }

    // Min Rating
    if (p.rating < minRating) {
      return false;
    }

    return true;
  });

  // Sorting
  switch (sort) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filtered.sort((a, b) => b.id - a.id);
      break;
    case 'featured':
    default:
      // Keep default curated ranking
      break;
  }

  return filtered;
}

/**
 * Inline SVG placeholder artwork for backend products.
 * ProductResponse carries no image field, so the card gets generated art
 * instead of a broken <img>.
 */
function escapeSvgText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildPlaceholderImage(category, name) {
  const categoryLabel = escapeSvgText((category || 'General').slice(0, 20));
  const titleLabel = escapeSvgText((name || 'Product').slice(0, 24));

  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'>" +
    "<rect width='400' height='400' fill='#f8fafc'/>" +
    "<rect x='60' y='80' width='280' height='200' rx='16' fill='#e2e8f0' stroke='#94a3b8' stroke-width='4'/>" +
    "<path d='M60 250 L140 175 L200 235 L250 190 L340 280 L60 280 Z' fill='#cbd5e1'/>" +
    "<circle cx='288' cy='132' r='20' fill='#94a3b8'/>" +
    `<text x='200' y='322' fill='#0f172a' font-size='17' font-family='sans-serif' font-weight='bold' text-anchor='middle'>${titleLabel}</text>` +
    `<text x='200' y='348' fill='#64748b' font-size='13' font-family='sans-serif' text-anchor='middle'>${categoryLabel}</text>` +
    '</svg>';

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Map a backend ProductResponse onto the shape the storefront renders.
 * ProductResponse: { id, name, description, price, stockQuantity, category, sku, active, createdAt, updatedAt }
 * Ratings, reviews and promo badges do not exist in the backend, so they are
 * left empty rather than invented - the grid shows "No reviews yet" for those.
 */
function mapBackendProduct(dto) {
  const price = Number(dto.price);
  const stock = Number(dto.stockQuantity);

  return {
    id: Number(dto.id),
    name: dto.name || `Product #${dto.id}`,
    description: dto.description || '',
    price: Number.isFinite(price) ? price : 0,
    originalPrice: null,
    discountPercent: 0,
    stockQuantity: Number.isFinite(stock) ? stock : 0,
    category: dto.category || 'General',
    sku: dto.sku || `SKU-${dto.id}`,
    active: dto.active !== false,
    rating: 0,
    ratingCount: 0,
    badge: '',
    badgeType: null,
    primeEligible: false,
    image: buildPlaceholderImage(dto.category, dto.name),
    source: 'gateway'
  };
}

/**
 * Load the live catalog from GET http://localhost:8080/api/products.
 * Replaces the in-memory catalog on success; on failure the caller decides
 * whether to keep the bundled fallback catalog.
 * @returns {Promise<{ok:boolean,count?:number,error?:string,status?:number}>}
 */
async function loadProductsFromGateway() {
  if (!window.ApiClient) {
    return { ok: false, error: 'API client is not loaded' };
  }

  const res = await window.ApiClient.fetchProductsFromGateway();
  if (!res.ok) {
    return { ok: false, error: res.error, status: res.status };
  }

  const payload = res.data;
  const list = Array.isArray(payload)
    ? payload
    : (payload && Array.isArray(payload.content) ? payload.content : null);

  if (!list) {
    return { ok: false, error: 'Unexpected catalog payload from GET /api/products' };
  }

  productsCatalog = list.filter(p => p && p.active !== false).map(mapBackendProduct);
  return { ok: true, count: productsCatalog.length };
}

/**
 * Restore the bundled demo catalog (used when the gateway cannot be reached).
 */
function useFallbackCatalog() {
  productsCatalog = [...DEFAULT_PRODUCTS];
  return productsCatalog;
}

// Export to window
window.ProductCatalog = {
  getProducts,
  getProductById,
  filterProducts,
  loadProductsFromGateway,
  mapBackendProduct,
  useFallbackCatalog,
  setProducts: (newProducts) => {
    productsCatalog = newProducts;
  }
};

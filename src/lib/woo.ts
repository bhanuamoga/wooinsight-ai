// lib/woo.ts

const STORE_URL = process.env.WOOCOMMERCE_STORE_URL;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

if (!STORE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
  throw new Error('Missing WooCommerce environment variables');
}

const authHeader = `Basic ${Buffer.from(
  `${CONSUMER_KEY}:${CONSUMER_SECRET}`
).toString('base64')}`;

// Generic helper for wc/v3
async function wooGetV3<T = any>(
  path: string,
  params: Record<string, string> = {},
  revalidateSeconds = 1200
): Promise<T> {
  const url = new URL(`/wp-json/wc/v3/${path}`, STORE_URL);

  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: authHeader },
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`WooCommerce API error (${path}): ${res.status}`);
  }

  return res.json();
}

// Generic helper for wc-analytics (analytics stats)
async function wooGetAnalytics<T = any>(
  path: string,
  params: Record<string, string> = {},
  revalidateSeconds = 60
): Promise<T> {
  const url = new URL(`/wp-json/wc-analytics/${path}`, STORE_URL);

  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: authHeader },
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`WooCommerce Analytics API error (${path}): ${res.status}`);
  }

  return res.json();
}

/**
 * ORDERS
 * - latest, date filtered, etc.
 */
export async function fetchWooOrders(params: Record<string, string> = {}) {
  // Default: 100 per page, latest first
  const defaultParams: Record<string, string> = {
    per_page: '100',
    orderby: params.orderby ?? 'date',
    order: params.order ?? 'desc',
  };

  return wooGetV3('orders', { ...defaultParams, ...params }, 60);
}

/**
 * PRODUCTS
 * - latest, by popularity, etc.
 */
export async function fetchWooProducts(params: Record<string, string> = {}) {
  const defaultParams: Record<string, string> = {
    per_page: '100',
  };

  return wooGetV3('products', { ...defaultParams, ...params }, 300);
}

/**
 * CUSTOMERS
 */
export async function fetchWooCustomers(params: Record<string, string> = {}) {
  const defaultParams: Record<string, string> = {
    per_page: '100',
  };

  return wooGetV3('customers', { ...defaultParams, ...params }, 300);
}

/**
 * COUPONS
 */
export async function fetchWooCoupons(params: Record<string, string> = {}) {
  const defaultParams: Record<string, string> = {
    per_page: '100',
  };

  return wooGetV3('coupons', { ...defaultParams, ...params }, 300);
}

/**
 * PRODUCT CATEGORIES
 */
export async function fetchWooCategories(
  params: Record<string, string> = {}
) {
  const defaultParams: Record<string, string> = {
    per_page: '100',
  };

  return wooGetV3('products/categories', { ...defaultParams, ...params }, 300);
}

/**
 * REPORTS (classic wc/v3 reports)
 * - sales totals, top sellers, totals for orders/products/customers/coupons
 *   https://woocommerce.github.io/woocommerce-rest-api-docs/ (Reports section)
 */

// Sales report (totals, date range, period)
export async function fetchWooSalesReport(
  params: Record<string, string> = {}
) {
  // params can include: period, date_min, date_max, etc.
  return wooGetV3('reports/sales', params, 300);
}

// Top sellers (top 5, top 10, etc.)
export async function fetchWooTopSellers(
  params: Record<string, string> = {}
) {
  const defaultParams: Record<string, string> = {
    per_page: '5',
  };

  return wooGetV3('reports/top_sellers', { ...defaultParams, ...params }, 300);
}

// Orders totals
export async function fetchWooOrdersTotals() {
  return wooGetV3('reports/orders/totals', {}, 300);
}

// Products totals
export async function fetchWooProductsTotals() {
  return wooGetV3('reports/products/totals', {}, 300);
}

// Customers totals
export async function fetchWooCustomersTotals() {
  return wooGetV3('reports/customers/totals', {}, 300);
}

// Coupons totals
export async function fetchWooCouponsTotals() {
  return wooGetV3('reports/coupons/totals', {}, 300);
}

// Reviews totals
export async function fetchWooReviewsTotals() {
  return wooGetV3('reports/reviews/totals', {}, 300);
}

/**
 * ANALYTICS (wc-analytics)
 * - date-to-date stats for revenue/orders/products/customers/coupons
 *   These are the endpoints WooCommerce Admin uses for the Analytics screens.
 */

// Revenue stats (date-to-date analytics)
export async function fetchWooRevenueStats(
  params: Record<string, string> = {}
) {
  // Example params:
  // interval: 'day' | 'week' | 'month'
  // after: '2025-01-01T00:00:00Z'
  // before: '2025-01-31T23:59:59Z'
  // page, per_page, orderby, order
  return wooGetAnalytics('reports/revenue/stats', params, 300);
}

// Orders stats
export async function fetchWooOrdersStats(
  params: Record<string, string> = {}
) {
  return wooGetAnalytics('reports/orders/stats', params, 300);
}

// Products stats
export async function fetchWooProductsStats(
  params: Record<string, string> = {}
) {
  return wooGetAnalytics('reports/products/stats', params, 300);
}

// Customers stats
export async function fetchWooCustomersStats(
  params: Record<string, string> = {}
) {
  return wooGetAnalytics('reports/customers/stats', params, 300);
}

// Coupons stats
export async function fetchWooCouponsStats(
  params: Record<string, string> = {}
) {
  return wooGetAnalytics('reports/coupons/stats', params, 300);
}

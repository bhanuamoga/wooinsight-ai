const STORE_URL = process.env.WOOCOMMERCE_STORE_URL;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

if (!STORE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
  throw new Error('Missing WooCommerce environment variables');
}

const authHeader = `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')}`;

export async function fetchWooOrders(params: Record<string, string> = {}) {
  const url = new URL('/wp-json/wc/v3/orders', STORE_URL);
  url.searchParams.set('per_page', '100');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: authHeader },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status}`);
  return res.json();
}

export async function fetchWooProducts(params: Record<string, string> = {}) {
  const url = new URL('/wp-json/wc/v3/products', STORE_URL);
  url.searchParams.set('per_page', '50');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: authHeader },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status}`);
  return res.json();
}

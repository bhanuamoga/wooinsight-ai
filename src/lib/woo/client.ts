const STORE_URL = process.env.WOOCOMMERCE_STORE_URL!;
const KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

if (!STORE_URL || !KEY || !SECRET) {
  throw new Error("Missing WooCommerce env vars");
}

const AUTH = `Basic ${Buffer.from(`${KEY}:${SECRET}`).toString("base64")}`;

export async function fetchAll<T>(
  endpoint: string,
  params: Record<string, string> = {},
  perPage = 100
): Promise<T[]> {
  let page = 1;
  const all: T[] = [];

  while (true) {
    const url = new URL(`/wp-json/wc/v3/${endpoint}`, STORE_URL);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));

    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, v)
    );

    const res = await fetch(url.toString(), {
      headers: { Authorization: AUTH },
    });

    if (!res.ok) throw new Error(endpoint);

    const data: T[] = await res.json();
    all.push(...data);

    if (data.length < perPage) break;
    page++;
  }

  return all;
}

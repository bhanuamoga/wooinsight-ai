// app/api/assistant/route.ts — PRODUCTION SAFE (ANALYTICS FIRST)

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

import { streamText } from 'ai';
import {
  fetchWooOrders,
  fetchWooProducts,
  fetchWooSalesReport,
  fetchWooTopSellers,
  fetchWooOrdersTotals,
  fetchWooProductsTotals,
  fetchWooCustomersTotals,
  fetchWooCouponsTotals,
  fetchWooRevenueStats,
  fetchWooOrdersStats,
  fetchWooCouponsStats,
} from '@/lib/woo';

export const runtime = 'edge';

type DateRange = {
  from?: string;
  to?: string;
};

function extractDateRange(query: string): DateRange {
  const match = query.match(
    /(\d{4}-\d{2}-\d{2})\s+(to|until|-)\s+(\d{4}-\d{2}-\d{2})/
  );
  if (match) {
    return { from: match[1], to: match[3] };
  }
  return {};
}
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',

});
export async function POST(req: Request) {
  const { messages } = await req.json();
  const userQuery: string = messages[messages.length - 1].content;

  const wantsSales =
    /(sale|revenue|order|income|gmv|turnover|profit)/i.test(userQuery);
  const wantsProducts =
    /(product|top|best|item|sku|stock|inventory)/i.test(userQuery);
  const wantsAnalytics =
    /(analytic|analytics|report|trend|kpi|metric|stats|statistics)/i.test(
      userQuery
    );

  const dateRange = extractDateRange(userQuery);
  const hasDateRange = !!(dateRange.from && dateRange.to);

  // 🔒 FORCE ANALYTICS WHEN DATE RANGE EXISTS
  const forceAnalytics = wantsAnalytics || hasDateRange;

  // Data containers
  let orders: any[] = [];
  let products: any[] = [];
  let salesReport: any = null;
  let topSellers: any[] = [];
  let ordersTotals: any = null;
  let productsTotals: any = null;
  let customersTotals: any = null;
  let couponsTotals: any = null;
  let revenueStats: any = null;
  let ordersStats: any = null;
  let couponsStats: any = null;

  try {
    const promises: Promise<any>[] = [];

    // ---------------- SALES ----------------
    if (wantsSales || hasDateRange) {
      promises.push(
        fetchWooOrders({
          per_page: '100',
          orderby: 'date',
          order: 'desc',
          status: 'any',
        }).then((res) => {
          orders = res;
        })
      );

      const salesParams: Record<string, string> = {};
      if (hasDateRange) {
        salesParams.date_min = dateRange.from!;
        salesParams.date_max = dateRange.to!;
      }

      promises.push(
        fetchWooSalesReport(salesParams).then((res) => {
          salesReport = Array.isArray(res) ? res[0] : res;
        })
      );

      promises.push(
        fetchWooOrdersTotals().then((res) => {
          ordersTotals = res;
        })
      );
    }

    // ---------------- PRODUCTS ----------------
    if (wantsProducts) {
      promises.push(
        fetchWooProducts({
          per_page: '100',
          status: 'any',
          orderby: 'date',
          order: 'desc',
        }).then((res) => {
          products = res;
        })
      );

      promises.push(
        fetchWooTopSellers({ per_page: '10' }).then((res) => {
          topSellers = res;
        })
      );

      promises.push(
        fetchWooProductsTotals().then((res) => {
          productsTotals = res;
        })
      );
    }

    // ---------------- GLOBAL TOTALS ----------------
    promises.push(
      fetchWooCustomersTotals().then((res) => {
        customersTotals = res;
      })
    );

    promises.push(
      fetchWooCouponsTotals().then((res) => {
        couponsTotals = res;
      })
    );

    // ---------------- ANALYTICS (ALWAYS WHEN FORCED) ----------------
    if (forceAnalytics) {
      const analyticsParams: Record<string, string> = {
        interval: 'day',
        per_page: '100',
      };

      if (hasDateRange) {
        analyticsParams.after = `${dateRange.from}T00:00:00Z`;
        analyticsParams.before = `${dateRange.to}T23:59:59Z`;
      }

      promises.push(
        fetchWooRevenueStats(analyticsParams).then((res) => {
          revenueStats = res;
        })
      );

      promises.push(
        fetchWooOrdersStats(analyticsParams).then((res) => {
          ordersStats = res;
        })
      );

      promises.push(
        fetchWooCouponsStats(analyticsParams).then((res) => {
          couponsStats = res;
        })
      );
    }

    await Promise.all(promises);
  } catch (e) {
    console.error('WooCommerce error:', e);
  }

  // ---------------- AUTHORITATIVE TOTALS ----------------
  // 🔒 SINGLE SOURCE OF TRUTH (NO AI CALCULATION)
  const totalSales =
    revenueStats?.totals?.gross_sales ??
    salesReport?.total_sales ??
    null;

  const netSales =
    revenueStats?.totals?.net_revenue ??
    salesReport?.net_sales ??
    null;

  // ---------------- DISPLAY DATA ----------------
  const recentOrdersStr = orders
    .slice(0, 10)
    .map((o) => `#${o.id} ${o.status} $${o.total}`)
    .join('; ');

  const recentProductsStr = products
    .slice(0, 10)
    .map((p) => `"${p.name}" $${p.price}`)
    .join('; ');

  const topSellersStr = topSellers
    .map((t) => `"${t.name}" qty:${t.quantity} total:$${t.total}`)
    .join('; ');

  // ---------------- CONTEXT ----------------
  const context = `
💰 AUTHORITATIVE TOTALS (DO NOT CALCULATE):
TOTAL_SALES: ${totalSales ?? 'unavailable'}
NET_SALES: ${netSales ?? 'unavailable'}

📊 REPORT TOTALS:
ORDERS_TOTALS: ${JSON.stringify(ordersTotals)}
PRODUCTS_TOTALS: ${JSON.stringify(productsTotals)}
CUSTOMERS_TOTALS: ${JSON.stringify(customersTotals)}
COUPONS_TOTALS: ${JSON.stringify(couponsTotals)}

📉 ANALYTICS (SOURCE OF TRUTH):
REVENUE_STATS: ${JSON.stringify(revenueStats)}
ORDERS_STATS: ${JSON.stringify(ordersStats)}
COUPONS_STATS: ${JSON.stringify(couponsStats)}

📈 RECENT (DISPLAY ONLY — NOT TOTALS):
ORDERS: ${recentOrdersStr}
PRODUCTS: ${recentProductsStr}

🏆 TOP SELLERS:
${topSellersStr}
`.trim();

  const result = await streamText({
    model: openrouter('qwen/qwen3-max'),
    system: `
You are an e-commerce analyst.

CRITICAL RULES:
- NEVER calculate total sales from orders.
- ALWAYS use TOTAL_SALES if present.
- If TOTAL_SALES is unavailable, say totals cannot be determined.
- Orders are DISPLAY ONLY.

Use ONLY this data:
${context}

Respond in EXACT JSON:
{
  "narrative": "1-2 sentence summary.",
  "chart": { "type": "bar", "data": { "labels": [...], "datasets": [...] } },
  "table": [{"item": "Name", "value": 100}],
  "recommendation": "Optional tip."
}
Omit unused fields.
`,
    messages,
  });

 return result.toDataStreamResponse({
  headers: {
    "Content-Type": "application/json",
    'Content-Encoding': 'none',
  },
  getErrorMessage: (error: unknown) => {
    if (!error) return "unknown error";
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    return JSON.stringify(error);
  },
});

 
}

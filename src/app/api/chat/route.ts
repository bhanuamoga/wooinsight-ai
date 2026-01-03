import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { fetchWooOrders, fetchWooProducts } from '@/lib/woo';


export const runtime = 'edge';


export async function POST(req: Request) {
  const { messages } = await req.json();
  const userQuery = messages[messages.length - 1].content;


  // Fetch real WooCommerce data
  let orders: any[] = [];
  let products: any[] = [];
  try {
    if (userQuery.match(/(sale|revenue|order|income)/i)) {
      orders = await fetchWooOrders({ per_page: '50' });
    }
    if (userQuery.match(/(product|top|best|item)/i)) {
      products = await fetchWooProducts({ per_page: '20' });
    }
  } catch (e) {
    console.error('WooCommerce error:', e);
  }


  // Build context
  const context = `
ORDERS (recent): ${orders.slice(0, 5).map(o => `ID ${o.id}: $${o.total}`).join('; ')}
PRODUCTS (top): ${products.slice(0, 5).map(p => `"${p.name}" ($${p.price})`).join('; ')}
  `.trim();


  // Use OpenAI with streaming
  const result = await streamText({
    model: openai('gpt-4o-mini'), // cheap, fast, smart
    system: `You are an e-commerce analyst. Use ONLY this data:
${context}


Respond in EXACT JSON:
{
  "narrative": "1-2 sentence summary.",
  "chart": { "type": "bar", "data": { "labels": [...], "datasets": [...] } },
  "table": [{"item": "Name", "value": 100}],
  "recommendation": "Optional tip."
}
Omit unused fields.`,
    messages,
  });


  return result.toAIStreamResponse();
}

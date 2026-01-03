import { StreamingTextResponse, createStreamDataTransformer } from 'ai';
import { fetchWooOrders, fetchWooProducts } from '@/lib/woo';

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;

export const runtime = 'edge';

export async function POST(req: Request) {
  if (!DASHSCOPE_API_KEY) {
    return new Response('DASHSCOPE_API_KEY not set', { status: 500 });
  }

  const { messages } = await req.json();
  const userQuery = messages[messages.length - 1].content;
  const startTime = Date.now();

  let orders: any[] = [];
  let products: any[] = [];

  try {
    if (userQuery.toLowerCase().includes('order') || userQuery.toLowerCase().includes('sale') || userQuery.toLowerCase().includes('revenue')) {
      orders = await fetchWooOrders({ per_page: '100', status: 'processing,completed' });
    }
    if (userQuery.toLowerCase().includes('product') || userQuery.toLowerCase().includes('top')) {
      products = await fetchWooProducts({ per_page: '20', orderby: 'date' });
    }
  } catch (e) {
    console.error('WooCommerce fetch error:', e);
  }

  const context = `
ORDERS (last 10): ${orders.slice(0, 10).map(o => `${o.id}: $${o.total}`).join('; ')}
PRODUCTS (top 5): ${products.slice(0, 5).map(p => `"${p.name}" ($${p.price})`).join('; ')}
  `.trim();

  const prompt = `
You are an e-commerce analyst. Use ONLY the data below to answer.
User question: "${userQuery}"

Data context:
${context}

Respond in EXACT JSON format:
{
  "narrative": "1-2 sentence summary.",
  "chart": {
    "type": "bar",
    "data": {
      "labels": ["Product A", "Product B"],
      "datasets": [{
        "label": "Revenue",
        "data": [100, 200],
        "backgroundColor": "rgba(59, 130, 246, 0.5)"
      }]
    }
  },
  "table": [{"product": "T-Shirt", "revenue": 1200}],
  "recommendation": "Optional actionable tip."
}
Omit any field if not applicable. DO NOT add extra fields.
  `.trim();

  const response = await fetch(
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        input: { messages: [{ role: 'user', content: prompt }] },
        parameters: { result_format: 'message' },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('DashScope error:', error);
    return new Response('AI service error', { status: 500 });
  }

  const data = await response.json();
  const content = data.output?.choices?.[0]?.message?.content || '{"narrative": "Sorry, I could not process your request."}';

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(content));
      controller.close();
    },
  });

  return new StreamingTextResponse(stream.pipeThrough(createStreamDataTransformer()));
}

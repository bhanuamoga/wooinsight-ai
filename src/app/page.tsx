'use client';

import { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import MessageCard from '@/components/MessageCard';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-2">WooInsight AI</h1>
        <p className="text-gray-600 text-center mb-6">Ask about your store: sales, products, trends & more</p>

        <div className="bg-white rounded-xl shadow-sm border p-5 h-[70vh] overflow-y-auto mb-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Try: "Show my top 5 products" or "Revenue last 30 days"
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`mb-6 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.role === 'user' ? (
                  <div className="inline-block bg-blue-600 text-white rounded-2xl px-4 py-2 max-w-xs">
                    {m.content}
                  </div>
                ) : (
                  <MessageCard content={m.content} />
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your WooCommerce store..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

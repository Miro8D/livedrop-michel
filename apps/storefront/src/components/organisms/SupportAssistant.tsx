import { useEffect, useRef, useState } from 'react';
import { askAssistant } from '../../lib/api';

type Message = { role: 'user' | 'assistant'; text: string };

export default function SupportAssistant() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setMessages(m => [...m, { role: 'user', text: trimmed }]);
    setQuery('');
    setLoading(true);
    try {
      const res: any = await askAssistant(trimmed);
      let reply = '';
      if (typeof res === 'string') reply = res;
      else if (res && typeof res === 'object') reply = res.text || JSON.stringify(res);
      else reply = String(res);

      if (!reply || reply.trim() === '' || reply === 'No response') {
        reply = 'Sorry — the assistant is temporarily unavailable. To place an order: add products to your cart and complete the checkout form. If you need urgent help, include your email in the checkout and we will follow up.';
      }

      setMessages(m => [...m, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: 'Assistant failed to respond.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {!open ? (
        <button onClick={() => setOpen(true)} aria-label="Open support" className="bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.8L3 20l1.2-4.8A9.863 9.863 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      ) : (
        <div className={`w-full md:w-96 bg-white shadow-2xl border rounded`}>
          <div className="p-3 flex items-center justify-between border-b">
            <div className="font-semibold">Support Assistant</div>
            <div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-xl text-slate-600 font-bold px-2 py-1 rounded hover:bg-slate-100">×</button>
            </div>
          </div>

          <div className="p-3">
            <div ref={messagesRef} className="mb-3 h-64 overflow-y-auto space-y-2 border rounded p-2 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-sm text-slate-500">Ask about orders, shipping, returns, and more. Paste an order ID to fetch status.</div>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`max-w-[85%] ${m.role === 'user' ? 'self-end bg-blue-600 text-white ml-auto' : 'self-start bg-white text-slate-900'} p-3 rounded-lg`}>
                  <div className="text-sm">{m.text}</div>
                </div>
              ))}
            </div>

            <div>
              <textarea rows={3} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full border rounded px-2 py-1 text-sm resize-none" placeholder="Ask a question or paste an order ID..." onKeyDown={async (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); await send(); } }} />
              <div className="mt-2 flex gap-2 justify-end">
                <button onClick={send} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Processing...' : 'Send'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


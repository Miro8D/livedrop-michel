import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '../components';
import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { askSupport } from '../assistant/engine';

// Lazy load all pages except Catalog (entry point)
import Catalog from '../pages/catalog';
const Product = lazy(() => import('../pages/product'));
const Cart = lazy(() => import('../pages/cart'));
const Checkout = lazy(() => import('../pages/checkout'));
const OrderStatus = lazy(() => import('../pages/order-status'));

// Loading component with instant mount and smooth fade-in
function PageLoader() {
  return (
    <div className="animate-fadein w-full h-[50vh] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}

// Route transition performance tracker
function RouteTracker() {
  const location = useLocation();
  
  useEffect(() => {
    const start = performance.now();
    
    // Mark the start of navigation
    performance.mark('route-change-start');
    
    // Use requestAnimationFrame to measure when the page is visually ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const end = performance.now();
        const duration = end - start;
        
        // Mark the end and measure
        performance.mark('route-change-end');
        performance.measure('route-change', 'route-change-start', 'route-change-end');
        
        // Log only in development
        if (import.meta.env.DEV) {
          console.log(`Route transition to ${location.pathname} took ${duration.toFixed(1)}ms`);
        }
      });
    });
  }, [location]);

  return null;
}

export default function AppRouter() {
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportQuery, setSupportQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant'; text: string;}[]>([]);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Append user message
    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setSupportQuery('');
    setLoadingSupport(true);
    const res = await askSupport(trimmed) as any;
    let reply = '';
    if (typeof res === 'string') reply = res;
    else if (res && typeof res === 'object') reply = `${res.text}${res.citation ? ' ' + res.citation : ''}`;
    else reply = String(res);
    setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    setLoadingSupport(false);
  };
  return (
    <BrowserRouter>
      <RouteTracker />
      <div className="min-h-screen w-full bg-gradient-to-b from-white via-sky-50 to-blue-100 text-slate-800">
        <Header />
        <div className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/p/:id" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderStatus />} />
            </Routes>
          </Suspense>
        </div>

        {/* Floating Support Button */}
        <div className="fixed right-6 bottom-6 z-50">
          <button
            onClick={() => setSupportOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg"
          >
            Support
          </button>
        </div>

        {/* Inline Support Panel */}
        {supportOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSupportOpen(false)} />
            <aside className="relative w-full md:w-96 bg-white shadow-2xl border-l border-slate-200 p-4 transform translate-y-6 md:translate-y-0 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Support Assistant</h3>
                <button onClick={() => setSupportOpen(false)} className="text-gray-500 hover:text-gray-700">Close</button>
              </div>

              <div className="mt-4 flex flex-col gap-3 h-[60vh]">
                <div ref={messagesRef} className="flex-1 overflow-y-auto space-y-3 p-2">
                  {messages.length === 0 && (
                    <div className="p-3 text-sm text-slate-500">Ask about orders, shipping, returns, and more. Paste an order ID to fetch status.</div>
                  )}
                  {messages.map((m, idx) => (
                    <div key={idx} className={`max-w-[85%] ${m.role === 'user' ? 'self-end bg-blue-600 text-white' : 'self-start bg-blue-50 text-slate-900'} p-3 rounded-lg`}> 
                      <div className="text-sm">{m.text}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <textarea
                    value={supportQuery}
                    onChange={(e) => setSupportQuery(e.target.value)}
                    rows={3}
                    placeholder="Ask a question or paste an order ID..."
                    className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onKeyDown={async (e) => {
                      // Enter to send, Shift+Enter for newline
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        await sendMessage(supportQuery);
                      }
                    }}
                    autoFocus
                  />

                  <div className="mt-2 flex gap-2 justify-end">
                    <button
                      onClick={async () => { if (supportQuery.trim()) await sendMessage(supportQuery); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      {loadingSupport ? 'Processing...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

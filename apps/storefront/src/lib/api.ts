export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  tags: string[];
  stockQty: number;
  description?: string;
  imageURL?: string;
};
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

async function fetchJson(path: string, options: RequestInit = {}) {
  const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}` : path;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function listProducts(page = 1, limit = 10, opts?: { search?: string; tag?: string; sort?: string }) {
  try {
    if (!API_BASE) {
      let all = await fetch('/mock-catalog.json').then(r => r.json()).catch(() => []);
      // apply simple mock filters
      if (opts?.search) {
        const q = opts.search.toLowerCase();
        all = all.filter((p: any) => (p.name || p.title || '').toLowerCase().includes(q) || (p.tags || []).some((t: string) => t.toLowerCase().includes(q)));
      }
      if (opts?.tag) {
        all = all.filter((p: any) => (p.tags || []).includes(opts.tag));
      }
      if (opts?.sort) {
        switch (opts.sort) {
          case 'price-asc': all.sort((a: any,b: any) => a.price - b.price); break;
          case 'price-desc': all.sort((a: any,b: any) => b.price - a.price); break;
          case 'name-asc': all.sort((a: any,b: any) => (a.name || a.title || '').localeCompare(b.name || b.title || '')); break;
          case 'name-desc': all.sort((a: any,b: any) => (b.name || b.title || '').localeCompare(a.name || a.title || '')); break;
        }
      }
      const start = (page - 1) * limit;
      const items = all.slice(start, start + limit);
      return { items, page, total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)) };
    }

    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('limit', String(limit));
    if (opts?.search) q.set('search', opts.search);
    if (opts?.tag) q.set('tag', opts.tag);
    if (opts?.sort) q.set('sort', opts.sort);
    const res = await fetchJson(`/api/products?${q.toString()}`);
    // backend returns { page, limit, total, totalPages, data: [...] }
    const meta = {
      page: res.page ?? page,
      limit: res.limit ?? limit,
      total: res.total ?? (res.data ? res.data.length : 0),
      totalPages: res.totalPages ?? Math.ceil((res.total ?? (res.data ? res.data.length : 0)) / limit)
    };

    const rawItems = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : res.data ?? []);
    const items = (rawItems || []).map((p: any) => ({
      id: p._id || p.id || p._id_str || String(p.id),
      title: p.name || p.title || p.productName || '',
      price: p.price ?? p.cost ?? 0,
      image: p.image || p.imageUrl || p.imageURL || '',
      imageURL: p.imageUrl || p.imageURL || p.image || '',
      tags: p.tags || p.categories || [],
      stockQty: p.stock ?? p.stockQty ?? p.quantity ?? 0,
      description: p.description || p.desc || ''
    }));

    return { items, ...meta };
  } catch (err) {
    const all = await fetch('/mock-catalog.json').then(r => r.json()).catch(() => []);
    const start = (page - 1) * limit;
    const items = all.slice(start, start + limit);
    return { items, page, total: all.length, totalPages: Math.ceil(all.length / limit) };
  }
}

export async function getProduct(id: string) {
  try {
    if (!API_BASE) {
      const list = await fetch('/mock-catalog.json').then(r => r.json());
      const p = list.find((p: any) => p.id === id || p._id === id);
      if (!p) return null;
      return {
        id: p._id || p.id,
        title: p.name || p.title,
        price: p.price,
        image: p.image || p.imageUrl || p.imageURL,
        imageURL: p.imageUrl || p.imageURL,
        tags: p.tags || [],
        stockQty: p.stock ?? p.stockQty ?? 0,
        description: p.description || ''
      };
    }
    const res = await fetchJson(`/api/products/${id}`);
    const p = res?.data ?? res;
    if (!p) return null;
    return {
      id: p._id || p.id || id,
      title: p.name || p.title || '',
      price: p.price ?? 0,
      image: p.image || p.imageUrl || p.imageURL || '',
      imageURL: p.imageUrl || p.imageURL || '',
      tags: p.tags || p.categories || [],
      stockQty: p.stock ?? p.stockQty ?? 0,
      description: p.description || p.desc || ''
    };
  } catch (err) {
    return null;
  }
}

// Customers
export async function findCustomerByEmail(email: string) {
  try {
    if (!API_BASE) return null;
    const res = await fetchJson(`/api/customers?email=${encodeURIComponent(email)}`);
    // backend returns array or single
    const data = Array.isArray(res) ? res[0] : res.data ?? res;
    return data || null;
  } catch (err) {
    return null;
  }
}

export async function getCustomerById(id: string) {
  try {
    if (!API_BASE) return null;
    const res = await fetchJson(`/api/customers/${id}`);
    const data = res.data ?? res;
    return data || null;
  } catch (err) {
    return null;
  }
}

// Create or update a customer record on the backend
export async function createCustomer(payload: { email: string; name?: string; phone?: string; address?: string }) {
  if (!API_BASE) return null;
  try {
    const res = await fetchJson('/api/customers', { method: 'POST', body: JSON.stringify(payload) });
    return res || null;
  } catch (err) {
    return null;
  }
}

// Product creation (admin)
export async function createProduct(payload: any) {
  if (!API_BASE) throw new Error('No API base');
  return fetchJson('/api/products', { method: 'POST', body: JSON.stringify(payload) });
}

// Orders
export async function getOrderById(id: string) {
  try {
    if (!API_BASE) return null;
    const res = await fetchJson(`/api/orders/${id}`);
    return res || null;
  } catch (err) {
    return null;
  }
}

export async function getOrdersByCustomer(customerId: string) {
  try {
    if (!API_BASE) return [];
    const res = await fetchJson(`/api/orders?customerId=${encodeURIComponent(customerId)}`);
    return res.data ?? res ?? [];
  } catch (err) {
    return [];
  }
}

// Analytics / Dashboard
export async function getDailyRevenue(from: string, to: string) {
  try {
    if (!API_BASE) return [];
    const res = await fetchJson(`/api/analytics/daily-revenue?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    return res || [];
  } catch (err) {
    return [];
  }
}

export async function getAnalyticsDashboardMetrics() {
  try {
    if (!API_BASE) return null;
    const res = await fetchJson('/api/analytics/dashboard-metrics');
    return res || null;
  } catch (err) {
    return null;
  }
}

export async function getBusinessMetrics() {
  try {
    if (!API_BASE) return null;
    const res = await fetchJson('/api/dashboard/business-metrics');
    return res || null;
  } catch (err) {
    return null;
  }
}

export async function getPerformanceMetrics() {
  try {
    if (!API_BASE) return null;
    const res = await fetchJson('/api/dashboard/performance');
    return res || null;
  } catch (err) {
    return null;
  }
}

export async function getPerformanceWithLLM() {
  try {
    if (!API_BASE) return null;
    const res = await fetchJson('/api/dashboard/performance/with-llm');
    return res || null;
  } catch (err) {
    return null;
  }
}

export async function getAssistantStats() {
  try {
    if (!API_BASE) return null;
    const res = await fetchJson('/api/dashboard/assistant-stats');
    return res || null;
  } catch (err) {
    return null;
  }
}

export async function askAssistant(query: string) {
  try {
    if (!API_BASE) return null;
    const res = await fetchJson('/api/assistant/query', { method: 'POST', body: JSON.stringify({ query }) });
    return res || null;
  } catch (err) {
    return null;
  }
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

export function placeOrder(cart: any[], customerInfo?: CustomerInfo) {
  const total = (cart || []).reduce((sum: number, it: any) => sum + (it.price || 0) * (it.qty ?? it.quantity ?? 0), 0);
  if (!API_BASE) {
    return { orderId: Math.random().toString(36).substring(2, 12).toUpperCase(), total, customerInfo };
  }

  return fetchJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ customerId: customerInfo?.email ?? 'guest', items: cart, total }),
  }).then((res: any) => ({ orderId: res.orderId || res.insertedId || res.id, total, raw: res }));
}

export function getOrderStatus(id: string) {
  if (!API_BASE) {
    const statuses = ["Placed", "Packed", "Shipped", "Delivered"];
    const random = statuses[Math.floor(Math.random() * statuses.length)];
    return { id, status: random, carrier: random !== "Placed" ? "DHL" : null, eta: random === "Delivered" ? null : "3 days" };
  }
  return fetchJson(`/api/orders/${id}`).then((order: any) => ({ id: order._id || order.id || id, status: order.status || 'Unknown', carrier: order.carrier || null, eta: order.eta || null }));
}

export async function fetchOrderStatus(id: string) {
  try {
    if (!API_BASE) return getOrderStatus(id);
    const order = await fetchJson(`/api/orders/${id}`);
    return { id: order._id || order.id || id, status: order.status || 'Unknown', carrier: order.carrier || null, eta: order.eta || null };
  } catch (err) {
    return { id, status: 'Unknown', carrier: null, eta: null };
  }
}

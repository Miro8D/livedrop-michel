import { useEffect, useState, useRef } from 'react';
import { getBusinessMetrics, getPerformanceMetrics, getAssistantStats, getDailyRevenue } from '../lib/api';

function formatCurrency(n: number) {
  return `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function SmallStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm border">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

// Very small sparkline for revenue
function LineChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  const w = 300, h = 80, pad = 6;
  if (!data || data.length === 0) return <div className="text-sm text-slate-500">No data</div>;
  const vals = data.map(d => d.revenue);
  const min = Math.min(...vals), max = Math.max(...vals);
  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.revenue - min) / Math.max(1e-6, max - min)) * (h - pad * 2 || 1);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="block">
      <polyline fill="none" stroke="#0ea5e9" strokeWidth={2} points={points} />
    </svg>
  );
}

function BarChart({ items, labelKey = 'name', valueKey = 'count' }: any) {
  const max = Math.max(...items.map((i: any) => i[valueKey] || 0), 1);
  return (
    <div className="space-y-2">
      {items.map((it: any, idx: number) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="text-sm w-36 text-slate-700">{it[labelKey]}</div>
          <div className="bg-slate-100 rounded flex-1 h-6 overflow-hidden">
            <div className="h-6 bg-blue-500" style={{ width: `${((it[valueKey] || 0) / max) * 100}%` }} />
          </div>
          <div className="w-12 text-right text-sm text-slate-600">{it[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [business, setBusiness] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [assistant, setAssistant] = useState<any>(null);
  const [revenueSeries, setRevenueSeries] = useState<any[]>([]);
  const mounted = useRef(true);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function fetchAll() {
    try {
      const [b, p, a] = await Promise.all([getBusinessMetrics(), getPerformanceMetrics(), getAssistantStats()]);
      if (mounted.current) {
        setBusiness(b);
        setPerformance(p);
        setAssistant(a);
      }
      // fetch 14 days revenue
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 13);
      const dr = await getDailyRevenue(from.toISOString(), to.toISOString());
      if (mounted.current) setRevenueSeries(Array.isArray(dr) ? dr : []);
    } catch (err) {
      console.error('Error fetching admin data', err);
    }
  }

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 10000); // poll every 10s
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SmallStat label="Total Revenue" value={business ? formatCurrency(business.totalRevenue) : '—'} />
        <SmallStat label="Total Orders" value={business ? business.totalOrders : '—'} />
        <SmallStat label="Avg Order Value" value={business ? formatCurrency(business.avgOrderValue) : '—'} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white p-4 rounded shadow-sm border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Revenue (last 14 days)</h3>
            <div className="text-sm text-slate-500">Updated: {performance?.timestamp ? new Date(performance.timestamp).toLocaleTimeString() : '—'}</div>
          </div>
          <div className="mt-3">
            <LineChart data={revenueSeries.map((d: any) => ({ date: d.date, revenue: d.revenue }))} />
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm border">
          <h3 className="font-semibold">Orders by Status</h3>
          <div className="mt-3">
            {business && business.statusBreakdown ? (
              <BarChart items={business.statusBreakdown.map((s: any) => ({ name: s._id || 'Unknown', count: s.count }))} labelKey="name" valueKey="count" />
            ) : (
              <div className="text-sm text-slate-500">No data</div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow-sm border">
          <h3 className="font-semibold">API Performance</h3>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between"><div className="text-sm text-slate-600">Average latency</div><div className="font-medium">{performance ? `${performance.averageLatencyMs} ms` : '—'}</div></div>
            <div className="flex justify-between"><div className="text-sm text-slate-600">Failed requests</div><div className="font-medium">{performance ? performance.failedRequests : '—'}</div></div>
            <div className="flex justify-between"><div className="text-sm text-slate-600">Active SSE connections</div><div className="font-medium">{performance ? performance.activeSSEConnections : '—'}</div></div>
            <div className="flex justify-between"><div className="text-sm text-slate-600">Avg LLM response</div><div className="font-medium">{performance ? `${performance.averageLLMResponseMs} ms` : '—'}</div></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm border">
          <h3 className="font-semibold">Assistant</h3>
          <div className="mt-3">
            <div className="flex justify-between"><div className="text-sm text-slate-600">Total queries</div><div className="font-medium">{assistant ? assistant.totalIntents : '—'}</div></div>
            <div className="mt-3">
              {assistant && assistant.intents ? (
                <BarChart items={assistant.intents.map((i: any) => ({ name: i.name, count: i.count }))} labelKey="name" valueKey="count" />
              ) : (
                <div className="text-sm text-slate-500">No intent data</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow-sm border">
        <h3 className="font-semibold mb-2">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border rounded">
                <div className="text-sm text-slate-500">DB Connection</div>
                <div className="mt-2 font-medium">{performance ? 'Connected' : 'Unknown'}</div>
          </div>
          <div className="p-3 border rounded">
                <div className="text-sm text-slate-500">LLM Service</div>
                <div className="mt-2 font-medium">{performance ? (performance.averageLLMResponseMs && performance.averageLLMResponseMs > 0 ? 'Up' : 'Unknown') : '—'}</div>
          </div>
          <div className="p-3 border rounded">
            <div className="text-sm text-slate-500">Last updated</div>
            <div className="mt-2 font-medium">{performance ? new Date(performance.timestamp).toLocaleString() : '—'}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

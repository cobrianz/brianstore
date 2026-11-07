'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import DataTable, { StatusBadge, money, fmtDate } from '@/components/DataTable';
import { toast } from '@/components/Toast';

interface DashData {
  productsCount: number; guidesCount: number;
  ordersCount: number; subscribersCount: number;
  revenueCents: number; recentOrders: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/dashboard', { credentials: 'same-origin', headers: { 'x-csrf-token': window.__adminCsrf || '' } });
        if (res.status === 401) { router.push('/login'); return; }
        const d = await res.json();
        if (!res.ok) throw new Error(d.error);
        setData(d);
      } catch (e: any) { toast(e.message, true); }
      finally { setLoading(false); }
    }
    // wait for csrf from layout
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, []);

  const stats = data ? [
    { label: 'Products', value: data.productsCount, icon: '▧' },
    { label: 'Free guides', value: data.guidesCount, icon: '▤' },
    { label: 'Orders', value: data.ordersCount, icon: '▱' },
    { label: 'Subscribers', value: data.subscribersCount, icon: '◎' },
    { label: 'Revenue', value: money(data.revenueCents), icon: '↗', mono: true },
  ] : [];

  return (
    <AdminLayout>
      {loading ? <div style={{ padding: 40, color: 'var(--muted)' }}>Loading overview…</div> : (
        <>
          <div className="stats-grid">
            {stats.map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-head">
                  <span>{s.label}</span>
                  <span className="stat-icon">{s.icon}</span>
                </div>
                <p className="stat-number" style={s.mono ? { fontFamily: 'DM Mono, monospace', fontSize: 22 } : {}}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Recent orders</h2>
                <p>Latest 8 orders across all statuses</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => router.push('/orders')}>View all</button>
            </div>
            <DataTable
              rows={data?.recentOrders || []}
              emptyTitle="No orders yet"
              emptyText="Orders will appear here when received."
              columns={[
                { label: 'Reference', render: r => <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{r.reference || r.id}</span> },
                { label: 'Customer', render: r => <><div className="cell-title">{r.customerEmail || r.email || '—'}</div></> },
                { label: 'Date', render: r => fmtDate(r.createdAt) },
                { label: 'Amount', render: r => <span style={{ fontFamily: 'DM Mono, monospace' }}>{money(r.amountCents, r.currency)}</span> },
                { label: 'Status', render: r => <StatusBadge value={r.status || 'unknown'} /> },
              ]}
            />
          </div>
        </>
      )}
    </AdminLayout>
  );
}

declare global { interface Window { __adminCsrf?: string; } }

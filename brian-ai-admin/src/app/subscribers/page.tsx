'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import DataTable, { StatusBadge, fmtDate } from '@/components/DataTable';
import { toast } from '@/components/Toast';

export default function SubscribersPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const csrf = () => window.__adminCsrf || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscribers', { credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      if (res.status === 401) { router.push('/login'); return; }
      setSubscribers(await res.json());
    } catch (e: any) { toast(e.message, true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  async function del(id: string, email: string) {
    if (!confirm(`Delete subscriber "${email}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE', credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      if (!res.ok) { const d = await res.json(); toast(d.error, true); return; }
      toast('Subscriber deleted.'); load();
    } catch (e: any) { toast(e.message, true); }
  }

  async function exportCsv() {
    try {
      const res = await fetch('/api/admin/subscribers/export', { credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      if (!res.ok) { toast('Export failed.', true); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'subscribers.csv';
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast('CSV exported.');
    } catch (e: any) { toast(e.message, true); }
  }

  return (
    <AdminLayout>
      <div className="heading-row">
        <div><h2>Subscribers</h2><p className="sub">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''} on your list.</p></div>
        <button className="btn btn-secondary" onClick={exportCsv}>↓ Export CSV</button>
      </div>
      <div className="panel">
        {loading ? <div style={{ padding: 32, color: 'var(--muted)' }}>Loading subscribers…</div> : (
          <DataTable
            rows={subscribers}
            emptyTitle="No subscribers yet"
            emptyText="Subscribers will appear here when they sign up."
            columns={[
              { label: 'Email', render: r => <strong>{r.email}</strong> },
              { label: 'Source', render: r => r.source || '—' },
              { label: 'Status', render: r => <StatusBadge value={r.status || 'subscribed'} /> },
              { label: 'Subscribed', render: r => fmtDate(r.subscribedAt || r.createdAt) },
              { label: 'Actions', render: r => (
                <button className="btn btn-danger btn-sm" onClick={() => del(r.id, r.email)}>Delete</button>
              )},
            ]}
          />
        )}
      </div>
    </AdminLayout>
  );
}

declare global { interface Window { __adminCsrf?: string; } }

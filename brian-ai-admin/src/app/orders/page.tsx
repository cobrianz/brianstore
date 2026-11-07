'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import DataTable, { StatusBadge, money, fmtDate } from '@/components/DataTable';
import { toast } from '@/components/Toast';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; order?: any }>({ open: false });
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const csrf = () => window.__adminCsrf || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      if (res.status === 401) { router.push('/login'); return; }
      setOrders(await res.json());
    } catch (e: any) { toast(e.message, true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  async function saveNote() {
    if (!noteDialog.order) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${noteDialog.order.id}/note`, {
        method: 'PATCH', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf() },
        body: JSON.stringify({ adminNote: noteText }),
      });
      if (!res.ok) { const d = await res.json(); toast(d.error, true); return; }
      toast('Note saved.'); setNoteDialog({ open: false }); load();
    } catch (e: any) { toast(e.message, true); }
    finally { setSaving(false); }
  }

  return (
    <AdminLayout>
      <div className="heading-row">
        <div><h2>Order history</h2><p className="sub">Payment status is read-only. Only admin notes can be edited.</p></div>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--muted)' }}>{orders.length} orders</span>
      </div>
      <div className="panel">
        {loading ? <div style={{ padding: 32, color: 'var(--muted)' }}>Loading orders…</div> : (
          <DataTable
            rows={orders}
            emptyTitle="No orders yet"
            emptyText="Orders will appear here when received."
            columns={[
              { label: 'Reference', render: r => <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{r.reference || r.id}</span> },
              { label: 'Customer', render: r => <><div className="cell-title">{r.email || r.customerEmail || '—'}</div><div className="cell-sub">{fmtDate(r.createdAt)}</div></> },
              { label: 'Items', render: r => <span style={{ fontSize: 12 }}>{Array.isArray(r.items) ? r.items.join(', ') : '—'}</span> },
              { label: 'Amount', render: r => <span style={{ fontFamily: 'DM Mono, monospace' }}>{money(r.amountCents, r.currency)}</span> },
              { label: 'Status', render: r => <StatusBadge value={r.status || 'unknown'} /> },
              { label: 'Note', render: r => <span style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 160, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.adminNote || '—'}</span> },
              { label: 'Actions', render: r => (
                <button className="btn btn-secondary btn-sm" onClick={() => { setNoteText(r.adminNote || ''); setNoteDialog({ open: true, order: r }); }}>
                  Edit note
                </button>
              )},
            ]}
          />
        )}
      </div>

      {noteDialog.open && (
        <div className="dialog-overlay" onClick={e => { if (e.target === e.currentTarget) setNoteDialog({ open: false }); }}>
          <div className="dialog" style={{ maxWidth: 480 }}>
            <div className="dialog-head">
              <div>
                <p className="dialog-kicker">ORDER {noteDialog.order?.reference || noteDialog.order?.id}</p>
                <h2 className="dialog-title">Edit admin note</h2>
              </div>
              <button className="dialog-close" onClick={() => setNoteDialog({ open: false })}>×</button>
            </div>
            <div className="dialog-body">
              <div className="field">
                <label className="field-label">Internal note</label>
                <textarea rows={5} value={noteText} onChange={e => setNoteText(e.target.value)} />
                <span className="field-help">This note does not change payment or order status.</span>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn btn-secondary" onClick={() => setNoteDialog({ open: false })}>Cancel</button>
              <button className="btn btn-primary" onClick={saveNote} disabled={saving}>{saving ? 'Saving…' : 'Save note'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

declare global { interface Window { __adminCsrf?: string; } }

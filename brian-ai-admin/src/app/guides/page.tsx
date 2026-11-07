'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import DataTable, { StatusBadge, fmtDate } from '@/components/DataTable';
import { toast } from '@/components/Toast';

const CATEGORIES = ['Free guide', 'Prompt collection', 'Learning worksheet', 'Creative project', 'Tutorial'];
const EMPTY = { title: '', slug: '', category: 'Free guide', status: 'draft', summary: '', bodyMarkdown: '', coverKey: '', publicUrl: '' };

declare global { interface Window { __adminCsrf?: string; } }
function slugify(v: string) { return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100); }

export default function GuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<{ open: boolean; item?: any }>({ open: false });
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const csrf = () => window.__adminCsrf || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/guides', { credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      if (res.status === 401) { router.push('/login'); return; }
      setGuides(await res.json());
    } catch (e: any) { toast(e.message, true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  function openNew() { setForm({ ...EMPTY }); setFormError(''); setPanel({ open: true }); }
  function openEdit(item: any) { setForm({ ...item }); setFormError(''); setPanel({ open: true, item }); }
  function closePanel() { setPanel({ open: false }); }
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  async function uploadCover(file: File) {
    setUploadingCover(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('kind', 'public');
      const res = await fetch('/api/admin/files/upload', { method: 'POST', credentials: 'same-origin', headers: { 'x-csrf-token': csrf() }, body });
      const d = await res.json();
      if (!res.ok) { toast(d.error || 'Upload failed.', true); return; }
      set('coverKey', d.key);
      toast('Thumbnail uploaded.');
    } catch (e: any) { toast(e.message, true); }
    finally { setUploadingCover(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const id = panel.item?.id;
      const res = await fetch(`/api/admin/guides${id ? `/${id}` : ''}`, {
        method: id ? 'PATCH' : 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf() },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) { setFormError(d.error || 'Save failed.'); return; }
      toast(`Guide ${id ? 'updated' : 'created'}.`);
      closePanel(); load();
    } catch (e: any) { setFormError(e.message); }
    finally { setSaving(false); }
  }

  async function del(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await fetch(`/api/admin/guides/${id}`, { method: 'DELETE', credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      toast('Guide deleted.'); load();
    } catch (e: any) { toast(e.message, true); }
  }

  return (
    <AdminLayout>
      <div className="heading-row">
        <div><h2>Free guides</h2><p className="sub">{guides.length} guide{guides.length !== 1 ? 's' : ''} in your library.</p></div>
        <button className="btn btn-primary" onClick={openNew}>＋ Add guide</button>
      </div>

      <div className="panel">
        {loading ? <div style={{ padding: 32, color: 'var(--muted)' }}>Loading…</div> : (
          <DataTable
            rows={guides}
            emptyTitle="No guides yet"
            emptyText="Add your first free guide to get started."
            columns={[
              { label: 'Guide', render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {r.coverKey ? <div style={{ width: 40, height: 30, background: 'var(--sage)', borderRadius: 4, flexShrink: 0, overflow: 'hidden' }}><div style={{ width: '100%', height: '100%', background: 'var(--green)', opacity: 0.3 }} /></div> : <div style={{ width: 40, height: 30, background: 'var(--sage)', borderRadius: 4 }} />}
                  <div><div className="cell-title">{r.title}</div><div className="cell-sub">{r.slug}</div></div>
                </div>
              )},
              { label: 'Category', render: r => r.category || '—' },
              { label: 'Status', render: r => <StatusBadge value={r.status} /> },
              { label: 'Cover', render: r => r.coverKey ? <span style={{ color: 'var(--green)', fontSize: 11, fontWeight: 600 }}>Set</span> : <span style={{ color: '#dc2626', fontSize: 11 }}>None</span> },
              { label: 'Public URL', render: r => r.publicUrl ? <a href={r.publicUrl} target="_blank" rel="noopener" style={{ color: 'var(--green)', fontSize: 11 }}>Open ↗</a> : '—' },
              { label: 'Updated', render: r => fmtDate(r.updatedAt) },
              { label: 'Actions', render: r => (
                <div className="row-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(r.id, r.title)}>Delete</button>
                </div>
              )},
            ]}
          />
        )}
      </div>

      {panel.open && (
        <div className="slideover-overlay" onClick={e => { if (e.target === e.currentTarget) closePanel(); }}>
          <div className="slideover">
            <div className="slideover-head">
              <div><p className="dialog-kicker">FREE GUIDES</p><h2>{panel.item ? 'Edit guide' : 'New guide'}</h2></div>
              <button className="dialog-close" onClick={closePanel}>×</button>
            </div>
            <form className="slideover-body" onSubmit={save}>
              <div className="form-section">
                <h3 className="form-section-title">Basic information</h3>
                <div className="field-grid">
                  <div className="field field-wide">
                    <label className="field-label">Title *</label>
                    <input type="text" value={form.title} required onChange={e => { set('title', e.target.value); if (!panel.item) set('slug', slugify(e.target.value)); }} />
                  </div>
                  <div className="field">
                    <label className="field-label">Slug *</label>
                    <input type="text" value={form.slug} required onChange={e => set('slug', e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field-label">Category</label>
                    <select value={form.category} onChange={e => set('category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label">Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="field field-wide">
                    <label className="field-label">Summary</label>
                    <textarea rows={2} value={form.summary} onChange={e => set('summary', e.target.value)} />
                  </div>
                  <div className="field field-wide">
                    <label className="field-label">Public URL</label>
                    <input type="url" value={form.publicUrl} onChange={e => set('publicUrl', e.target.value)} placeholder="https://…" />
                    <span className="field-help">External link shown on storefront.</span>
                  </div>
                  <div className="field field-wide">
                    <label className="field-label">Body (Markdown)</label>
                    <textarea rows={6} value={form.bodyMarkdown} onChange={e => set('bodyMarkdown', e.target.value)} style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Thumbnail image</h3>
                <div className="upload-drop-zone" onClick={() => coverRef.current?.click()}>
                  {form.coverKey ? (
                    <div className="upload-preview">
                      <div className="upload-preview-key">{form.coverKey.split('/').pop()}</div>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); set('coverKey', ''); }}>Remove</button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <strong>{uploadingCover ? 'Uploading…' : 'Click to upload thumbnail'}</strong>
                      <small>PNG, JPG, WEBP</small>
                    </div>
                  )}
                </div>
                <input ref={coverRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ''; }} />
              </div>

              {formError && <p className="form-error" style={{ padding: '0 24px' }}>{formError}</p>}
              <div className="slideover-footer">
                <button type="button" className="btn btn-secondary" onClick={closePanel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || uploadingCover}>
                  {saving ? 'Saving…' : panel.item ? 'Save changes' : 'Create guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import DataTable, { StatusBadge, money, fmtDate } from '@/components/DataTable';
import { toast } from '@/components/Toast';

const CATEGORIES = ['AI Prompts', 'Ebooks', 'Learning', 'Productivity', 'Other'];
const EMPTY = { title: '', slug: '', category: 'AI Prompts', priceCents: 500, status: 'draft', featured: false, description: '', coverKey: '', fileKey: '', fileName: '' };

declare global { interface Window { __adminCsrf?: string; } }

function slugify(v: string) { return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100); }

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<{ open: boolean; item?: any }>({ open: false });
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const csrf = () => window.__adminCsrf || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', { credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      if (res.status === 401) { router.push('/login'); return; }
      setProducts(await res.json());
    } catch (e: any) { toast(e.message, true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  function openNew() { setForm({ ...EMPTY }); setFormError(''); setPanel({ open: true }); }
  function openEdit(item: any) { setForm({ ...item, priceCents: item.priceCents ?? 500 }); setFormError(''); setPanel({ open: true, item }); }
  function closePanel() { setPanel({ open: false }); }

  async function uploadFile(file: File, kind: 'public' | 'private', field: 'coverKey' | 'fileKey') {
    const setter = field === 'coverKey' ? setUploadingCover : setUploadingFile;
    setter(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('kind', kind);
      const res = await fetch('/api/admin/files/upload', { method: 'POST', credentials: 'same-origin', headers: { 'x-csrf-token': csrf() }, body });
      const d = await res.json();
      if (!res.ok) { toast(d.error || 'Upload failed.', true); return; }
      setForm((p: any) => ({
        ...p,
        [field]: d.key,
        ...(field === 'fileKey' ? { fileName: d.name } : {}),
      }));
      toast(`${field === 'coverKey' ? 'Thumbnail' : 'Download file'} uploaded.`);
    } catch (e: any) { toast(e.message, true); }
    finally { setter(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const id = panel.item?.id;
      const payload = { ...form, priceCents: Math.round(Number(form.priceCents) || 0) };
      const res = await fetch(`/api/admin/products${id ? `/${id}` : ''}`, {
        method: id ? 'PATCH' : 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf() },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) { setFormError(d.error || 'Save failed.'); return; }
      toast(`Product ${id ? 'updated' : 'created'}.`);
      closePanel(); load();
    } catch (e: any) { setFormError(e.message); }
    finally { setSaving(false); }
  }

  async function del(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      if (!res.ok) { const d = await res.json(); toast(d.error, true); return; }
      toast('Product deleted.'); load();
    } catch (e: any) { toast(e.message, true); }
  }

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <AdminLayout>
      <div className="heading-row">
        <div><h2>Products</h2><p className="sub">{products.length} product{products.length !== 1 ? 's' : ''} in your catalog.</p></div>
        <button className="btn btn-primary" onClick={openNew}>＋ Add product</button>
      </div>

      <div className="panel">
        {loading ? <div style={{ padding: 32, color: 'var(--muted)' }}>Loading…</div> : (
          <DataTable
            rows={products}
            emptyTitle="No products yet"
            emptyText="Add your first product to get started."
            columns={[
              { label: 'Product', render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {r.coverKey
                    ? <img src={`/api/admin/cover-thumb?key=${encodeURIComponent(r.coverKey)}`} alt="" style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 4, background: 'var(--sage)', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    : <div style={{ width: 40, height: 30, background: 'var(--sage)', borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--muted)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>}
                  <div><div className="cell-title">{r.title}</div><div className="cell-sub">{r.slug}</div></div>
                </div>
              )},
              { label: 'Price', render: r => <span style={{ fontFamily: 'DM Mono, monospace' }}>{money(r.priceCents, r.currency)}</span> },
              { label: 'Category', render: r => r.category || '—' },
              { label: 'Status', render: r => <StatusBadge value={r.status} /> },
              { label: 'Files', render: r => (
                <div style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--muted)' }}>
                  {r.coverKey
                    ? <div style={{ color: 'var(--green)' }}>Cover set</div>
                    : <div style={{ color: '#dc2626' }}>No cover</div>}
                  {r.fileKey
                    ? <div style={{ color: 'var(--green)' }}>File set</div>
                    : <div style={{ color: '#dc2626' }}>No file</div>}
                </div>
              )},
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

      {/* Slide-over panel */}
      {panel.open && (
        <div className="slideover-overlay" onClick={e => { if (e.target === e.currentTarget) closePanel(); }}>
          <div className="slideover">
            <div className="slideover-head">
              <div>
                <p className="dialog-kicker">PRODUCT CATALOG</p>
                <h2>{panel.item ? 'Edit product' : 'New product'}</h2>
              </div>
              <button className="dialog-close" onClick={closePanel}>×</button>
            </div>
            <form className="slideover-body" onSubmit={save}>
              {/* Basic info */}
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
                    <label className="field-label">Price (USD) *</label>
                    <input type="number" step="0.01" min="0" value={((form.priceCents || 0) / 100).toFixed(2)}
                      onChange={e => set('priceCents', Math.round(parseFloat(e.target.value || '0') * 100))} required />
                  </div>
                  <div className="field">
                    <label className="field-label">Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: '1/-1' }}>
                    <label className="check-label">
                      <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
                      Featured — show prominently in shop
                    </label>
                  </div>
                  <div className="field field-wide">
                    <label className="field-label">Description</label>
                    <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Thumbnail upload */}
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
                      <small>PNG, JPG, WEBP · Shown in shop grid</small>
                    </div>
                  )}
                </div>
                <input ref={coverRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'public', 'coverKey'); e.target.value = ''; }} />
                {form.coverKey && (
                  <div className="field" style={{ marginTop: 8 }}>
                    <label className="field-label">Cover key (R2)</label>
                    <input type="text" value={form.coverKey} onChange={e => set('coverKey', e.target.value)} />
                  </div>
                )}
              </div>

              {/* Download file upload */}
              <div className="form-section">
                <h3 className="form-section-title">Download file</h3>
                <div className="upload-drop-zone" onClick={() => fileRef.current?.click()}>
                  {form.fileKey ? (
                    <div className="upload-preview">
                      <div className="upload-preview-key">{form.fileName || form.fileKey.split('/').pop()}</div>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); set('fileKey', ''); set('fileName', ''); }}>Remove</button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                      <strong>{uploadingFile ? 'Uploading…' : 'Click to upload product file'}</strong>
                      <small>PDF, EPUB, ZIP, DOCX · Delivered to buyer after payment</small>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.epub,.zip,.docx,.txt" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'private', 'fileKey'); e.target.value = ''; }} />
                {form.fileKey && (
                  <div className="field-grid" style={{ marginTop: 8 }}>
                    <div className="field">
                      <label className="field-label">File key (R2)</label>
                      <input type="text" value={form.fileKey} onChange={e => set('fileKey', e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">Download filename</label>
                      <input type="text" value={form.fileName} onChange={e => set('fileName', e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              {formError && <p className="form-error" style={{ padding: '0 24px' }}>{formError}</p>}

              <div className="slideover-footer">
                <button type="button" className="btn btn-secondary" onClick={closePanel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || uploadingCover || uploadingFile}>
                  {saving ? 'Saving…' : panel.item ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

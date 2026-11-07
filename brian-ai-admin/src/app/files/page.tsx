'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/components/Toast';

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

export default function FilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const csrf = () => window.__adminCsrf || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/files', { credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) { const d = await res.json(); toast(d.error, true); setFiles([]); return; }
      const d = await res.json();
      setFiles(d.objects || []);
    } catch (e: any) { toast(e.message, true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const kind = (form.elements.namedItem('kind') as HTMLSelectElement).value;
    if (!fileInput.files?.[0]) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', fileInput.files[0]);
      body.append('kind', kind);
      const res = await fetch('/api/admin/files/upload', { method: 'POST', credentials: 'same-origin', headers: { 'x-csrf-token': csrf() }, body });
      const d = await res.json();
      if (!res.ok) { toast(d.error || 'Upload failed.', true); return; }
      toast(`Uploaded ${d.name}.`); form.reset(); load();
    } catch (e: any) { toast(e.message, true); }
    finally { setUploading(false); }
  }

  async function getLink(key: string) {
    try {
      const res = await fetch(`/api/admin/files/signed?key=${encodeURIComponent(key)}&download=true`, { credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      const d = await res.json();
      if (d.url) window.open(d.url, '_blank', 'noopener');
      else toast('Could not get link.', true);
    } catch (e: any) { toast(e.message, true); }
  }

  async function del(key: string) {
    if (!confirm(`Delete "${key}"? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/admin/files', { method: 'DELETE', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf() }, body: JSON.stringify({ key }) });
      if (!res.ok) { const d = await res.json(); toast(d.error, true); return; }
      toast('File deleted.'); load();
    } catch (e: any) { toast(e.message, true); }
  }

  return (
    <AdminLayout>
      <div className="heading-row">
        <div><h2>File library</h2><p className="sub">Upload public assets or private downloads to Cloudflare R2.</p></div>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-head"><h2>Upload file</h2></div>
        <div className="upload-area">
          <form className="upload-form" onSubmit={upload}>
            <div className="field">
              <label className="field-label">File</label>
              <input name="file" type="file" required />
            </div>
            <div className="field">
              <label className="field-label">Access</label>
              <select name="kind">
                <option value="private">Private download</option>
                <option value="public">Public asset</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={uploading} style={{ marginTop: 22 }}>
              {uploading ? 'Uploading…' : '↑ Upload'}
            </button>
          </form>
        </div>
      </div>

      {loading ? <div style={{ color: 'var(--muted)', padding: 24 }}>Loading files…</div> : files.length === 0 ? (
        <div className="panel"><div className="empty-state"><strong>No files in storage</strong>Upload a file to see it here.</div></div>
      ) : (
        <div className="file-grid">
          {files.map(f => (
            <div className="file-card" key={f.key}>
              <div className="file-key">{f.key}</div>
              <div className="file-meta">
                {formatBytes(f.size)} · {f.public ? 'Public' : 'Private'} · {f.lastModified ? new Date(f.lastModified).toLocaleDateString() : '—'}
              </div>
              <div className="row-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => getLink(f.key)}>Get link</button>
                <button className="btn btn-danger btn-sm" onClick={() => del(f.key)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

declare global { interface Window { __adminCsrf?: string; } }

'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/components/Toast';

interface Faq { question: string; answer: string; }
interface Social { label: string; url: string; }
interface Content {
  heroTitle: string; heroSubtitle: string; aboutText: string;
  actirovaUrl: string; newsletterText: string; tickerText: string;
  faqs: Faq[]; socialLinks: Social[];
}

export default function ContentPage() {
  const router = useRouter();
  const [content, setContent] = useState<Content | null>(null);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [saving, setSaving] = useState(false);
  const csrf = () => window.__adminCsrf || '';

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content', { credentials: 'same-origin', headers: { 'x-csrf-token': csrf() } });
      if (res.status === 401) { router.push('/login'); return; }
      const d = await res.json();
      setContent(d); setFaqs(d.faqs || []); setSocials(d.socialLinks || []);
    } catch (e: any) { toast(e.message, true); }
  }, []);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const val = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value || '';
    const body = {
      heroTitle: val('heroTitle'), heroSubtitle: val('heroSubtitle'),
      aboutText: val('aboutText'), actirovaUrl: val('actirovaUrl'),
      newsletterText: val('newsletterText'), tickerText: val('tickerText'),
      faqs, socialLinks: socials,
    };
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf() }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); toast(d.error, true); return; }
      toast('Site content saved.'); load();
    } catch (e: any) { toast(e.message, true); }
    finally { setSaving(false); }
  }

  if (!content) return <AdminLayout><div style={{ padding: 32, color: 'var(--muted)' }}>Loading content…</div></AdminLayout>;

  const textField = (name: keyof Content, label: string, multiline = false) => (
    <div className="field field-wide" key={name}>
      <label className="field-label">{label}</label>
      {multiline
        ? <textarea name={name as string} defaultValue={content[name] as string} rows={4} />
        : <input name={name as string} type="text" defaultValue={content[name] as string} />}
    </div>
  );

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit}>
        <div className="content-layout">
          <div>
            <div className="content-card">
              <h2>Storefront copy</h2>
              <p>Edit the text visitors see on your site.</p>
              <div className="field-grid">
                {textField('heroTitle', 'Hero title')}
                {textField('heroSubtitle', 'Hero subtitle', true)}
                {textField('aboutText', 'About text', true)}
                {textField('actirovaUrl', 'Actirova URL')}
                {textField('newsletterText', 'Newsletter copy', true)}
                {textField('tickerText', 'Ticker text')}
              </div>
            </div>

            <div className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div><h2>FAQs</h2><p>Manage the questions shown on the storefront.</p></div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFaqs(p => [...p, { question: '', answer: '' }])}>＋ Add FAQ</button>
              </div>
              {faqs.map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 12, alignItems: 'start' }}>
                  <div className="field">
                    <label className="field-label">Question</label>
                    <input type="text" value={f.question} onChange={e => setFaqs(p => p.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} />
                  </div>
                  <div className="field">
                    <label className="field-label">Answer</label>
                    <textarea rows={3} value={f.answer} onChange={e => setFaqs(p => p.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))} />
                  </div>
                  <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 22 }} onClick={() => setFaqs(p => p.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              {faqs.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 12 }}>No FAQs yet.</p>}
            </div>

            <div className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div><h2>Social links</h2><p>Links displayed on your storefront.</p></div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSocials(p => [...p, { label: '', url: '' }])}>＋ Add link</button>
              </div>
              {socials.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, marginBottom: 12, alignItems: 'start' }}>
                  <div className="field">
                    <label className="field-label">Label</label>
                    <input type="text" value={s.label} onChange={e => setSocials(p => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  </div>
                  <div className="field">
                    <label className="field-label">URL</label>
                    <input type="url" value={s.url} onChange={e => setSocials(p => p.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                  </div>
                  <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 22 }} onClick={() => setSocials(p => p.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              {socials.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 12 }}>No social links yet.</p>}
            </div>
          </div>

          <div>
            <div className="sidebar-card">
              <h2>Publish changes</h2>
              <p>Save updates to site content. Products and orders are not affected.</p>
              <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
                {saving ? 'Saving…' : 'Save site content'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

declare global { interface Window { __adminCsrf?: string; } }

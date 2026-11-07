'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/components/Toast';

declare global { interface Window { __adminCsrf?: string; } }

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <h3>{title}</h3>
        {desc && <p>{desc}</p>}
      </div>
      <div className="settings-section-body">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const csrf = () => (typeof window !== 'undefined' ? window.__adminCsrf || '' : '');
  const [adminEmail, setAdminEmail] = useState('');

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // Health
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' }).then(r => r.json()).then(d => setAdminEmail(d.user?.email || ''));
    fetch('/api/health', { credentials: 'same-origin' }).then(r => r.json()).then(setHealth).catch(() => {});
  }, []);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast('New passwords do not match.', true); return; }
    if (pwForm.next.length < 8) { toast('New password must be at least 8 characters.', true); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf() },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const d = await res.json();
      if (!res.ok) { toast(d.error, true); return; }
      toast('Password updated successfully.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (e: any) { toast(e.message, true); }
    finally { setPwSaving(false); }
  }

  return (
    <AdminLayout>
      <div className="heading-row" style={{ marginBottom: 28 }}>
        <div><h2>Settings</h2><p className="sub">Configure your admin account and view system status.</p></div>
      </div>

      <div className="settings-grid">
        <div className="settings-main">

          {/* Account */}
          <Section title="Account" desc="Your admin account details.">
            <div className="field">
              <label className="field-label">Email address</label>
              <input type="email" value={adminEmail} readOnly style={{ background: 'var(--bg)', cursor: 'default' }} />
              <span className="field-help">Contact email. Changes require database update.</span>
            </div>
          </Section>

          {/* Change password */}
          <Section title="Change password" desc="Your password is stored as a bcrypt hash in MongoDB.">
            <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field">
                <label className="field-label">Current password</label>
                <input type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required autoComplete="current-password" />
              </div>
              <div className="field-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="field">
                  <label className="field-label">New password</label>
                  <input type="password" value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} required minLength={8} autoComplete="new-password" />
                  <span className="field-help">At least 8 characters.</span>
                </div>
                <div className="field">
                  <label className="field-label">Confirm new password</label>
                  <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required autoComplete="new-password" />
                </div>
              </div>
              <div>
                <button className="btn btn-primary" type="submit" disabled={pwSaving}>
                  {pwSaving ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </Section>

          {/* Session */}
          <Section title="Session" desc="Your current login session.">
            <div className="settings-info-row">
              <span>CSRF Token</span>
              <code style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>{csrf() ? csrf().slice(0, 16) + '…' : 'Not loaded'}</code>
            </div>
            <div className="settings-info-row">
              <span>Cookie name</span>
              <code style={{ fontSize: 11, fontFamily: 'DM Mono, monospace' }}>brian-admin</code>
            </div>
            <div className="settings-info-row">
              <span>Session duration</span>
              <code style={{ fontSize: 11, fontFamily: 'DM Mono, monospace' }}>8 hours</code>
            </div>
          </Section>

        </div>

        <div className="settings-side">

          {/* System status */}
          <div className="settings-card">
            <h3 className="settings-card-title">System status</h3>
            {health ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                <StatusRow label="API" ok={health.ok} />
                <StatusRow label="MongoDB" ok={health.database} />
                <StatusRow label="R2 Storage" ok={health.storageConfigured} />
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Checking…</p>
            )}
          </div>

          {/* Environment */}
          <div className="settings-card" style={{ marginTop: 16 }}>
            <h3 className="settings-card-title">Environment</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <EnvRow label="Admin port" value="4180" />
              <EnvRow label="MongoDB DB" value="brian_ai_store_admin" />
              <EnvRow label="R2 Bucket" value="brian-storage" />
              <EnvRow label="R2 Prefix" value="resources/" />
            </div>
          </div>

          {/* Docs */}
          <div className="settings-card" style={{ marginTop: 16 }}>
            <h3 className="settings-card-title">Quick links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <a href="http://localhost:3000" target="_blank" rel="noopener" className="settings-link">Storefront ↗</a>
              <a href="https://cloud.mongodb.com" target="_blank" rel="noopener" className="settings-link">MongoDB Atlas ↗</a>
              <a href="https://dash.cloudflare.com" target="_blank" rel="noopener" className="settings-link">Cloudflare R2 ↗</a>
              <a href="https://dashboard.paystack.com" target="_blank" rel="noopener" className="settings-link">Paystack Dashboard ↗</a>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: ok ? 'var(--badge-published)' : 'var(--badge-failed)', color: ok ? 'var(--badge-published-text)' : 'var(--badge-failed-text)' }}>
        {ok ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

function EnvRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
      <code style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--ink)' }}>{value}</code>
    </div>
  );
}

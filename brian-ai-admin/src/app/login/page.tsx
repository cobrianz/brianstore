'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Sign-in failed.'); return; }
      window.__adminCsrf = data.csrfToken;
      router.push('/dashboard');
    } catch { setError('Could not connect. Check your connection.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1.2" fill="currentColor" />
            </svg>
          </div>
          <div className="login-logo-text">Brian</div>
          <div className="login-logo-sub">Store Admin</div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to manage your store</p>
        </div>

        {/* Form */}
        <form className="login-form-fields" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <div className="login-input-wrap">
              <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" />
              </svg>
              <input id="email" name="email" type="email" autoComplete="username" required autoFocus placeholder="you@example.com" />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
              {error}
            </div>
          )}

          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? <><span className="login-spinner" /> Signing in…</> : <>Sign in <span>→</span></>}
          </button>
        </form>

        <p className="login-hint">Restricted to authorised administrators only.</p>
      </div>
    </div>
  );
}

declare global { interface Window { __adminCsrf?: string; } }

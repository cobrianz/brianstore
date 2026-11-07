'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ToastRegion, { toast } from './Toast';
import { useApi } from '@/hooks/useApi';

const NAV = [
  { href: '/dashboard',   label: 'Overview',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { href: '/products',    label: 'Products',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg> },
  { href: '/guides',      label: 'Free guides',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { href: '/orders',      label: 'Orders',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.5L22 8H6"/><circle cx="10" cy="20" r="1.2"/><circle cx="19" cy="20" r="1.2"/></svg> },
  { href: '/subscribers', label: 'Subscribers',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/files',       label: 'File library', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  { href: '/content',     label: 'Site content', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
  { href: '/settings',    label: 'Settings',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="topbar-time">{time}</span>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { api, setCsrf } = useApi();
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState('Administrator');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    api('/api/auth/me').then(d => {
      setCsrf(d.csrfToken);
      setEmail(d.user?.email || 'Administrator');
      window.__adminCsrf = d.csrfToken;
    }).catch(() => router.push('/login'));
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  async function logout() {
    try {
      await api('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (e: any) { toast(e.message, true); }
  }

  // Search — navigate to matching section
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const match = NAV.find(n => n.label.toLowerCase().includes(q));
    if (match) { router.push(match.href); setSearch(''); }
  }

  const section = NAV.find(n => pathname.startsWith(n.href));
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">B</div>
        <div>
          <span className="logo-name">Brian</span>
          <span className="logo-sub">Store Admin</span>
        </div>
      </div>
      <p className="sidebar-section">Workspace</p>
      <nav className="sidebar-nav" aria-label="Admin navigation">
        {NAV.map(n => (
          <Link
            key={n.href}
            href={n.href}
            className={`nav-item${pathname.startsWith(n.href) ? ' active' : ''}`}
            aria-current={pathname.startsWith(n.href) ? 'page' : undefined}
          >
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="avatar">{email.slice(0, 2).toUpperCase()}</div>
        <div className="sidebar-user">
          <strong title={email}>{email}</strong>
          <small>Administrator</small>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar"><SidebarContent /></aside>

      {mobileOpen && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        />
      )}
      <aside id="admin-mobile-navigation" className={`sidebar sidebar-mobile${mobileOpen ? ' open' : ''}`}><SidebarContent /></aside>

      <div className="main-area">
        <header className="topbar">
          {/* Left: hamburger + page title */}
          <div className="topbar-left">
            <button
              className="hamburger"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="admin-mobile-navigation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="topbar-title-block">
              <h1 className="topbar-title">{section?.label || 'Admin'}</h1>
            </div>
          </div>

          {/* Center: search */}
          <form className={`topbar-search${searchFocused ? ' focused' : ''}`} onSubmit={handleSearch} role="search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              placeholder="Search sections…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Search admin sections"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </form>

          {/* Right: clock, date, storefront link, avatar */}
          <div className="topbar-right">
            <div className="topbar-datetime">
              <LiveClock />
              <span className="topbar-date">{today}</span>
            </div>

            <div className="topbar-divider" />

            <a href="http://localhost:3000" target="_blank" rel="noopener" className="topbar-store-btn" title="View storefront">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              <span>Storefront</span>
            </a>

            <div className="topbar-divider" />

            <div className="topbar-avatar" title={email}>
              {email.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="content-area">{children}</div>
      </div>

      <ToastRegion />
    </div>
  );
}

declare global { interface Window { __adminCsrf?: string; } }

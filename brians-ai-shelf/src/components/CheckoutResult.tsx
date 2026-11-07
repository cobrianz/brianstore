'use client';

import { useEffect } from 'react';

interface Link { name: string; url: string; }

interface Props {
  title: string;
  message: string;
  links: Link[];
  success?: boolean;
}

export default function CheckoutResult({ title, message, links, success }: Props) {
  // Clear cart and checkout email from localStorage on successful payment
  useEffect(() => {
    if (success) {
      localStorage.removeItem('brianShelfBag');
      localStorage.removeItem('brianCheckoutEmail');
    }
  }, [success]);

  return (
    <main style={{
      minHeight: '100vh',
      background: '#f6f4ed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: 'min(640px,100%)',
        border: '1px solid #e4e4d9',
        borderRadius: 16,
        background: '#fffef9',
        padding: 'clamp(24px,5vw,48px)',
        boxShadow: '0 12px 40px rgba(0,0,0,.07)',
      }}>
        {/* Status indicator */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 999,
          background: success ? '#d1fae5' : '#fef3c7',
          color: success ? '#065f46' : '#92400e',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
          textTransform: 'uppercase', marginBottom: 20,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: success ? '#22c55e' : '#f59e0b',
            display: 'inline-block',
          }} />
          {success ? 'Payment verified' : 'Checkout update'}
        </div>

        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d9855c', margin: '0 0 6px' }}>
          BRIAN CHERUIYOT · AI DOWNLOADS
        </p>
        <h1 style={{ fontSize: 'clamp(24px,5vw,38px)', lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 12px', color: '#1e251f' }}>
          {title}
        </h1>
        <p style={{ color: '#62695f', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>{message}</p>

        {links.length > 0 && (
          <>
            <div style={{ borderTop: '1px solid #e4e4d9', paddingTop: 20, marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1e251f', margin: '0 0 12px' }}>
                Your download links — valid for 30 days
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {links.map(({ name, url }) => (
                  <li key={url}>
                    <a href={url} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 12, padding: '13px 16px', background: '#286b4b', color: '#fff',
                      borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700,
                    }}>
                      <span>Download {name}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M5 17v3h14v-3"/>
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p style={{ fontSize: 11, color: '#73786e', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              These are private links. Save them or check your email.
            </p>
          </>
        )}

        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: '#286b4b', fontSize: 12, fontWeight: 700, textDecoration: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Return to Brian&apos;s site
        </a>
      </div>
    </main>
  );
}

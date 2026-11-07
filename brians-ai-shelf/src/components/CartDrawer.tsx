'use client';

import { useState, useEffect } from 'react';
import type { LiveProduct } from './StorePage';

interface Props {
  bag: string[];
  products: LiveProduct[];
  isOpen: boolean;
  paymentReady: boolean;
  paymentReason: string;
  onRemove: (i: number) => void;
  onClose: () => void;
}

export default function CartDrawer({ bag, products, isOpen, paymentReady, paymentReason, onRemove, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setEmail(localStorage.getItem('brianCheckoutEmail') || ''); }, []);
  useEffect(() => { localStorage.setItem('brianCheckoutEmail', email); }, [email]);

  // Match bag items to live products (by id or slug)
  const cartItems = bag.map(bagId => products.find(p => p.id === bagId || p.slug === bagId)).filter(Boolean) as LiveProduct[];
  const total = cartItems.reduce((s, p) => s + p.price, 0);

  async function pay() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg('Enter a valid email address.'); setIsError(true); return;
    }
    setBusy(true); setMsg('Creating a secure transaction…'); setIsError(false);
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, items: bag }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Checkout could not be started.');
      if (!data.authorizationUrl) throw new Error('Paystack did not return a checkout link.');
      window.location.assign(data.authorizationUrl);
    } catch (err: any) {
      setMsg(err.message); setIsError(true); setBusy(false);
    }
  }

  return (
    <aside className={`cart-drawer${isOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="cartHeading">
      <div className="drawer-head">
        <h2 id="cartHeading">Your cart</h2>
        <button className="close-btn" aria-label="Close cart" onClick={onClose}>×</button>
      </div>

      <div className="cart-list">
        {cartItems.length > 0 ? cartItems.map((p, i) => (
          <div className="cart-row" key={`${p.id}-${i}`}>
            <img src={p.image} alt="" />
            <div>
              <h3>{p.title}</h3>
              <small>{p.format} · ${p.price.toFixed(2)}</small>
            </div>
            <button className="remove-item" onClick={() => onRemove(i)}>Remove</button>
          </div>
        )) : (
          <div className="cart-empty">Your bag is empty.<br />Pick a little spark from the shop.</div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-bottom">
          <div className="subtotal"><span>Subtotal · USD</span><span>${total.toFixed(2)}</span></div>
          <p>Files are delivered from Cloudflare after Paystack confirms payment. Links expire after 30 days.</p>
          <label className="checkout-email" htmlFor="checkoutEmail">
            Email for your receipt and downloads
            <input type="email" id="checkoutEmail" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <p className={`checkout-message${isError ? ' error' : ''}`}>
            {msg || (paymentReady ? 'Ready for secure checkout.' : paymentReason)}
          </p>
          <button className="checkout-btn" disabled={!paymentReady || busy} onClick={pay}>
            {busy ? 'Connecting to Paystack…' : 'Pay securely with Paystack →'}
          </button>
        </div>
      )}
    </aside>
  );
}

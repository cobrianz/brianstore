'use client';

import { useState, useCallback, useEffect } from 'react';

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
  catch { return fallback; }
}

export function useStore() {
  const [bag, setBag] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<unknown>(null);
  const [toast, setToast] = useState('');
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentReason, setPaymentReason] = useState('Checking Paystack setup…');

  // Hydrate from localStorage after mount
  useEffect(() => {
    setBag(loadLS('brianShelfBag', []));
    setSaved(loadLS('brianShelfSaved', []));
  }, []);

  useEffect(() => { localStorage.setItem('brianShelfBag', JSON.stringify(bag)); }, [bag]);
  useEffect(() => { localStorage.setItem('brianShelfSaved', JSON.stringify(saved)); }, [saved]);

  useEffect(() => {
    fetch('/api/payment-status')
      .then((r) => r.json())
      .then((s) => { setPaymentReady(!!s.enabled); setPaymentReason(s.reason || 'Paystack is configured.'); })
      .catch(() => { setPaymentReady(false); setPaymentReason('Payment service unavailable in this preview.'); });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }, []);

  const addToBag = useCallback((id: string) => {
    setBag((p) => [...p, id]);
    setCartOpen(true);
    document.body.style.overflow = 'hidden';
    showToast('Added to cart. Review your items below.');
  }, [showToast]);

  const removeFromBag = useCallback((index: number) => {
    setBag((p) => p.filter((_, i) => i !== index));
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSaved((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }, []);

  const openCart = useCallback(() => { setCartOpen(true); document.body.style.overflow = 'hidden'; }, []);
  const closeCart = useCallback(() => { setCartOpen(false); document.body.style.overflow = ''; }, []);

  const openProduct = useCallback((product: unknown) => { setActiveProduct(product); document.body.style.overflow = 'hidden'; }, []);
  const closeProduct = useCallback(() => { setActiveProduct(null); document.body.style.overflow = ''; }, []);

  const closeAll = useCallback(() => {
    setCartOpen(false);
    setActiveProduct(null);
    document.body.style.overflow = '';
  }, []);

  return {
    bag, saved, cartOpen, activeProduct, toast, paymentReady, paymentReason,
    addToBag, removeFromBag, toggleSaved,
    openCart, closeCart, openProduct, closeProduct, closeAll, showToast,
  };
}

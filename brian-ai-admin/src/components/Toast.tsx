'use client';
import { useState, useCallback, useEffect } from 'react';

interface ToastItem { id: number; message: string; error: boolean; }

let addToast: (msg: string, error?: boolean) => void = () => {};
export const toast = (msg: string, error = false) => addToast(msg, error);

export default function ToastRegion() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const add = useCallback((message: string, error = false) => {
    const id = Date.now();
    setItems(p => [...p, { id, message, error }]);
    setTimeout(() => setItems(p => p.filter(x => x.id !== id)), 4000);
  }, []);
  useEffect(() => { addToast = add; }, [add]);
  return (
    <div className="toast-region">
      {items.map(t => (
        <div key={t.id} className={`toast${t.error ? ' toast-error' : ''}`}>{t.message}</div>
      ))}
    </div>
  );
}

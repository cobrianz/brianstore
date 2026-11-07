'use client';
import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useApi() {
  const csrfRef = useRef<string>('');
  const router = useRouter();

  const setCsrf = useCallback((token: string) => { csrfRef.current = token; }, []);

  const api = useCallback(async (path: string, opts: RequestInit & { skipCsrf?: boolean } = {}) => {
    const headers = new Headers((opts.headers as Record<string,string>) || {});
    if (csrfRef.current && opts.method && opts.method !== 'GET' && !opts.skipCsrf) {
      headers.set('x-csrf-token', csrfRef.current);
    }
    if (opts.body && !(opts.body instanceof FormData) && typeof opts.body !== 'string') {
      headers.set('Content-Type', 'application/json');
      opts = { ...opts, body: JSON.stringify(opts.body) };
    }
    let res: Response;
    try {
      res = await fetch(path, { credentials: 'same-origin', ...opts, headers });
    } catch {
      throw new Error('Could not connect to the store API.');
    }
    if (res.status === 401) { router.push('/login'); throw new Error('Session expired.'); }
    if (!res.ok) {
      let msg = `Request failed (${res.status}).`;
      try { const d = await res.json(); msg = d.error || d.message || msg; } catch {}
      throw new Error(msg);
    }
    if (res.status === 204) return null;
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res;
  }, [router]);

  return { api, setCsrf, csrfRef };
}

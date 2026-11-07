import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getCollections } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const col = await getCollections();
    const rows = await col.subscribers.find({}).sort({ subscribedAt: -1 }).limit(10000).toArray();
    const quote = (v: unknown) => {
      const raw = String(v ?? '');
      const safe = /^[\s\u0000-\u001f]*[=+@-]/.test(raw) ? `'${raw}` : raw;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const csv = [
      'email,status,source,subscribedAt',
      ...rows.map(r => [r.email, r.status || 'subscribed', r.source, r.subscribedAt?.toISOString?.() || r.subscribedAt].map(quote).join(',')),
    ].join('\r\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="brian-subscribers.csv"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Export failed.' }, { status: 500 });
  }
}

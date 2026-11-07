import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getCollections, serialize } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const col = await getCollections();
    const rows = await col.subscribers.find({}).sort({ subscribedAt: -1 }).limit(5000).toArray();
    return NextResponse.json(rows.map(serialize));
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Subscribers could not be loaded.' }, { status: 500 });
  }
}

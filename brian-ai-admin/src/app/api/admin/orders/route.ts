import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getCollections, serialize, amountCents } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const col = await getCollections();
    const rows = await col.orders.find({}).sort({ createdAt: -1 }).limit(500).toArray();
    return NextResponse.json(rows.map(o => ({ ...serialize(o), amountCents: amountCents(o) })));
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Orders could not be loaded.' }, { status: 500 });
  }
}

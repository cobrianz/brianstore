import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getCollections, serialize } from '@/lib/db';
import { productInput } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const col = await getCollections();
    const rows = await col.products.find({}).sort({ updatedAt: -1 }).limit(500).toArray();
    return NextResponse.json(rows.map(serialize));
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Products could not be loaded.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const body = await req.json().catch(() => ({}));
    const col = await getCollections();
    const product = { ...productInput(body), createdAt: new Date() };
    const result = await col.products.insertOne(product);
    return NextResponse.json(serialize({ _id: result.insertedId, ...product }), { status: 201 });
  } catch (e: any) {
    if (e instanceof Response) return e;
    if (e?.code === 11000) return NextResponse.json({ error: 'That product slug is already in use.' }, { status: 409 });
    if (/required|slug|price|status/i.test(e?.message)) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error('Product create error:', e);
    return NextResponse.json({ error: 'Product could not be created.' }, { status: 500 });
  }
}

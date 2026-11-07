import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getCollections, serialize } from '@/lib/db';
import { guideInput } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const col = await getCollections();
    const rows = await col.guides.find({}).sort({ updatedAt: -1 }).limit(500).toArray();
    return NextResponse.json(rows.map(serialize));
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Guides could not be loaded.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const body = await req.json().catch(() => ({}));
    const col = await getCollections();
    const guide = { ...guideInput(body), createdAt: new Date() };
    const result = await col.guides.insertOne(guide);
    return NextResponse.json(serialize({ _id: result.insertedId, ...guide }), { status: 201 });
  } catch (e: any) {
    if (e instanceof Response) return e;
    if (e?.code === 11000) return NextResponse.json({ error: 'That guide slug is already in use.' }, { status: 409 });
    if (/required|slug|status/i.test(e?.message)) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: 'Guide could not be created.' }, { status: 500 });
  }
}

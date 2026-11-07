import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getCollections, serialize, toObjectId } from '@/lib/db';
import { guideInput } from '@/lib/utils';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuthAndCsrf(req);
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: 'Invalid guide ID.' }, { status: 400 });
    const col = await getCollections();
    const old = await col.guides.findOne({ _id: oid });
    if (!old) return NextResponse.json({ error: 'Guide not found.' }, { status: 404 });
    const body = await req.json().catch(() => ({}));
    const update = guideInput(body, old);
    await col.guides.updateOne({ _id: oid }, { $set: update });
    return NextResponse.json(serialize({ ...old, ...update, _id: oid }));
  } catch (e: any) {
    if (e instanceof Response) return e;
    if (e?.code === 11000) return NextResponse.json({ error: 'That slug is already in use.' }, { status: 409 });
    return NextResponse.json({ error: 'Guide could not be updated.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuthAndCsrf(req);
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: 'Invalid guide ID.' }, { status: 400 });
    const col = await getCollections();
    const result = await col.guides.deleteOne({ _id: oid });
    if (!result.deletedCount) return NextResponse.json({ error: 'Guide not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Guide could not be deleted.' }, { status: 500 });
  }
}

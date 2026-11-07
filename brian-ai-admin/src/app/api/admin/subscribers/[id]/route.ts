import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getCollections, toObjectId } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuthAndCsrf(req);
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: 'Invalid subscriber ID.' }, { status: 400 });
    const col = await getCollections();
    const result = await col.subscribers.deleteOne({ _id: oid });
    if (!result.deletedCount) return NextResponse.json({ error: 'Subscriber not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Subscriber could not be deleted.' }, { status: 500 });
  }
}

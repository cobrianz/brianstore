import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getCollections, toObjectId } from '@/lib/db';
import { cleanText } from '@/lib/utils';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuthAndCsrf(req);
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: 'Invalid order ID.' }, { status: 400 });
    const body = await req.json().catch(() => ({}));
    const adminNote = cleanText(body.adminNote, 3000);
    const col = await getCollections();
    const result = await col.orders.updateOne(
      { _id: oid },
      { $set: { adminNote, adminNoteUpdatedAt: new Date() } }
    );
    if (!result.matchedCount) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, adminNote });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Note could not be saved.' }, { status: 500 });
  }
}

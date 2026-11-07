import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { cleanText } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthAndCsrf(req);
    const body = await req.json().catch(() => ({}));
    const current = String(body.currentPassword || '');
    const next = String(body.newPassword || '');

    if (!current || !next) {
      return NextResponse.json({ error: 'Both current and new password are required.' }, { status: 400 });
    }
    if (next.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    const db = await getDb();
    const admin = await db.collection('admins').findOne({ email: session.user!.email });
    if (!admin) return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });

    const ok = await bcrypt.compare(current, admin.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });

    const newHash = await bcrypt.hash(next, 12);
    await db.collection('admins').updateOne(
      { email: session.user!.email },
      { $set: { passwordHash: newHash, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true, message: 'Password updated successfully.' });
  } catch (e: any) {
    if (e instanceof Response) return e;
    console.error('Password change failed:', e);
    return NextResponse.json({ error: 'Password could not be updated.' }, { status: 500 });
  }
}

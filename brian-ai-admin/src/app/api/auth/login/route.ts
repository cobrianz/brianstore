import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession, newCsrfToken } from '@/lib/auth';
import { cleanText } from '@/lib/utils';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = cleanText(body.email, 254).toLowerCase();
  const password = String(body.password || '');

  if (!email || !password || password.length > 256) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

  try {
    let verified = false;

    // Try MongoDB first
    try {
      const db = await getDb();
      const admin = await db.collection('admins').findOne({ email });
      if (admin?.passwordHash) {
        verified = email === adminEmail && await bcrypt.compare(password, admin.passwordHash);
        if (verified) {
          await db.collection('admins').updateOne(
            { email },
            { $set: { lastLoginAt: new Date() } }
          );
        }
      }
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, falling back to env hash:', dbErr.message?.slice(0, 80));
      // Fallback: use env hash if set
      const envHash = process.env.ADMIN_PASSWORD_HASH || '';
      if (envHash && email === adminEmail) {
        verified = await bcrypt.compare(password, envHash);
      }
    }

    if (!verified) {
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }

    const session = await getSession();
    session.user = { email };
    session.csrfToken = newCsrfToken();
    await session.save();

    return NextResponse.json({ user: session.user, csrfToken: session.csrfToken });
  } catch (e) {
    console.error('Login failed:', e);
    return NextResponse.json({ error: 'Sign-in is temporarily unavailable.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSession, newCsrfToken } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  if (!session.csrfToken) {
    session.csrfToken = newCsrfToken();
    await session.save();
  }
  return NextResponse.json({ user: session.user, csrfToken: session.csrfToken });
}

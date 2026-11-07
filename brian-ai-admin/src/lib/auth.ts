import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';

export interface SessionData {
  user?: { email: string };
  csrfToken?: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'brian-admin',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict' as const,
    maxAge: 8 * 60 * 60,
    path: '/',
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAuth(): Promise<IronSession<SessionData>> {
  const session = await getSession();
  if (!session.user) {
    throw new Response(JSON.stringify({ error: 'Sign in to continue.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}

export async function requireAuthAndCsrf(req: NextRequest): Promise<IronSession<SessionData>> {
  const session = await requireAuth();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const token = req.headers.get('x-csrf-token');
    if (!token || token !== session.csrfToken) {
      throw new Response(JSON.stringify({ error: 'Your session token expired. Refresh and try again.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  return session;
}

export function newCsrfToken() {
  return randomBytes(32).toString('hex');
}

export function authError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

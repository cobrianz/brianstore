import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { r2Ready } from '@/lib/r2';

export async function GET() {
  let dbOk = false;
  try { await (await getDb()).command({ ping: 1 }); dbOk = true; } catch {}
  return NextResponse.json({ ok: true, database: dbOk, storageConfigured: r2Ready });
}

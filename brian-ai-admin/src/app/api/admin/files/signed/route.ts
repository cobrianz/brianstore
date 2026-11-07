import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getSignedFileUrl } from '@/lib/r2';

export async function GET(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const key = req.nextUrl.searchParams.get('key') || '';
    if (!key) return NextResponse.json({ error: 'File key is required.' }, { status: 400 });
    const download = req.nextUrl.searchParams.get('download') === 'true';
    const url = await getSignedFileUrl(key, download);
    return NextResponse.json({ url });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Signed URL could not be created.' }, { status: 502 });
  }
}

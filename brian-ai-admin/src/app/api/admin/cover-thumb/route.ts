import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getSignedFileUrl, publicAssetUrl, storagePrefix } from '@/lib/r2';

export async function GET(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const key = req.nextUrl.searchParams.get('key') || '';
    if (!key) return NextResponse.json({ error: 'Key required.' }, { status: 400 });
    const isPublic = key.startsWith(storagePrefix('public'));
    const url = isPublic ? publicAssetUrl(key) : await getSignedFileUrl(key);
    return NextResponse.redirect(url);
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Could not get image.' }, { status: 502 });
  }
}

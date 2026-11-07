import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { listR2Objects, deleteFromR2, getSignedFileUrl, publicAssetUrl, storagePrefix } from '@/lib/r2';

export async function GET(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const { contents, truncated } = await listR2Objects();
    const objects = await Promise.all(contents.map(async item => {
      const isPublic = Boolean(item.Key?.startsWith(storagePrefix('public')));
      return {
        key: item.Key,
        size: item.Size || 0,
        lastModified: item.LastModified,
        public: isPublic,
        url: isPublic ? publicAssetUrl(item.Key!) : await getSignedFileUrl(item.Key!),
      };
    }));
    return NextResponse.json({ objects, truncated });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e.message || 'R2 list failed.' }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const body = await req.json().catch(() => ({}));
    const key = String(body.key || '').trim();
    if (!key) return NextResponse.json({ error: 'File key is required.' }, { status: 400 });
    await deleteFromR2(key);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e.message || 'File could not be deleted.' }, { status: 502 });
  }
}

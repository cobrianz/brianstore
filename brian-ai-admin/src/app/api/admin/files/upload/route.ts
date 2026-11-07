import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { requireAuthAndCsrf } from '@/lib/auth';
import { uploadToR2, storagePrefix, publicAssetUrl, getSignedFileUrl, r2Ready } from '@/lib/r2';
import { slugify, fileNameSafe } from '@/lib/utils';

const ALLOWED_EXT = new Set(['.pdf','.epub','.zip','.docx','.txt','.md','.png','.jpg','.jpeg','.webp','.gif','.mp3','.mp4']);

export async function POST(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    if (!r2Ready) return NextResponse.json({ error: 'R2 storage is not configured.' }, { status: 503 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const kind = formData.get('kind') === 'public' ? 'public' : 'private';

    if (!file || file.size === 0) return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 });
    if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: 'Files must be 100 MB or smaller.' }, { status: 413 });

    const originalName = fileNameSafe(file.name);
    const ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return NextResponse.json({ error: 'File type not allowed.' }, { status: 415 });

    const safeName = slugify(path.basename(originalName, ext)) || 'file';
    const key = `${storagePrefix(kind)}${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToR2(key, buffer, file.type || 'application/octet-stream', kind);

    const url = kind === 'public' ? publicAssetUrl(key) : await getSignedFileUrl(key, true);
    return NextResponse.json({ key, name: originalName, size: file.size, url }, { status: 201 });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e.message || 'Upload failed.' }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET } from '@/lib/r2';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key || !r2 || !R2_BUCKET) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
    const res = await r2.send(cmd);
    const body = res.Body;
    if (!body) return new NextResponse(null, { status: 404 });

    const chunks: Uint8Array[] = [];
    // @ts-ignore — R2 stream
    for await (const chunk of body) { chunks.push(chunk); }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': res.ContentType || 'image/webp',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (e: any) {
    // Fall through to 404 — image not found or R2 error
    return new NextResponse(null, { status: 404 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { findOrder } from '@/lib/orders';
import { getStoreCollections } from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/r2';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; productId: string }> }
) {
  const { token, productId } = await params;

  // Validate order
  const order = await findOrder(
    // find by token — scan orders with this token
    token as any  // we'll handle this below
  );

  // findOrder expects a reference — we need to find by token instead
  const { getStoreCollections: getCol } = await import('@/lib/db');
  const col = await getCol();
  const orderDoc = await col.orders.findOne({
    downloadToken: token,
    status: 'paid',
    downloadExpiresAt: { $gt: new Date() },
  });

  if (!orderDoc) {
    return new NextResponse(
      'This download link is unavailable or has expired. Contact Brian if you need help.',
      { status: 404 }
    );
  }

  const items: string[] = orderDoc.items || [];
  if (!items.includes(productId)) {
    return new NextResponse('This product is not part of your order.', { status: 403 });
  }

  // Fetch product from MongoDB to get the R2 fileKey
  const product = await col.products.findOne({
    $or: [{ slug: productId }, { _id: productId as any }],
    status: 'published',
  });

  if (!product || !product.fileKey) {
    return new NextResponse('Product file is not available.', { status: 404 });
  }

  try {
    const signedUrl = await getSignedDownloadUrl(product.fileKey, product.fileName || `${product.slug}.pdf`);
    // Redirect to R2 signed URL — browser downloads directly from Cloudflare
    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch (err: any) {
    console.error('R2 signed URL failed:', err.message);
    return new NextResponse('Download is temporarily unavailable. Please try again.', { status: 502 });
  }
}

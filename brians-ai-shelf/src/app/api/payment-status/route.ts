import { NextResponse } from 'next/server';
import { checkoutEnabled, validSecret } from '@/lib/paystack';
import { getMailer } from '@/lib/mailer';
import { getStoreCollections } from '@/lib/db';
import { r2, R2_BUCKET } from '@/lib/r2';

async function productsReady(): Promise<boolean> {
  try {
    const col = await getStoreCollections();
    const count = await col.products.countDocuments({ status: 'published', fileKey: { $exists: true, $ne: '' } });
    return count > 0;
  } catch { return false; }
}

export async function GET() {
  const mailerOk = !!getMailer();
  const r2Ok = !!(r2 && R2_BUCKET);
  const paystackOk = checkoutEnabled();
  const hasProducts = await productsReady();
  const enabled = paystackOk && r2Ok && hasProducts;

  let reason = '';
  if (!validSecret()) reason = 'Paystack credentials not configured.';
  else if (!r2Ok) reason = 'R2 storage not configured — needed for downloads.';
  else if (!hasProducts) reason = 'No published products with download files found.';

  return NextResponse.json({ enabled, reason, currency: 'USD' });
}

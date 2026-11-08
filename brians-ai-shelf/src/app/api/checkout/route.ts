import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { emailValid, getMailer, publicBaseUrl } from '@/lib/mailer';
import { checkoutEnabled, paystackRequest } from '@/lib/paystack';
import { insertOrder, updateOrder } from '@/lib/orders';
import { getStoreCollections } from '@/lib/db';
import { r2, R2_BUCKET } from '@/lib/r2';

export async function POST(req: NextRequest) {
  if (!checkoutEnabled()) {
    return NextResponse.json({ error: 'Checkout is not enabled. Configure Paystack credentials.' }, { status: 503 });
  }
  if (!r2 || !R2_BUCKET) {
    return NextResponse.json({ error: 'File storage is not configured.' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  if (!emailValid(email)) {
    return NextResponse.json({ error: 'Enter the email for your receipt and downloads.' }, { status: 400 });
  }

  const requestedIds: unknown = body.items;
  if (!Array.isArray(requestedIds) || requestedIds.length < 1 || requestedIds.length > 20) {
    return NextResponse.json({ error: 'Choose one or more valid products.' }, { status: 400 });
  }

  const ids = [...new Set(requestedIds as string[])];

  // Fetch products from MongoDB by slug/id
  const col = await getStoreCollections();
  const products = await col.products.find({
    $or: [
      { slug: { $in: ids } },
      { _id: { $in: ids.filter(id => id.match(/^[a-f0-9]{24}$/)).map(id => { try { const { ObjectId } = require('mongodb'); return new ObjectId(id); } catch { return null; } }).filter(Boolean) } },
    ],
    status: 'published',
  }).toArray();

  // Also try matching by the old string IDs (writing, guide, etc.) via slug
  const matchedProducts = products.length > 0 ? products :
    await col.products.find({ slug: { $in: ids }, status: 'published' }).toArray();

  if (matchedProducts.length === 0) {
    return NextResponse.json({ error: 'No valid published products found for the selected items.' }, { status: 400 });
  }

  const amount = matchedProducts.reduce((sum, p) => sum + (Number(p.priceCents) || 0), 0);
  const itemSlugs = matchedProducts.map(p => p.slug);
  const reference = `bri_${randomBytes(14).toString('hex')}`;
  const baseUrl = publicBaseUrl();

  await insertOrder({
    reference,
    email,
    items: itemSlugs,
    itemTitles: matchedProducts.map(p => p.title),
    amount,
    currency: 'USD',
    status: 'initializing',
    createdAt: new Date(),
  });

  try {
    const data = await paystackRequest('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email, amount, currency: 'USD', reference,
        callback_url: `${baseUrl}/payment/callback`,
        channels: ['card', 'mobile_money'],
        metadata: { product_slugs: itemSlugs },
      }),
    });

    if (data.reference !== reference) throw new Error('Reference mismatch from Paystack.');
    const checkoutUrl = new URL(data.authorization_url);
    if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== 'checkout.paystack.com') {
      throw new Error('Unexpected checkout URL.');
    }

    await updateOrder(reference, { status: 'pending', accessCode: data.access_code });
    return NextResponse.json({ authorizationUrl: checkoutUrl.toString(), reference });
  } catch (err: any) {
    await updateOrder(reference, { status: 'initialization_failed' });
    console.error('Paystack init failed:', err.message);
    return NextResponse.json({ error: 'Paystack could not start checkout. Try again.' }, { status: 502 });
  }
}

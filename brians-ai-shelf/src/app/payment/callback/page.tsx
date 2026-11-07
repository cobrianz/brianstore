import { randomBytes } from 'node:crypto';
import { getStoreCollections } from '@/lib/db';
import { findOrder, updateOrder } from '@/lib/orders';
import { getMailer, publicBaseUrl } from '@/lib/mailer';
import { checkoutEnabled, paystackRequest } from '@/lib/paystack';
import { getSignedDownloadUrl } from '@/lib/r2';
import CheckoutResult from '@/components/CheckoutResult';

interface DownloadLink { name: string; url: string; }

async function verifyAndFulfill(reference: string): Promise<{ order: any; links: DownloadLink[] }> {
  const order = await findOrder(reference);
  if (!order) throw new Error('Order not found. Contact Brian with your Paystack reference.');

  // Already fulfilled — regenerate signed links
  if (order.status === 'paid' && order.downloadToken) {
    const links = await buildLinks(order);
    return { order, links };
  }

  if (!['pending', 'initializing'].includes(order.status)) {
    throw new Error('This order cannot be fulfilled. Contact Brian if you were charged.');
  }

  // Verify with Paystack
  const data = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
  if (
    data.reference !== reference ||
    data.status !== 'success' ||
    data.amount !== order.amount ||
    data.currency !== order.currency
  ) {
    throw new Error('Payment could not be verified. Contact Brian with your payment reference if your account was charged.');
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await updateOrder(reference, {
    status: 'paid',
    paidAt: new Date(),
    downloadToken: token,
    downloadExpiresAt: expiresAt,
  });

  const updatedOrder = { ...order, status: 'paid', downloadToken: token, downloadExpiresAt: expiresAt };
  const links = await buildLinks(updatedOrder);

  // Email receipt
  const transport = getMailer();
  if (transport) {
    try {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER;
      await transport.sendMail({
        from: `Brian's AI Downloads <${from}>`,
        to: order.email,
        subject: 'Your Brian Cheruiyot digital downloads',
        text: `Thanks for your purchase!\n\nYour private download links (valid 30 days):\n\n${links.map(x => `${x.name}:\n${x.url}`).join('\n\n')}\n\nIf you didn't make this purchase, reply to this email.`,
        html: `<p>Thanks for your purchase!</p><p>Your private download links (valid 30 days):</p><ul>${links.map(x => `<li><a href="${x.url}">${x.name}</a></li>`).join('')}</ul><p>If you didn't make this purchase, reply to this email.</p>`,
      });
      await updateOrder(reference, { receiptSentAt: new Date() });
    } catch (e) { console.error('Receipt email failed:', e); }
  }

  return { order: updatedOrder, links };
}

async function buildLinks(order: any): Promise<DownloadLink[]> {
  const base = publicBaseUrl();
  const token = order.downloadToken;

  // Build download URLs pointing to our /download route which signs R2 URLs on demand
  const col = await getStoreCollections();
  const products = await col.products.find({ slug: { $in: order.items } }).toArray();

  return order.items.map((slug: string) => {
    const product = products.find(p => p.slug === slug);
    return {
      name: product?.title ?? slug,
      url: `${base}/download/${token}/${slug}`,
    };
  });
}

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  if (!reference || reference.length > 80) {
    return <CheckoutResult title="Payment reference missing" message="Return to the shop and try again." links={[]} />;
  }
  if (!checkoutEnabled()) {
    return <CheckoutResult title="Checkout not configured" message="The site cannot verify this payment. Contact Brian with your reference." links={[]} />;
  }

  try {
    const { links } = await verifyAndFulfill(reference);
    return (
      <CheckoutResult
        title="Payment verified — thank you!"
        message="Your payment is confirmed. Download links below — they expire in 30 days and have also been emailed to you."
        links={links}
        success
      />
    );
  } catch (err: any) {
    return <CheckoutResult title="Payment not verified yet" message={err.message} links={[]} />;
  }
}

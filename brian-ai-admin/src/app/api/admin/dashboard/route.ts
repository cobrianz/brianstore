import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getCollections, serialize, amountCents } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const col = await getCollections();
    const [productsCount, guidesCount, ordersCount, subscribersCount, revenueRows, recent] = await Promise.all([
      col.products.countDocuments(),
      col.guides.countDocuments(),
      col.orders.countDocuments(),
      col.subscribers.countDocuments({ status: { $ne: 'unsubscribed' } }),
      col.orders.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, revenueCents: { $sum: { $ifNull: ['$amountCents', { $ifNull: ['$amount', 0] }] } } } },
      ]).toArray(),
      col.orders.find({}).sort({ createdAt: -1 }).limit(8).toArray(),
    ]);
    return NextResponse.json({
      productsCount, guidesCount, ordersCount, subscribersCount,
      revenueCents: revenueRows[0]?.revenueCents || 0,
      recentOrders: recent.map(o => ({ ...serialize(o), amountCents: amountCents(o) })),
    });
  } catch (e: any) {
    if (e instanceof Response) return e;
    console.error('Dashboard error:', e);
    return NextResponse.json({ error: 'Dashboard could not be loaded.' }, { status: 500 });
  }
}

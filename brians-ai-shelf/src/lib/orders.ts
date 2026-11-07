import { getStoreCollections } from './db';

export interface Order {
  reference: string;
  email: string;
  items: string[];       // product slugs/ids
  itemTitles?: string[]; // resolved titles
  amount: number;        // cents
  currency: string;
  status: string;
  createdAt: Date | string;
  paidAt?: Date | string;
  downloadToken?: string;
  downloadExpiresAt?: Date | string;
  receiptSentAt?: Date | string;
  accessCode?: string;
  adminNote?: string;
}

export async function loadOrders(): Promise<Order[]> {
  const col = await getStoreCollections();
  const rows = await col.orders.find({}).sort({ createdAt: -1 }).toArray();
  return rows.map(({ _id, ...r }) => r as unknown as Order);
}

export async function findOrder(reference: string): Promise<Order | null> {
  const col = await getStoreCollections();
  const doc = await col.orders.findOne({ reference });
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest as unknown as Order;
}

export async function insertOrder(order: Order): Promise<void> {
  const col = await getStoreCollections();
  await col.orders.insertOne({ ...order, createdAt: new Date() });
}

export async function updateOrder(reference: string, update: Partial<Order>): Promise<void> {
  const col = await getStoreCollections();
  await col.orders.updateOne({ reference }, { $set: update });
}

export async function saveSubscriber(email: string): Promise<'new' | 'exists'> {
  const col = await getStoreCollections();
  const existing = await col.subscribers.findOne({ email });
  if (existing) return 'exists';
  await col.subscribers.insertOne({
    email,
    subscribedAt: new Date(),
    status: 'subscribed',
    source: 'storefront',
  });
  return 'new';
}

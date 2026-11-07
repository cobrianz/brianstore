import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || 'brian_ai_store_admin';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
  var _mongoConnecting: Promise<MongoClient> | undefined;
}

async function createClient(): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 15000,
  });
  await client.connect();
  return client;
}

async function getClient(): Promise<MongoClient> {
  // Reuse healthy connection
  if (global._mongoClient) {
    try {
      await global._mongoClient.db('admin').command({ ping: 1 });
      return global._mongoClient;
    } catch {
      try { await global._mongoClient.close(); } catch {}
      global._mongoClient = undefined;
      global._mongoConnecting = undefined;
    }
  }

  // Deduplicate concurrent connection attempts
  if (!global._mongoConnecting) {
    global._mongoConnecting = createClient().then(c => {
      global._mongoClient = c;
      global._mongoConnecting = undefined;
      return c;
    }).catch(e => {
      global._mongoConnecting = undefined;
      throw e;
    });
  }

  return global._mongoConnecting;
}

export async function getDb() {
  const client = await getClient();
  return client.db(dbName);
}

export async function getCollections() {
  const db = await getDb();
  return {
    products: db.collection('products'),
    guides: db.collection('guides'),
    orders: db.collection('orders'),
    subscribers: db.collection('subscribers'),
    content: db.collection('site_content'),
  };
}

export function toObjectId(value: string) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

export function serialize(doc: any) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { ...rest, id: String(_id), _id: String(_id) };
}

export function amountCents(order: any): number {
  if (Number.isFinite(Number(order.amountCents))) return Number(order.amountCents);
  if (Number.isFinite(Number(order.amount))) return Number(order.amount);
  return 0;
}

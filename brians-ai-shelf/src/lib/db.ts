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

export async function getStoreCollections() {
  const db = await getDb();
  return {
    products: db.collection('products'),
    guides: db.collection('guides'),
    orders: db.collection('orders'),
    subscribers: db.collection('subscribers'),
    content: db.collection('site_content'),
  };
}

export function toObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

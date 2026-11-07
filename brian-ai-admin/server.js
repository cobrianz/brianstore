import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { MongoClient, ObjectId } from 'mongodb';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import multer from 'multer';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 4180);
const databaseName = process.env.MONGODB_DB || 'brian_ai_store_admin';
const sessionSecret = process.env.SESSION_SECRET || '';
const mongoUri = process.env.MONGODB_URI || '';
const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';
const r2Bucket = process.env.R2_BUCKET || '';
const r2RootPrefix = (process.env.R2_ROOT_PREFIX || '').trim().replace(/^\/+|\/+$/g, '');
if (r2RootPrefix && r2RootPrefix.split('/').some((part) => part === '.' || part === '..' || !/^[A-Za-z0-9_-]{1,100}$/.test(part))) {
  console.error('R2_ROOT_PREFIX must contain only simple letters, numbers, underscores, and hyphens.');
  process.exit(1);
}
const r2Endpoint = process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');
const r2PublicBaseUrl = (() => { try { const url = new URL(process.env.R2_PUBLIC_BASE_URL || ''); return url.protocol === 'https:' ? url.toString().replace(/\/+$/, '') : ''; } catch { return ''; } })();
const supportEmail = process.env.STORE_SUPPORT_EMAIL || '';

if (!mongoUri || mongoUri.includes('USER:PASSWORD') || !sessionSecret || sessionSecret.length < 32 || !adminEmail || !adminPasswordHash || adminPasswordHash.startsWith('replace-')) {
  console.error('Configuration incomplete. Copy .env.example to .env, add MongoDB, a 32+ character SESSION_SECRET, ADMIN_EMAIL, and a bcrypt ADMIN_PASSWORD_HASH.');
  process.exit(1);
}

const mongoClient = new MongoClient(mongoUri, { maxPoolSize: 10, serverSelectionTimeoutMS: 10000 });
await mongoClient.connect();
const db = mongoClient.db(databaseName);
const col = {
  products: db.collection('products'),
  guides: db.collection('guides'),
  orders: db.collection('orders'),
  subscribers: db.collection('subscribers'),
  content: db.collection('site_content'),
};
await Promise.all([
  col.products.createIndex({ slug: 1 }, { unique: true }),
  col.guides.createIndex({ slug: 1 }, { unique: true }),
  col.subscribers.createIndex({ email: 1 }, { unique: true }),
  col.orders.createIndex({ reference: 1 }, { unique: true, sparse: true }),
  col.orders.createIndex({ createdAt: -1 }),
]);

const defaultContent = {
  heroTitle: 'Hey, I’m Brian.',
  heroSubtitle: 'I make AI study simple.',
  aboutText: 'I’m Brian, an AI creator and educator. I share accessible tips and practical learning resources to help people get more comfortable using AI. Start with a guide, try one idea, and make it your own.',
  actirovaUrl: 'https://actirova.com/',
  newsletterText: 'Get useful AI tips, tools, and guides in your inbox.',
  tickerText: 'MAKE A THING ✳ LEARN A LITTLE ✳ GET UNSTUCK ✳',
  faqs: [
    { question: 'Are these digital products ready to download?', answer: 'After a confirmed payment, private download links are provided for the products in your order.' },
    { question: 'Can I purchase from this preview?', answer: 'Checkout is completed through the configured payment provider.' },
    { question: 'How do the email tips work?', answer: 'Subscribers receive email updates when the store’s email service is configured.' },
  ],
  socialLinks: [
    { label: 'X', url: 'https://x.com/actirova' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/cheruiyotbrian/' },
    { label: 'Portfolio', url: 'https://briankcheruiyot.netlify.app/' },
  ],
  updatedAt: new Date(),
};
await col.content.updateOne({ _id: 'main' }, { $setOnInsert: defaultContent }, { upsert: true });

const realConfig = (value) => Boolean(value && !/^(your-|replace-|example)/i.test(value));
const r2Ready = [process.env.R2_ACCOUNT_ID, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY, r2Bucket].every(realConfig) && realConfig(r2Endpoint) && !r2Endpoint.includes('your-cloudflare-account-id');
const r2 = r2Ready ? new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
}) : null;

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
    },
  },
  referrerPolicy: { policy: 'no-referrer' },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(session({
  name: 'brian-admin.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: MongoStore.create({ client: mongoClient, dbName: databaseName, collectionName: 'admin_sessions', ttl: 8 * 60 * 60 }),
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  },
}));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many sign-in attempts. Wait 15 minutes and try again.' } });
const subscriberLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 6, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Please wait before trying again.' } });
const uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Upload limit reached. Try again later.' } });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024, files: 1 } });

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Sign in to continue.' });
  next();
}
function requireCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (!safeEqual(req.session?.csrfToken, req.get('X-CSRF-Token'))) return res.status(403).json({ error: 'Your session token expired. Refresh and try again.' });
  next();
}
function createCsrfToken() { return randomBytes(32).toString('hex'); }
function cleanText(value, max = 2000) { return String(value ?? '').trim().slice(0, max); }
function slugify(value) {
  return cleanText(value, 120).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
}
function validSlug(value) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value); }
function validHttpUrl(value, fallback = '') {
  const text = cleanText(value, 500);
  if (!text) return fallback;
  try {
    const url = new URL(text);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.toString() : fallback;
  } catch { return fallback; }
}
function objectId(value) { return ObjectId.isValid(String(value || '')) ? new ObjectId(String(value)) : null; }
function serialize(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { ...rest, id: String(_id), _id: String(_id) };
}
function amountCents(order) {
  if (Number.isFinite(Number(order.amountCents))) return Number(order.amountCents);
  if (Number.isFinite(Number(order.amount))) return Number(order.amount);
  return 0;
}
function isR2Configured(_req, res, next) {
  if (!r2 || !r2Bucket) return res.status(503).json({ error: 'Cloudflare R2 is not configured. Add the R2 values to the private .env file.' });
  next();
}
function safeObjectKey(value) {
  const key = cleanText(value, 1024).replace(/^\/+/, '');
  return key && !key.split('/').some((part) => part === '..' || part === '.') ? key : '';
}
function storagePrefix(kind) { return `${r2RootPrefix ? `${r2RootPrefix}/` : ''}${kind}/`; }
function objectKeyWithPrefix(value, prefix, label) {
  const raw = cleanText(value, 1024);
  const key = safeObjectKey(raw);
  const expectedPrefix = storagePrefix(prefix);
  if (raw && !key) throw new Error(`${label} file key is invalid.`);
  if (key && !key.startsWith(expectedPrefix)) throw new Error(`${label} file key must use the ${expectedPrefix} prefix.`);
  return key;
}
function publicAssetUrl(key) {
  const safeKey = safeObjectKey(key);
  if (!safeKey || safeKey !== key || !safeKey.startsWith(storagePrefix('public')) || !r2PublicBaseUrl) return '';
  return `${r2PublicBaseUrl}/${safeKey.split('/').map(encodeURIComponent).join('/')}`;
}
function fileNameSafe(value) {
  const name = path.basename(String(value || 'download')).replace(/[\r\n"\\/]/g, '_').slice(0, 180);
  return name || 'download';
}
async function fileUrl(key, attachment = false) {
  const command = new GetObjectCommand({
    Bucket: r2Bucket,
    Key: key,
    ...(attachment ? { ResponseContentDisposition: `attachment; filename="${fileNameSafe(key.split('/').pop())}"` } : {}),
  });
  return getSignedUrl(r2, command, { expiresIn: 900 });
}
function productInput(body, existing = {}) {
  const title = cleanText(body.title ?? existing.title, 160);
  const slug = slugify(body.slug ?? existing.slug ?? title);
  const priceCents = Number(body.priceCents ?? existing.priceCents ?? 0);
  const status = body.status ?? existing.status ?? 'draft';
  if (!title) throw new Error('Product title is required.');
  if (!slug || !validSlug(slug)) throw new Error('Use a simple product slug (letters, numbers, and hyphens).');
  if (!Number.isSafeInteger(priceCents) || priceCents < 0 || priceCents > 100_000_000) throw new Error('Price must be a non-negative amount in cents.');
  if (!['draft', 'published'].includes(status)) throw new Error('Choose draft or published status.');
  return {
    title,
    slug,
    description: cleanText(body.description ?? existing.description, 5000),
    priceCents,
    currency: 'USD',
    category: cleanText(body.category ?? existing.category ?? 'learning', 60),
    status,
    featured: body.featured === undefined ? Boolean(existing.featured) : Boolean(body.featured),
    coverKey: objectKeyWithPrefix(body.coverKey ?? existing.coverKey, 'public', 'Cover'),
    fileKey: objectKeyWithPrefix(body.fileKey ?? existing.fileKey, 'private', 'Download'),
    fileName: fileNameSafe(body.fileName ?? existing.fileName ?? title.replace(/\s+/g, '-') + '.pdf'),
    updatedAt: new Date(),
  };
}
function guideInput(body, existing = {}) {
  const title = cleanText(body.title ?? existing.title, 160);
  const slug = slugify(body.slug ?? existing.slug ?? title);
  const status = body.status ?? existing.status ?? 'draft';
  if (!title) throw new Error('Guide title is required.');
  if (!slug || !validSlug(slug)) throw new Error('Use a simple guide slug (letters, numbers, and hyphens).');
  if (!['draft', 'published'].includes(status)) throw new Error('Choose draft or published status.');
  return {
    title,
    slug,
    summary: cleanText(body.summary ?? existing.summary, 1000),
    bodyMarkdown: cleanText(body.bodyMarkdown ?? existing.bodyMarkdown, 20000),
    category: cleanText(body.category ?? existing.category ?? 'free-guide', 60),
    status,
    coverKey: objectKeyWithPrefix(body.coverKey ?? existing.coverKey, 'public', 'Cover'),
    publicUrl: validHttpUrl(body.publicUrl ?? existing.publicUrl, ''),
    updatedAt: new Date(),
  };
}
function contentInput(body = {}) {
  const faqs = Array.isArray(body.faqs) ? body.faqs.slice(0, 20).map((row) => ({ question: cleanText(row?.question, 240), answer: cleanText(row?.answer, 2000) })).filter((row) => row.question && row.answer) : [];
  const socialLinks = Array.isArray(body.socialLinks) ? body.socialLinks.slice(0, 20).map((row) => ({ label: cleanText(row?.label, 60), url: validHttpUrl(row?.url, '') })).filter((row) => row.label && row.url) : [];
  return {
    heroTitle: cleanText(body.heroTitle, 240),
    heroSubtitle: cleanText(body.heroSubtitle, 1000),
    aboutText: cleanText(body.aboutText, 4000),
    actirovaUrl: validHttpUrl(body.actirovaUrl, 'https://actirova.com/'),
    newsletterText: cleanText(body.newsletterText, 1000),
    tickerText: cleanText(body.tickerText, 500),
    faqs,
    socialLinks,
    updatedAt: new Date(),
  };
}
function logError(message, err) { console.error(message, err?.message || err); }

app.get('/api/health', (_req, res) => res.json({ ok: true, database: mongoClient.topology?.isConnected?.() ?? true, storageConfigured: Boolean(r2) }));
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const email = cleanText(req.body?.email, 254).toLowerCase();
  const password = String(req.body?.password || '');
  try {
    const ok = email === adminEmail && password.length <= 256 && await bcrypt.compare(password, adminPasswordHash);
    if (!ok) return res.status(401).json({ error: 'Email or password is incorrect.' });
    await new Promise((resolve, reject) => req.session.regenerate((err) => err ? reject(err) : resolve()));
    req.session.user = { email: adminEmail };
    req.session.csrfToken = createCsrfToken();
    return res.json({ user: req.session.user, csrfToken: req.session.csrfToken });
  } catch (err) {
    logError('Admin sign-in failed:', err);
    return res.status(500).json({ error: 'Sign-in is temporarily unavailable.' });
  }
});
app.get('/api/auth/me', requireAuth, (req, res) => {
  if (!req.session.csrfToken) req.session.csrfToken = createCsrfToken();
  res.json({ user: req.session.user, csrfToken: req.session.csrfToken });
});
app.post('/api/auth/logout', requireAuth, requireCsrf, (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Could not end this session.' });
    res.clearCookie('brian-admin.sid', { httpOnly: true, sameSite: 'strict', secure: process.env.COOKIE_SECURE === 'true', path: '/' });
    return res.json({ ok: true });
  });
});

app.get('/api/storefront/products', async (_req, res) => {
  try {
    const rows = await col.products.find({ status: 'published' }).sort({ featured: -1, updatedAt: -1 }).limit(100).toArray();
    const products = await Promise.all(rows.map(async (row) => ({
      id: String(row._id), title: row.title, slug: row.slug, description: row.description,
      priceCents: row.priceCents, currency: row.currency || 'USD', category: row.category,
      featured: Boolean(row.featured), coverUrl: publicAssetUrl(row.coverKey),
    })));
    res.set('Cache-Control', 'no-store').json({ products });
  } catch (err) { logError('Public product API failed:', err); res.status(500).json({ error: 'Products are temporarily unavailable.' }); }
});
app.get('/api/storefront/guides', async (_req, res) => {
  try {
    const rows = await col.guides.find({ status: 'published' }).sort({ updatedAt: -1 }).limit(100).toArray();
    const guides = await Promise.all(rows.map(async (row) => ({
      id: String(row._id), title: row.title, slug: row.slug, summary: row.summary,
      category: row.category, publicUrl: row.publicUrl, coverUrl: publicAssetUrl(row.coverKey),
    })));
    res.set('Cache-Control', 'no-store').json({ guides });
  } catch (err) { logError('Public guide API failed:', err); res.status(500).json({ error: 'Guides are temporarily unavailable.' }); }
});
app.get('/api/storefront/content', async (_req, res) => {
  try {
    const { _id, updatedAt, ...content } = await col.content.findOne({ _id: 'main' }) || defaultContent;
    res.set('Cache-Control', 'no-store').json({ ...content, updatedAt });
  } catch (err) { logError('Public content API failed:', err); res.status(500).json({ error: 'Site content is temporarily unavailable.' }); }
});
app.post('/api/storefront/subscribers', subscriberLimiter, async (req, res) => {
  if (req.body?.website) return res.json({ ok: true, message: 'Thanks — you’re on the list.' });
  const email = cleanText(req.body?.email, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  try {
    await col.subscribers.updateOne({ email }, { $setOnInsert: { email, subscribedAt: new Date(), status: 'subscribed', source: 'storefront' } }, { upsert: true });
    res.json({ ok: true, message: 'Thanks — you’re on the list.' });
  } catch (err) { logError('Public subscription API failed:', err); res.status(500).json({ error: 'Sign-up could not be saved right now.' }); }
});

app.use('/api/admin', requireAuth, requireCsrf);
app.get('/api/admin/dashboard', async (_req, res) => {
  try {
    const [productsCount, guidesCount, ordersCount, subscribersCount, revenueRows, recent] = await Promise.all([
      col.products.countDocuments(), col.guides.countDocuments(), col.orders.countDocuments(), col.subscribers.countDocuments({ status: { $ne: 'unsubscribed' } }),
      col.orders.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, revenueCents: { $sum: { $ifNull: ['$amountCents', { $ifNull: ['$amount', 0] }] } } } }]).toArray(),
      col.orders.find({}).sort({ createdAt: -1 }).limit(8).toArray(),
    ]);
    res.json({ productsCount, guidesCount, ordersCount, subscribersCount, revenueCents: revenueRows[0]?.revenueCents || 0, recentOrders: recent.map(serialize) });
  } catch (err) { logError('Dashboard load failed:', err); res.status(500).json({ error: 'Dashboard could not be loaded.' }); }
});

app.get('/api/admin/products', async (_req, res) => {
  try { res.json((await col.products.find({}).sort({ updatedAt: -1 }).limit(500).toArray()).map(serialize)); }
  catch (err) { logError('Products load failed:', err); res.status(500).json({ error: 'Products could not be loaded.' }); }
});
app.post('/api/admin/products', async (req, res) => {
  try {
    const now = new Date();
    const product = productInput(req.body || {});
    product.createdAt = now;
    const result = await col.products.insertOne(product);
    res.status(201).json(serialize({ _id: result.insertedId, ...product }));
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'That product slug is already in use.' });
    if (err.message?.match(/required|slug|Price|status|file key/i)) return res.status(400).json({ error: err.message });
    logError('Product create failed:', err); res.status(500).json({ error: 'Product could not be created.' });
  }
});
app.patch('/api/admin/products/:id', async (req, res) => {
  const id = objectId(req.params.id); if (!id) return res.status(400).json({ error: 'Invalid product ID.' });
  try {
    const old = await col.products.findOne({ _id: id }); if (!old) return res.status(404).json({ error: 'Product not found.' });
    const product = productInput(req.body || {}, old);
    await col.products.updateOne({ _id: id }, { $set: product });
    res.json(serialize({ ...old, ...product, _id: id }));
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'That product slug is already in use.' });
    if (err.message?.match(/required|slug|Price|status|file key/i)) return res.status(400).json({ error: err.message });
    logError('Product update failed:', err); res.status(500).json({ error: 'Product could not be updated.' });
  }
});
app.delete('/api/admin/products/:id', async (req, res) => {
  const id = objectId(req.params.id); if (!id) return res.status(400).json({ error: 'Invalid product ID.' });
  try { const result = await col.products.deleteOne({ _id: id }); if (!result.deletedCount) return res.status(404).json({ error: 'Product not found.' }); res.json({ ok: true }); }
  catch (err) { logError('Product delete failed:', err); res.status(500).json({ error: 'Product could not be deleted.' }); }
});

app.get('/api/admin/guides', async (_req, res) => {
  try { res.json((await col.guides.find({}).sort({ updatedAt: -1 }).limit(500).toArray()).map(serialize)); }
  catch (err) { logError('Guides load failed:', err); res.status(500).json({ error: 'Guides could not be loaded.' }); }
});
app.post('/api/admin/guides', async (req, res) => {
  try {
    const now = new Date(); const guide = guideInput(req.body || {}); guide.createdAt = now;
    const result = await col.guides.insertOne(guide); res.status(201).json(serialize({ _id: result.insertedId, ...guide }));
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'That guide slug is already in use.' });
    if (err.message?.match(/required|slug|status/i)) return res.status(400).json({ error: err.message });
    logError('Guide create failed:', err); res.status(500).json({ error: 'Guide could not be created.' });
  }
});
app.patch('/api/admin/guides/:id', async (req, res) => {
  const id = objectId(req.params.id); if (!id) return res.status(400).json({ error: 'Invalid guide ID.' });
  try {
    const old = await col.guides.findOne({ _id: id }); if (!old) return res.status(404).json({ error: 'Guide not found.' });
    const guide = guideInput(req.body || {}, old); await col.guides.updateOne({ _id: id }, { $set: guide });
    res.json(serialize({ ...old, ...guide, _id: id }));
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'That guide slug is already in use.' });
    if (err.message?.match(/required|slug|status/i)) return res.status(400).json({ error: err.message });
    logError('Guide update failed:', err); res.status(500).json({ error: 'Guide could not be updated.' });
  }
});
app.delete('/api/admin/guides/:id', async (req, res) => {
  const id = objectId(req.params.id); if (!id) return res.status(400).json({ error: 'Invalid guide ID.' });
  try { const result = await col.guides.deleteOne({ _id: id }); if (!result.deletedCount) return res.status(404).json({ error: 'Guide not found.' }); res.json({ ok: true }); }
  catch (err) { logError('Guide delete failed:', err); res.status(500).json({ error: 'Guide could not be deleted.' }); }
});

app.get('/api/admin/orders', async (_req, res) => {
  try { res.json((await col.orders.find({}).sort({ createdAt: -1 }).limit(500).toArray()).map((order) => ({ ...serialize(order), amountCents: amountCents(order) }))); }
  catch (err) { logError('Orders load failed:', err); res.status(500).json({ error: 'Orders could not be loaded.' }); }
});
app.patch('/api/admin/orders/:id/note', async (req, res) => {
  const id = objectId(req.params.id); if (!id) return res.status(400).json({ error: 'Invalid order ID.' });
  try {
    const adminNote = cleanText(req.body?.adminNote, 3000);
    const result = await col.orders.updateOne({ _id: id }, { $set: { adminNote, adminNoteUpdatedAt: new Date() } });
    if (!result.matchedCount) return res.status(404).json({ error: 'Order not found.' });
    res.json({ ok: true, adminNote });
  } catch (err) { logError('Order note update failed:', err); res.status(500).json({ error: 'Order note could not be saved.' }); }
});

app.get('/api/admin/subscribers/export.csv', async (_req, res) => {
  try {
    const rows = await col.subscribers.find({}).sort({ subscribedAt: -1 }).limit(10000).toArray();
    const quote = (value) => { const raw = String(value ?? ''); const safe = /^[\s\u0000-\u001f]*[=+@-]/.test(raw) ? `'${raw}` : raw; return `"${safe.replace(/"/g, '""')}"`; };
    const csv = ['email,status,source,subscribedAt', ...rows.map((row) => [row.email, row.status || 'subscribed', row.source, row.subscribedAt?.toISOString?.() || row.subscribedAt].map(quote).join(','))].join('\r\n');
    res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="brian-subscribers.csv"', 'Cache-Control': 'no-store' }).send(csv);
  } catch (err) { logError('Subscriber export failed:', err); res.status(500).json({ error: 'Subscriber export failed.' }); }
});
app.get('/api/admin/subscribers', async (_req, res) => {
  try { res.json((await col.subscribers.find({}).sort({ subscribedAt: -1 }).limit(5000).toArray()).map(serialize)); }
  catch (err) { logError('Subscribers load failed:', err); res.status(500).json({ error: 'Subscribers could not be loaded.' }); }
});
app.delete('/api/admin/subscribers/:id', async (req, res) => {
  const id = objectId(req.params.id); if (!id) return res.status(400).json({ error: 'Invalid subscriber ID.' });
  try { const result = await col.subscribers.deleteOne({ _id: id }); if (!result.deletedCount) return res.status(404).json({ error: 'Subscriber not found.' }); res.json({ ok: true }); }
  catch (err) { logError('Subscriber delete failed:', err); res.status(500).json({ error: 'Subscriber could not be deleted.' }); }
});

app.get('/api/admin/content', async (_req, res) => {
  try { const doc = await col.content.findOne({ _id: 'main' }) || defaultContent; const { _id, ...content } = doc; res.json(content); }
  catch (err) { logError('Content load failed:', err); res.status(500).json({ error: 'Site content could not be loaded.' }); }
});
app.put('/api/admin/content', async (req, res) => {
  try { const content = contentInput(req.body || {}); await col.content.updateOne({ _id: 'main' }, { $set: content }, { upsert: true }); res.json(content); }
  catch (err) { logError('Content update failed:', err); res.status(400).json({ error: 'Site content could not be saved.' }); }
});

app.get('/api/admin/files', requireAuth, requireCsrf, isR2Configured, async (_req, res) => {
  try {
    const response = await r2.send(new ListObjectsV2Command({ Bucket: r2Bucket, MaxKeys: 300 }));
    const objects = await Promise.all((response.Contents || []).map(async (item) => {
      const isPublic = Boolean(item.Key?.startsWith(storagePrefix('public')));
      return {
        key: item.Key,
        size: item.Size || 0,
        lastModified: item.LastModified,
        public: Boolean(isPublic && r2PublicBaseUrl),
        url: isPublic && r2PublicBaseUrl ? publicAssetUrl(item.Key) : await fileUrl(item.Key),
      };
    }));
    res.json({ objects, truncated: Boolean(response.IsTruncated) });
  } catch (err) { logError('R2 list failed:', err); res.status(502).json({ error: 'Cloudflare R2 could not list objects. Check the bucket and API credentials.' }); }
});
app.post('/api/admin/files/upload', requireAuth, requireCsrf, isR2Configured, uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Choose a file to upload.' });
    const originalName = fileNameSafe(req.file.originalname);
    const ext = path.extname(originalName).toLowerCase();
    const allowed = new Set(['.pdf', '.epub', '.zip', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp3', '.mp4']);
    if (!allowed.has(ext)) return res.status(415).json({ error: 'File type not allowed. Use PDF, EPUB, ZIP, DOCX, TXT, image, MP3, or MP4 files.' });
    const kind = req.body?.kind === 'public' ? 'public' : 'private';
    const safeName = slugify(path.basename(originalName, ext)) || 'file';
    const key = `${storagePrefix(kind)}${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}${ext}`;
    await r2.send(new PutObjectCommand({ Bucket: r2Bucket, Key: key, Body: req.file.buffer, ContentType: req.file.mimetype || 'application/octet-stream', ContentLength: req.file.size, CacheControl: kind === 'public' ? 'public, max-age=3600' : 'private, no-store', Metadata: { originalname: encodeURIComponent(originalName) } }));
    const url = kind === 'public' && r2PublicBaseUrl ? publicAssetUrl(key) : await fileUrl(key, kind === 'private');
    res.status(201).json({ key, name: originalName, size: req.file.size, url });
  } catch (err) { logError('R2 upload failed:', err); res.status(502).json({ error: 'Upload failed. Check R2 permissions and try again.' }); }
});
app.get('/api/admin/files/signed', requireAuth, requireCsrf, isR2Configured, async (req, res) => {
  const key = safeObjectKey(req.query.key); if (!key) return res.status(400).json({ error: 'Invalid file key.' });
  try { res.json({ url: await fileUrl(key, req.query.download === 'true') }); }
  catch (err) { logError('R2 signed URL failed:', err); res.status(502).json({ error: 'A temporary file link could not be created.' }); }
});
app.delete('/api/admin/files', requireAuth, requireCsrf, isR2Configured, async (req, res) => {
  const key = safeObjectKey(req.body?.key); if (!key) return res.status(400).json({ error: 'Invalid file key.' });
  try { await r2.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: key })); res.json({ ok: true }); }
  catch (err) { logError('R2 delete failed:', err); res.status(502).json({ error: 'File could not be deleted from R2.' }); }
});

app.use('/api/admin', (_req, res) => res.status(404).json({ error: 'Admin endpoint not found.' }));
app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Files must be 100 MB or smaller.' });
  logError('Request error:', err);
  res.status(400).json({ error: 'The request could not be processed.' });
});
app.use(express.static(path.join(__dirname, 'public'), { dotfiles: 'deny', index: 'index.html', fallthrough: true, maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));

app.listen(port, '0.0.0.0', () => console.log(`Brian Admin listening on ${port}; MongoDB connected${r2 ? '; R2 configured' : '; R2 not configured'}.`));

process.on('SIGINT', async () => { await mongoClient.close(); process.exit(0); });
process.on('SIGTERM', async () => { await mongoClient.close(); process.exit(0); });

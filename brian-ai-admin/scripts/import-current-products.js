import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const here = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(here, '..', 'seed-assets');
const required = ['MONGODB_URI', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'];
for (const key of required) {
  const value = process.env[key] || '';
  if (!value || /^(your-|replace-)/i.test(value) || value.includes('USER:PASSWORD')) throw new Error(`Set a real ${key} in .env first.`);
}

const products = [
  { title: 'The Everyday Writing Prompt Pack', slug: 'everyday-writing-prompt-pack', category: 'ai-prompts', fileName: 'everyday-writing-prompt-pack.pdf', description: 'A practical collection of adaptable AI prompts for everyday writing tasks.' },
  { title: 'A Starter Guide to Better AI Prompts', slug: 'better-ai-prompts-guide', category: 'ebooks', fileName: 'better-ai-prompts-guide.pdf', description: 'A beginner-friendly guide to clearer prompts, useful context, constraints, examples, and follow-up questions.' },
  { title: 'One-Week Social Content Planner', slug: 'one-week-social-content-planner', category: 'learning', fileName: 'one-week-social-content-planner.pdf', description: 'A simple seven-day planning workbook for organizing social content ideas and calls to action.' },
  { title: 'The Job Search Assistant Prompt Kit', slug: 'job-search-assistant-prompt-kit', category: 'ai-prompts', fileName: 'job-search-assistant-prompt-kit.pdf', description: 'A starter prompt kit for organizing job research, application materials, and interview practice.' },
  { title: 'Simple Budgeting Workbook', slug: 'simple-budgeting-workbook', category: 'learning', fileName: 'simple-budgeting-workbook.pdf', description: 'A printable workbook for organizing monthly spending, budget categories, and practical next steps.' },
  { title: 'Your 30-Minute Study Planner', slug: '30-minute-study-planner', category: 'learning', fileName: '30-minute-study-planner.pdf', description: 'A short study-planning worksheet for turning a focused 30-minute session into manageable steps.' },
];

const mongo = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const endpoint = process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const r2 = new S3Client({ region: 'auto', endpoint, forcePathStyle: true, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
const bucket = process.env.R2_BUCKET;
const rootPrefix = (process.env.R2_ROOT_PREFIX || '').trim().replace(/^\/+|\/+$/g, '');
if (rootPrefix && rootPrefix.split('/').some((part) => part === '.' || part === '..' || !/^[A-Za-z0-9_-]{1,100}$/.test(part))) throw new Error('R2_ROOT_PREFIX must contain only simple letters, numbers, underscores, and hyphens.');

try {
  await mongo.connect();
  const productsCol = mongo.db(process.env.MONGODB_DB || 'brian_ai_store_admin').collection('products');
  await productsCol.createIndex({ slug: 1 }, { unique: true });
  let imported = 0;
  for (const product of products) {
    const existing = await productsCol.findOne({ slug: product.slug });
    if (existing?.fileKey) {
      console.log(`Skipped ${product.title}: a download file is already assigned.`);
      continue;
    }
    const localPath = path.join(assetsDir, product.fileName);
    const [body, info] = await Promise.all([readFile(localPath), stat(localPath)]);
    const key = `${rootPrefix ? `${rootPrefix}/` : ''}private/products/${product.slug}/${randomUUID()}-${product.fileName}`;
    await r2.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'application/pdf', ContentLength: info.size, CacheControl: 'private, no-store' }));
    const now = new Date();
    await productsCol.updateOne(
      { slug: product.slug },
      {
        $set: { fileKey: key, fileName: product.fileName, updatedAt: now },
        $setOnInsert: { title: product.title, slug: product.slug, description: product.description, category: product.category, priceCents: 500, currency: 'USD', status: 'draft', featured: false, coverKey: '', createdAt: now },
      },
      { upsert: true },
    );
    imported += 1;
    console.log(`Imported draft: ${product.title}`);
  }
  console.log(`Finished. ${imported} product file(s) uploaded to private R2 storage. New product records remain draft until you review and publish them.`);
} finally {
  await mongo.close();
}

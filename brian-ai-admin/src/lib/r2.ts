import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'node:path';
import { fileNameSafe } from './utils';

const r2RootPrefix = (process.env.R2_ROOT_PREFIX || '').trim().replace(/^\/+|\/+$/g, '');
const r2Bucket = process.env.R2_BUCKET || '';
const r2Endpoint = process.env.R2_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');
const r2PublicBaseUrl = (() => {
  try {
    const url = new URL(process.env.R2_PUBLIC_BASE_URL || '');
    return url.protocol === 'https:' ? url.toString().replace(/\/+$/, '') : '';
  } catch { return ''; }
})();

function isConfigured(v: string | undefined) {
  return Boolean(v && !/^(your-|replace-|example)/i.test(v));
}

export const r2Ready =
  [process.env.R2_ACCOUNT_ID, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY, r2Bucket]
    .every(isConfigured) &&
  isConfigured(r2Endpoint) &&
  !r2Endpoint.includes('your-cloudflare-account-id');

export const r2 = r2Ready
  ? new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      forcePathStyle: false,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export function storagePrefix(kind: 'public' | 'private') {
  return `${r2RootPrefix ? `${r2RootPrefix}/` : ''}${kind}/`;
}

export function safeObjectKey(value: string) {
  const key = value.trim().replace(/^\/+/, '');
  return key && !key.split('/').some(p => p === '..' || p === '.') ? key : '';
}

export function publicAssetUrl(key: string): string {
  const safeKey = safeObjectKey(key);
  if (!safeKey || !safeKey.startsWith(storagePrefix('public')) || !r2PublicBaseUrl) return '';
  return `${r2PublicBaseUrl}/${safeKey.split('/').map(encodeURIComponent).join('/')}`;
}

export async function getSignedFileUrl(key: string, attachment = false): Promise<string> {
  if (!r2 || !r2Bucket) throw new Error('R2 not configured.');
  const cmd = new GetObjectCommand({
    Bucket: r2Bucket,
    Key: key,
    ...(attachment ? { ResponseContentDisposition: `attachment; filename="${fileNameSafe(key.split('/').pop())}"` } : {}),
  });
  return getSignedUrl(r2, cmd, { expiresIn: 900 });
}

export async function listR2Objects() {
  if (!r2 || !r2Bucket) throw new Error('R2 not configured.');
  const res = await r2.send(new ListObjectsV2Command({ Bucket: r2Bucket, MaxKeys: 300 }));
  return { contents: res.Contents || [], truncated: Boolean(res.IsTruncated) };
}

export async function uploadToR2(key: string, buffer: Buffer, contentType: string, kind: 'public' | 'private') {
  if (!r2 || !r2Bucket) throw new Error('R2 not configured.');
  await r2.send(new PutObjectCommand({
    Bucket: r2Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ContentLength: buffer.length,
    CacheControl: kind === 'public' ? 'public, max-age=3600' : 'private, no-store',
  }));
}

export async function deleteFromR2(key: string) {
  if (!r2 || !r2Bucket) throw new Error('R2 not configured.');
  await r2.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: key }));
}

export { r2Bucket, r2PublicBaseUrl };

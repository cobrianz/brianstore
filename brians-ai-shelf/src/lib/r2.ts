import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Endpoint = process.env.R2_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');

export const r2 = process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
  ? new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      forcePathStyle: false,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

export const R2_BUCKET = process.env.R2_BUCKET || '';

export async function getSignedDownloadUrl(key: string, filename: string): Promise<string> {
  if (!r2 || !R2_BUCKET) throw new Error('R2 not configured.');
  const cmd = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, '_')}"`,
  });
  return getSignedUrl(r2, cmd, { expiresIn: 900 }); // 15 min
}

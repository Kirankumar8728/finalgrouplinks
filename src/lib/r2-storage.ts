import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { processAndStoreImageLocally } from './local-image-processor';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface R2UploadResult {
  success: boolean;
  r2Url?: string;
  key?: string;
  error?: string;
}

export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

export function getR2Client(): { client: S3Client; bucket: string; publicDomain: string } | null {
  if (!isR2Configured()) return null;
  return {
    client: new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    }),
    bucket: process.env.R2_BUCKET_NAME!,
    publicDomain: process.env.R2_PUBLIC_DOMAIN || 'https://cdn.grouplinks.app',
  };
}

export async function downloadImageFromR2(key: string): Promise<Buffer | null> {
  const r2 = getR2Client();
  if (!r2) return null;
  try {
    const command = new GetObjectCommand({ Bucket: r2.bucket, Key: key });
    const response = await r2.client.send(command);
    const streamToBuffer = (stream: any) =>
      new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    return await streamToBuffer(response.Body);
  } catch (err) {
    console.error(`[R2 Download Error] Failed to download ${key}:`, err);
    return null;
  }
}

export async function uploadRawToR2(key: string, buffer: Buffer, contentType: string = 'image/webp'): Promise<string | null> {
  const r2 = getR2Client();
  if (!r2) return null;
  try {
    await r2.client.send(new PutObjectCommand({
      Bucket: r2.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    return `${r2.publicDomain}/${key}`;
  } catch (err) {
    console.error(`[R2 Upload Error] Failed to upload ${key}:`, err);
    return null;
  }
}

/**
 * Compresses and stores images as WebP at grouplinks.app/images/{platform}/{grouptitle}/image1.webp.
 * For adult groups, images are NEVER stored on the server.
 */
export async function uploadImageToR2(
  sourceImageUrl: string,
  imageKeyPrefix: string = 'group-icon',
  customExactKey?: string,
  platform: string = 'whatsapp',
  isAdult: boolean = false
): Promise<R2UploadResult> {
  const result = await processAndStoreImageLocally(sourceImageUrl, platform, imageKeyPrefix, isAdult);
  if (result.success && result.imageUrl) {
    // Note: Assuming processAndStoreImageLocally stores locally, this wrapper
    // for R2 needs to handle the actual R2 upload logic.
    // Given the current structure, it's just a placeholder or needs to be hooked up.
    return {
      success: true,
      r2Url: result.imageUrl,
      key: `local-server/${imageKeyPrefix}-${Date.now()}.webp`,
    };
  }
  return {
    success: false,
    error: result.error || 'Failed to process and store image locally on server.',
  };
}

import { processAndStoreImageLocally } from './local-image-processor';
import { uploadToR2 } from './r2';

interface R2UploadResult {
  success: boolean;
  r2Url?: string;
  key?: string;
  error?: string;
}

export async function uploadImageToR2(
  sourceImageUrl: string,
  imageKeyPrefix: string = 'group-icon',
  platform: string = 'whatsapp',
  isAdult: boolean = false
): Promise<R2UploadResult> {
  // 1. Process/Resize locally first
  const result = await processAndStoreImageLocally(sourceImageUrl, platform, imageKeyPrefix, isAdult);
  
  if (!result.success || !result.imageUrl) {
    return { success: false, error: result.error || 'Failed to process image.' };
  }

  // 2. If it's already an R2 URL (from fallback), return as is
  if (result.imageUrl.includes('cdn.grouplinks.app')) {
    return { success: true, r2Url: result.imageUrl };
  }
  
  // 3. For raw images (base64 or remote URLs that weren't cached), we need to upload
  //    NOTE: The current processAndStoreImageLocally returns the URL, 
  //    we might need a buffer. 
  //    For now, let's assume if it is not an R2 URL, it might need re-uploading
  //    if we have the buffer, but processAndStoreImageLocally already uploads to R2 in line 143.
  
  return { success: true, r2Url: result.imageUrl };
}

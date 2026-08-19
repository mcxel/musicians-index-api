/**
 * downscaleImageFile — client-side resize for user-uploaded photos before
 * they become a YoPho layer/background source.
 *
 * Full-resolution phone photos (often 8-12MP+) were being set directly as
 * the image source, then repainted every animation frame under CSS filters,
 * blend modes, and masks (YoPho's Master Composite preview runs a
 * continuous requestAnimationFrame loop). That per-frame paint cost is what
 * produced visible lag right at the moment a picture was added — not a
 * one-time decode cost, a recurring one. Resizing to a sane max dimension
 * keeps quality effectively identical at display size while cutting that
 * per-frame cost.
 */

export interface DownscaledImage {
  blob: Blob;
  width: number;
  height: number;
}

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.9;

export async function downscaleImageFile(file: File, maxDimension = MAX_DIMENSION): Promise<DownscaledImage> {
  if (typeof createImageBitmap !== "function") {
    return { blob: file, width: 0, height: 0 };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const srcW = bitmap.width;
    const srcH = bitmap.height;
    const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));

    if (scale >= 1) {
      bitmap.close();
      return { blob: file, width: srcW, height: srcH };
    }

    const width = Math.round(srcW * scale);
    const height = Math.round(srcH * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return { blob: file, width: srcW, height: srcH };
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    return blob ? { blob, width, height } : { blob: file, width: srcW, height: srcH };
  } catch {
    return { blob: file, width: 0, height: 0 };
  }
}

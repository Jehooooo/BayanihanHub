// ============================================================
// Bayanihan Hub — Image Compression & Storage Quota Utility
// ============================================================

/**
 * Resizes and compresses an image data URL (Base64) to prevent exceeding browser localStorage quota (~5MB).
 * Target size: < 50KB while retaining high clarity for identity card and face review.
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxWidth = 640,
  maxHeight = 640,
  quality = 0.65
): Promise<string> {
  if (!dataUrl) return '';
  // If not a data URL (e.g. remote HTTP URL), return as is
  if (!dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Fill white background for transparent PNGs
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (err) {
        console.warn('Image compression fallback:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Compresses a File object directly to a compressed Base64 data URL
 */
export async function compressFileToDataUrl(
  file: File,
  maxWidth = 640,
  maxHeight = 640,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const rawDataUrl = reader.result as string;
      const compressed = await compressImageDataUrl(rawDataUrl, maxWidth, maxHeight, quality);
      resolve(compressed);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Safe localStorage write wrapper that catches quota exceptions without throwing
 */
export function safeSetLocalStorageItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] Failed to write to localStorage for key "${key}" (quota exceeded):`, err);
    // Attempt emergency cleanup of old non-critical caches if needed
    try {
      const tempKeys = ['temp-preview', 'cached-search'];
      tempKeys.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

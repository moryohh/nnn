import { ProblemJSON } from '../types';

/**
 * Supabase Storage Configuration Interface
 */
export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  bucketName: string;
}

const SUPABASE_CONFIG_STORAGE_KEY = 'iraq_curriculum_supabase_config_v1';

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        return {
          supabaseUrl: parsed.supabaseUrl.trim(),
          supabaseAnonKey: parsed.supabaseAnonKey.trim(),
          bucketName: (parsed.bucketName || 'diagrams').trim(),
        };
      }
    }
  } catch (e) {
    console.error('Error reading Supabase config', e);
  }
  return {
    supabaseUrl: '',
    supabaseAnonKey: '',
    bucketName: 'diagrams',
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  try {
    localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving Supabase config', e);
  }
}

/**
 * Upload a Base64 image directly to a Supabase Storage bucket
 * Returns the public URL of the uploaded image
 */
export async function uploadBase64ToSupabase(
  base64DataUrl: string,
  filePath: string,
  config: SupabaseConfig
): Promise<string> {
  const { supabaseUrl, supabaseAnonKey, bucketName } = config;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('بيانات Supabase (URL أو Key) غير مكتملة.');
  }

  // Convert base64 data URL to Blob
  const base64Content = base64DataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
  const byteCharacters = atob(base64Content);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });

  // Clean URL format
  const baseUrl = supabaseUrl.replace(/\/+$/, '');
  const cleanBucket = bucketName.trim() || 'diagrams';
  const cleanPath = filePath.replace(/^\/+/, '');

  // POST or PUT to Supabase Storage API
  // https://<project>.supabase.co/storage/v1/object/<bucket>/<path>
  const uploadEndpoint = `${baseUrl}/storage/v1/object/${cleanBucket}/${cleanPath}`;

  const response = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'apikey': supabaseAnonKey,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
    },
    body: blob,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`فشل الرفع إلى Supabase (${response.status}): ${errorText}`);
  }

  // Public URL
  // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const publicUrl = `${baseUrl}/storage/v1/object/public/${cleanBucket}/${cleanPath}`;
  return publicUrl;
}

/**
 * Crop a specific bounding box [ymin, xmin, ymax, xmax] (0-1000 range) from an image data URL
 * and return the cropped image data URL.
 * Includes a safety padding margin (e.g. 20px or 2%) around the diagram
 * to ensure all surrounding curves, symbols and labels are fully preserved without clipping edges.
 */
export async function cropImageBoundingBox(
  sourceDataUrl: string,
  box: [number, number, number, number],
  paddingPx: number = 20
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const [ymin, xmin, ymax, xmax] = box;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      // Calculate pixel coordinates with safety padding
      // xmin_px = max(0, ((xmin / 1000) * w) - padding_px)
      // ymin_px = max(0, ((ymin / 1000) * h) - padding_px)
      // xmax_px = min(w, ((xmax / 1000) * w) + padding_px)
      // ymax_px = min(h, ((ymax / 1000) * h) + padding_px)
      const xminPx = Math.max(0, ((xmin / 1000) * w) - paddingPx);
      const yminPx = Math.max(0, ((ymin / 1000) * h) - paddingPx);
      const xmaxPx = Math.min(w, ((xmax / 1000) * w) + paddingPx);
      const ymaxPx = Math.min(h, ((ymax / 1000) * h) + paddingPx);

      const cropW = xmaxPx - xminPx;
      const cropH = ymaxPx - yminPx;

      if (cropW <= 0 || cropH <= 0) {
        return resolve(sourceDataUrl);
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(cropW, 30);
      canvas.height = Math.max(cropH, 30);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(sourceDataUrl);
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, xminPx, yminPx, cropW, cropH, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png', 0.95));
    };
    img.onerror = (e) => reject(e);
    img.src = sourceDataUrl;
  });
}

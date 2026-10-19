import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Compresses an image File or Blob to under 500KB using browser-image-compression
 */
export async function compressImage(
  imageFile: File | Blob,
  options: CompressionOptions = {}
): Promise<File> {
  const fileToCompress =
    imageFile instanceof File
      ? imageFile
      : new File([imageFile], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });

  const defaultOptions = {
    maxSizeMB: 0.48, // strictly under 500KB
    maxWidthOrHeight: 1920, // 1080p max resolution for crisp text & serial numbers
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.85,
    onProgress: options.onProgress,
    ...options,
  };

  try {
    const compressedBlob = await imageCompression(fileToCompress, defaultOptions);
    return new File([compressedBlob], fileToCompress.name, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn("Image compression fallback:", error);
    // Return original if compression fails
    return fileToCompress;
  }
}

/**
 * Recommended MediaRecorder constraints for mobile technician QC video
 * Caps resolution at 720p (1280x720) and limits bitrate to keep file size small
 */
export const OPTIMAL_VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  audio: true,
  video: {
    width: { ideal: 1280, max: 1280 },
    height: { ideal: 720, max: 720 },
    frameRate: { ideal: 30, max: 30 },
    facingMode: "environment", // back camera
  },
};

/**
 * MediaRecorder options with capped bitrate (~1.5 Mbps for 720p)
 */
export function getOptimalRecorderOptions(): MediaRecorderOptions {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];

  let selectedMimeType = "";
  if (typeof MediaRecorder !== "undefined") {
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        selectedMimeType = type;
        break;
      }
    }
  }

  return {
    mimeType: selectedMimeType || undefined,
    videoBitsPerSecond: 1500000, // 1.5 Mbps produces ~11MB per minute of high clarity 720p video
    audioBitsPerSecond: 128000,
  };
}

/**
 * Format bytes to readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

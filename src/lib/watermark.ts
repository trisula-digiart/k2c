export interface WatermarkMetadata {
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  accuracy?: number | null;
  receiptNumber: string;
  storeName?: string;
  note?: string;
}

/**
 * Get current coordinates from navigator.geolocation
 */
export async function getCurrentCoordinates(): Promise<{
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return { latitude: null, longitude: null, accuracy: null };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        });
      },
      (error) => {
        console.warn("Geolocation warning:", error.message);
        resolve({ latitude: null, longitude: null, accuracy: null });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Format date into Western Indonesia Time (WIB, UTC+7)
 */
export function formatWIBDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date) + " WIB";
}

/**
 * Stamps watermark onto an HTMLCanvasElement
 */
export function drawWatermarkOnCanvas(
  canvas: HTMLCanvasElement,
  metadata: WatermarkMetadata
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Adaptive font and padding sizing based on canvas resolution
  const baseScale = Math.max(width / 1280, 0.6);
  const barHeight = Math.max(height * 0.14, 90 * baseScale);
  const paddingX = 24 * baseScale;
  const titleFontSize = Math.max(Math.round(20 * baseScale), 14);
  const textFontSize = Math.max(Math.round(15 * baseScale), 11);
  const badgeFontSize = Math.max(Math.round(13 * baseScale), 10);

  // 1. Draw dark translucent overlay banner at bottom
  const gradient = ctx.createLinearGradient(0, height - barHeight - 20, 0, height);
  gradient.addColorStop(0, "rgba(15, 23, 42, 0)");
  gradient.addColorStop(0.2, "rgba(15, 23, 42, 0.82)");
  gradient.addColorStop(1, "rgba(15, 23, 42, 0.96)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, height - barHeight - 20, width, barHeight + 20);

  // Accent line top of banner
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3 * baseScale;
  ctx.beginPath();
  ctx.moveTo(0, height - barHeight);
  ctx.lineTo(width, height - barHeight);
  ctx.stroke();

  // 2. Verified Watermark Tag / Shield in top-right or overlay
  const badgeWidth = 140 * baseScale;
  const badgeHeight = 28 * baseScale;
  const badgeX = width - badgeWidth - paddingX;
  const badgeY = height - barHeight + 14 * baseScale;

  ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 1.5 * baseScale;
  roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 6 * baseScale);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#34d399";
  ctx.font = `bold ${badgeFontSize}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✔ VERIFIED QC & DISPATCH", badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);

  // 3. Store Name & Title
  const startY = height - barHeight + 18 * baseScale;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${titleFontSize}px ui-sans-serif, system-ui, sans-serif`;
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 4;
  ctx.fillText(metadata.storeName || "K2C KOMPUTINDO", paddingX, startY);

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // 4. Receipt & Timestamp Row
  const row2Y = startY + titleFontSize + 8 * baseScale;
  ctx.fillStyle = "#e2e8f0";
  ctx.font = `600 ${textFontSize}px ui-monospace, SFMono-Regular, monospace`;
  ctx.fillText(
    `No. Resi: ${metadata.receiptNumber}  |  Waktu: ${metadata.timestamp}`,
    paddingX,
    row2Y
  );

  // 5. GPS Geolocation Row
  const row3Y = row2Y + textFontSize + 6 * baseScale;
  let gpsText = "GPS: Koordinat Tidak Tersedia (Sensor Dinonaktifkan)";
  if (metadata.latitude !== null && metadata.longitude !== null) {
    const accStr = metadata.accuracy ? ` (±${metadata.accuracy}m)` : "";
    gpsText = `GPS: ${metadata.latitude.toFixed(6)}, ${metadata.longitude.toFixed(6)}${accStr}`;
  }

  ctx.fillStyle = "#38bdf8";
  ctx.font = `500 ${textFontSize}px ui-monospace, SFMono-Regular, monospace`;
  ctx.fillText(gpsText + (metadata.note ? `  |  Catatan: ${metadata.note}` : ""), paddingX, row3Y);
}

/**
 * Apply watermark directly to an image File or Blob and return the watermarked Blob
 */
export async function applyWatermarkToImageFile(
  file: File | Blob,
  receiptNumber: string,
  note?: string
): Promise<{ blob: Blob; metadata: WatermarkMetadata }> {
  const coords = await getCurrentCoordinates();
  const timestamp = formatWIBDate();

  const metadata: WatermarkMetadata = {
    timestamp,
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    receiptNumber,
    storeName: "K2C KOMPUTINDO",
    note,
  };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to create canvas context"));
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Stamp watermark
      drawWatermarkOnCanvas(canvas, metadata);

      // Convert back to Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to export watermarked canvas"));
            return;
          }
          resolve({ blob, metadata });
        },
        "image/jpeg",
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for watermarking"));
    };

    img.src = objectUrl;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

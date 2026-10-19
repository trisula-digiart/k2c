"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  RefreshCw,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  Upload,
  AlertTriangle,
} from "lucide-react";
import {
  applyWatermarkToImageFile,
  getCurrentCoordinates,
  formatWIBDate,
  WatermarkMetadata,
} from "@/lib/watermark";
import { compressImage, formatBytes } from "@/lib/compression";
import { Button } from "@/components/ui/Button";

interface WatermarkCameraProps {
  receiptNumber: string;
  orderId: string;
  title?: string;
  onCaptureComplete: (file: File, metadata: WatermarkMetadata) => Promise<void>;
  onClose: () => void;
}

export const WatermarkCamera: React.FC<WatermarkCameraProps> = ({
  receiptNumber,
  orderId,
  title = "Foto Bukti Serah Terima & Dispatch",
  onCaptureComplete,
  onClose,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gps, setGps] = useState<{
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
  }>({ latitude: null, longitude: null, accuracy: null });
  const [currentTime, setCurrentTime] = useState<string>("");
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [currentMetadata, setCurrentMetadata] = useState<WatermarkMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update clock every second
  useEffect(() => {
    setCurrentTime(formatWIBDate());
    const interval = setInterval(() => {
      setCurrentTime(formatWIBDate());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial GPS
  useEffect(() => {
    getCurrentCoordinates().then((coords) => {
      setGps(coords);
    });
  }, []);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
          },
          audio: false,
        });
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err: any) {
        console.warn("Camera init failed:", err);
        setCameraError(
          "Tidak dapat mengakses kamera langsung. Anda tetap dapat mengunggah file foto dari galeri."
        );
      }
    }

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const rawBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.95)
      );

      if (!rawBlob) throw new Error("Failed to capture video frame");

      // Process watermark & compression
      await processAndSetPhoto(rawBlob);
    } catch (err: any) {
      alert("Gagal mengambil foto: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      await processAndSetPhoto(file);
    } catch (err: any) {
      alert("Gagal memproses foto: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const processAndSetPhoto = async (inputBlob: Blob | File) => {
    // 1. Watermark with GPS + WIB time + Resi
    const { blob: watermarkedBlob, metadata } = await applyWatermarkToImageFile(
      inputBlob,
      receiptNumber
    );

    // 2. Client-side compression under 500KB
    const compressedFile = await compressImage(watermarkedBlob, {
      maxSizeMB: 0.48,
      maxWidthOrHeight: 1920,
    });

    const previewUrl = URL.createObjectURL(compressedFile);
    setCapturedPreview(previewUrl);
    setProcessedFile(compressedFile);
    setCurrentMetadata(metadata);
    setFileSizeStr(formatBytes(compressedFile.size));
  };

  const handleRetake = () => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedPreview(null);
    setProcessedFile(null);
    setCurrentMetadata(null);
  };

  const handleConfirmUpload = async () => {
    if (!processedFile || !currentMetadata) return;
    setIsUploading(true);
    try {
      await onCaptureComplete(processedFile, currentMetadata);
    } catch (err: any) {
      alert("Gagal mengupload bukti: " + err.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none">
      {/* Top Bar */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div>
          <h4 className="text-white font-bold text-sm flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-400" />
            {title}
          </h4>
          <p className="text-[11px] font-mono text-slate-400">
            Resi: <span className="text-sky-300">{receiptNumber}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {capturedPreview ? (
          // Watermarked Result Preview
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
            <img
              src={capturedPreview}
              alt="Watermark preview"
              className="max-w-full max-h-[75vh] object-contain rounded-xl border border-slate-800 shadow-2xl"
            />
            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-emerald-400 font-mono shadow flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Watermarked ({fileSizeStr})
            </div>
          </div>
        ) : (
          // Live Camera Stream
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Live Watermark Overlay Simulation */}
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 pointer-events-none text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-white tracking-wider">
                  K2C KOMPUTINDO
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  WATERMARK ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                {currentTime}
              </p>
              <p className="text-[11px] text-sky-400 font-mono flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                {gps.latitude !== null
                  ? `GPS: ${gps.latitude.toFixed(5)}, ${gps.longitude?.toFixed(5)} (±${gps.accuracy}m)`
                  : "Mendeteksi GPS..."}
              </p>
            </div>

            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
                <p className="text-sm text-slate-300 mb-4 max-w-xs">{cameraError}</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                  icon={<Upload className="w-4 h-4" />}
                >
                  Pilih Foto dari Perangkat
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Bottom Controls */}
      <div className="p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around z-20">
        {capturedPreview ? (
          <div className="w-full flex items-center gap-3">
            <Button
              onClick={handleRetake}
              variant="secondary"
              className="flex-1"
              disabled={isUploading}
            >
              Ulangi Foto
            </Button>
            <Button
              onClick={handleConfirmUpload}
              variant="success"
              className="flex-1"
              loading={isUploading}
            >
              Simpan &amp; Kirim Bukti
            </Button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between px-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex flex-col items-center gap-1 active:scale-95"
            >
              <Upload className="w-5 h-5" />
              <span className="text-[10px]">Galeri</span>
            </button>

            {/* Shutter Button */}
            <button
              onClick={handleCapturePhoto}
              disabled={isProcessing}
              className="w-18 h-18 p-1.5 rounded-full border-4 border-white/80 flex items-center justify-center active:scale-90 transition-all shadow-xl shadow-blue-500/20"
            >
              <div className="w-14 h-14 rounded-full bg-white hover:bg-slate-200 transition-colors" />
            </button>

            <button
              onClick={() => {
                getCurrentCoordinates().then((coords) => {
                  setGps(coords);
                  alert(
                    coords.latitude
                      ? `GPS Terkunci: ${coords.latitude.toFixed(5)}, ${coords.longitude?.toFixed(5)}`
                      : "GPS tidak terdeteksi. Pastikan izin lokasi aktif."
                  );
                });
              }}
              className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex flex-col items-center gap-1 active:scale-95"
            >
              <MapPin className="w-5 h-5 text-sky-400" />
              <span className="text-[10px]">Cek GPS</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

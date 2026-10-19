"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Video,
  Square,
  Play,
  RotateCcw,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import {
  OPTIMAL_VIDEO_CONSTRAINTS,
  getOptimalRecorderOptions,
  formatBytes,
} from "@/lib/compression";
import { Button } from "@/components/ui/Button";

interface MediaUploaderProps {
  orderId: string;
  type: "QC_VIDEO" | "RETURN_UNBOXING";
  title?: string;
  onUploadComplete: (result: any) => void;
  onClose: () => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  orderId,
  type,
  title = "Rekam Video QC Unit",
  onUploadComplete,
  onClose,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia(OPTIMAL_VIDEO_CONSTRAINTS);
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err: any) {
        console.warn("Unable to get video stream:", err);
        setErrorMsg(
          "Tidak dapat membuka kamera langsung. Silakan unggah file video yang sudah direkam."
        );
      }
    }

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (!stream) return;
    setRecordedChunks([]);
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setDuration(0);

    try {
      const options = getOptimalRecorderOptions();
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "video/webm";
        const finalBlob = new Blob(chunks, { type: mimeType });
        setRecordedBlob(finalBlob);
        setRecordedUrl(URL.createObjectURL(finalBlob));
        setIsRecording(false);
      };

      recorder.start(1000); // 1s slice
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Recording error:", err);
      setErrorMsg("Gagal memulai perekaman: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleRetake = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(file);
    setRecordedUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!recordedBlob) return;
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      const filename = `${type.toLowerCase()}-${Date.now()}.${
        recordedBlob.type.includes("mp4") ? "mp4" : "webm"
      }`;
      formData.append("file", recordedBlob, filename);
      formData.append("orderId", orderId);
      formData.append("type", type);
      formData.append("autoUpdateStatus", "true");

      setUploadProgress(40);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah video ke server");
      }

      setUploadProgress(100);
      onUploadComplete(data);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Error upload video: " + err.message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">{title}</h4>
            <p className="text-[11px] text-slate-400">
              Format 720p Capped Bitrate (~1.5 Mbps)
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={isRecording || isUploading}
          className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {recordedUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <video
              src={recordedUrl}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-[75vh] rounded-xl border border-slate-800 shadow-2xl"
            />
            {recordedBlob && (
              <div className="mt-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-md border border-slate-800">
                Ukuran Video: <span className="text-emerald-400 font-bold">{formatBytes(recordedBlob.size)}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Recording HUD Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 bg-rose-600/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-white font-mono text-xs font-bold shadow-lg animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                REC {formatTime(duration)}
              </div>
            )}

            {errorMsg && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
                <p className="text-sm text-slate-300 mb-4 max-w-xs">{errorMsg}</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                  icon={<Upload className="w-4 h-4" />}
                >
                  Pilih File Video dari Galeri
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Bottom Actions */}
      <div className="p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between z-20">
        {recordedUrl ? (
          <div className="w-full flex items-center gap-3">
            <Button
              onClick={handleRetake}
              variant="secondary"
              className="flex-1"
              disabled={isUploading}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Rekam Ulang
            </Button>
            <Button
              onClick={handleUpload}
              variant="success"
              className="flex-1"
              loading={isUploading}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              {isUploading ? `Mengupload (${uploadProgress}%)` : "Simpan & Upload Video"}
            </Button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between px-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording}
              className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex flex-col items-center gap-1 active:scale-95 disabled:opacity-40"
            >
              <Upload className="w-5 h-5" />
              <span className="text-[10px]">Pilih File</span>
            </button>

            {/* Record / Stop Button */}
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full border-4 border-rose-500 bg-rose-600/20 flex items-center justify-center active:scale-95 transition-all shadow-xl shadow-rose-600/40"
              >
                <div className="w-8 h-8 rounded-md bg-rose-500 shadow-md" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center active:scale-95 transition-all shadow-xl shadow-blue-500/20"
              >
                <div className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-400 transition-colors shadow-inner" />
              </button>
            )}

            <div className="w-12 text-center text-xs font-mono text-slate-400">
              {isRecording ? formatTime(duration) : "00:00"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Video, MapPin, Clock, ExternalLink, Download } from "lucide-react";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: any;
  orderNumber?: string;
  receiptNumber?: string;
  publicToken?: string;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  onClose,
  media,
  orderNumber,
  receiptNumber,
  publicToken,
}) => {
  if (!media) return null;

  const isVideo =
    media.type === "QC_VIDEO" ||
    media.filePath.endsWith(".webm") ||
    media.filePath.endsWith(".mp4");

  let watermarkParsed: any = null;
  if (media.watermarkData) {
    try {
      watermarkParsed = JSON.parse(media.watermarkData);
    } catch (e) {}
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-400" />
          <span>Preview Media: {media.type}</span>
        </div>
      }
      size="xl"
      description={`Order: ${orderNumber || "-"} | Resi: ${receiptNumber || "-"}`}
    >
      <div className="space-y-4">
        {/* Video / Photo player */}
        <div className="w-full bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-2xl max-h-[65vh]">
          {isVideo ? (
            <video
              src={media.filePath}
              controls
              autoPlay
              className="max-h-[60vh] max-w-full"
            />
          ) : (
            <img
              src={media.filePath}
              alt="Bukti Media"
              className="max-h-[60vh] max-w-full object-contain"
            />
          )}
        </div>

        {/* Metadata info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <p className="font-bold text-slate-300">Informasi File</p>
            <p className="text-slate-400 font-mono">
              Tipe: <span className="text-white">{media.type}</span>
            </p>
            <p className="text-slate-400 font-mono">
              Waktu Unggah:{" "}
              <span className="text-slate-200">
                {new Date(media.createdAt).toLocaleString("id-ID")}
              </span>
            </p>
            <p className="text-slate-400 font-mono truncate">
              URL: <span className="text-sky-400">{media.filePath}</span>
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <p className="font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Bukti Watermark &amp; Lokasi
            </p>
            {watermarkParsed ? (
              <div className="space-y-1 font-mono text-slate-300">
                <p>
                  Timestamp WIB:{" "}
                  <span className="text-emerald-400">{watermarkParsed.timestamp}</span>
                </p>
                <p>
                  Koordinat:{" "}
                  <span className="text-sky-400">
                    {watermarkParsed.latitude
                      ? `${watermarkParsed.latitude.toFixed(6)}, ${watermarkParsed.longitude.toFixed(6)}`
                      : "GPS Offline"}
                  </span>
                </p>
                {watermarkParsed.accuracy && (
                  <p className="text-slate-400">
                    Akurasi GPS: ±{watermarkParsed.accuracy} meter
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 italic">
                {isVideo
                  ? "Rekaman video QC diproses langsung via hardware kamera lokal."
                  : "Watermark tersimpan embedded pada file gambar."}
              </p>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {publicToken ? (
            <a
              href={`/qc-public/${publicToken}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka Halaman Verifikasi Publik Pelanggan
            </a>
          ) : (
            <div />
          )}

          <a
            href={media.filePath}
            download
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Media
          </a>
        </div>
      </div>
    </Modal>
  );
};

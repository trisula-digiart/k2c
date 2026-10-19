"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  Camera,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Save,
  Phone,
  Package,
  Layers,
  MapPin,
  Play,
  Image as ImageIcon,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WatermarkCamera } from "@/components/tech/WatermarkCamera";
import { MediaUploader } from "@/components/tech/MediaUploader";
import { Modal } from "@/components/ui/Modal";
import { OrderStatus } from "@/lib/db";

export default function TechnicianTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [serialNumbers, setSerialNumbers] = useState<{ [itemId: string]: string }>({});
  const [savingSerials, setSavingSerials] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Overlays / Modals
  const [showWatermarkCamera, setShowWatermarkCamera] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState<"QC_VIDEO" | "RETURN_UNBOXING" | null>(null);
  const [activeMediaPreview, setActiveMediaPreview] = useState<any | null>(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}/status`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        // Pre-fill serial numbers
        const initialSerials: { [key: string]: string } = {};
        data.order.items?.forEach((item: any) => {
          initialSerials[item.id] = item.serialNumber || "";
        });
        setSerialNumbers(initialSerials);
      }
    } catch (e) {
      console.error("Failed to fetch order:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        alert("Gagal update status: " + data.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveSerialNumbers = async () => {
    setSavingSerials(true);
    try {
      const itemsPayload = Object.entries(serialNumbers).map(([itemId, serialNumber]) => ({
        id: itemId,
        serialNumber,
      }));

      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsPayload }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        alert("Nomor seri unit berhasil disimpan!");
      } else {
        alert("Gagal menyimpan nomor seri: " + data.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSavingSerials(false);
    }
  };

  const handleWatermarkUploadComplete = async (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("orderId", order.id);
    formData.append("type", "DISPATCH_PHOTO");
    formData.append("watermarkData", JSON.stringify(metadata));
    formData.append("autoUpdateStatus", "true");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      setOrder(data.order);
      setShowWatermarkCamera(false);
      alert("Foto serah terima berhasil diunggah & status pesanan diubah ke DISPATCHED!");
    } else {
      throw new Error(data.error || "Gagal mengunggah foto watermark");
    }
  };

  const handleMediaUploadComplete = (uploadResult: any) => {
    if (uploadResult.order) {
      setOrder(uploadResult.order);
    } else {
      fetchOrder();
    }
    setShowVideoRecorder(null);
    alert("Video bukti berhasil diunggah ke server lokal!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm">Memuat detail tugas QC...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-2" />
        <h3 className="text-base font-bold text-white">Pesanan Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          ID pesanan atau resi tidak terdaftar di database K2C.
        </p>
        <Link href="/tech">
          <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
            Kembali ke Worklist
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/tech"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              Tugas QC &amp; Dispatch
            </h1>
            <p className="text-[11px] font-mono text-sky-400">{order.receiptNumber}</p>
          </div>
        </div>

        <Badge status={order.status} size="sm" />
      </header>

      {/* Main Content */}
      <main className="p-4 flex-1 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        {/* Customer & Order Summary Card */}
        <section className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge marketplace={order.marketplace} />
              <span className="text-xs font-mono text-slate-400">{order.orderNumber}</span>
            </div>
            <Link
              href={`/qc-public/${order.publicToken}`}
              target="_blank"
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Link Publik QC</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400">Nama Pelanggan:</p>
              <p className="text-sm font-bold text-white">{order.customerName}</p>
            </div>
            {order.customerPhone && (
              <a
                href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </section>

        {/* Workflow Action Buttons (Mandatory Instructions) */}
        <section className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Alur Kerja Teknisi (QC &amp; Serah Terima)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* 1. Mulai QC */}
            <Button
              onClick={() => updateOrderStatus("QC_IN_PROGRESS")}
              disabled={order.status === "QC_IN_PROGRESS" || updatingStatus}
              variant={order.status === "QC_IN_PROGRESS" ? "secondary" : "primary"}
              className="w-full justify-start py-3"
              icon={<Clock className="w-4 h-4 text-amber-400" />}
            >
              <div className="text-left">
                <div className="font-bold text-xs">1. Mulai Proses QC</div>
                <div className="text-[10px] text-slate-300">Set status ke QC_IN_PROGRESS</div>
              </div>
            </Button>

            {/* 2. Rekam & Upload Video QC */}
            <Button
              onClick={() => setShowVideoRecorder("QC_VIDEO")}
              variant="outline"
              className="w-full justify-start py-3 hover:bg-blue-600/20 hover:border-blue-500"
              icon={<Video className="w-4 h-4 text-blue-400" />}
            >
              <div className="text-left">
                <div className="font-bold text-xs">2. Rekam Video QC</div>
                <div className="text-[10px] text-slate-300">Auto-compress &amp; QC_COMPLETED</div>
              </div>
            </Button>

            {/* 3. Foto Serah Terima Gerai (Watermark) */}
            <Button
              onClick={() => setShowWatermarkCamera(true)}
              variant="outline"
              className="w-full justify-start py-3 hover:bg-emerald-600/20 hover:border-emerald-500"
              icon={<Camera className="w-4 h-4 text-emerald-400" />}
            >
              <div className="text-left">
                <div className="font-bold text-xs">3. Foto Serah Terima</div>
                <div className="text-[10px] text-slate-300">Watermark GPS + DISPATCHED</div>
              </div>
            </Button>

            {/* 4. Dokumentasi Retur */}
            <Button
              onClick={() => setShowVideoRecorder("RETURN_UNBOXING")}
              variant="outline"
              className="w-full justify-start py-3 hover:bg-rose-600/20 hover:border-rose-500"
              icon={<RotateCcw className="w-4 h-4 text-rose-400" />}
            >
              <div className="text-left">
                <div className="font-bold text-xs">4. Dokumentasi Retur</div>
                <div className="text-[10px] text-slate-300">Unboxing RMA &amp; RETURNED</div>
              </div>
            </Button>
          </div>
        </section>

        {/* Item List with Serial Number Editor */}
        <section className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-sky-400" />
              Daftar Barang &amp; Input No. Seri (SN)
            </h3>
            <Button
              onClick={handleSaveSerialNumbers}
              size="xs"
              variant="primary"
              loading={savingSerials}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Simpan No. Seri
            </Button>
          </div>

          <div className="space-y-3 pt-1">
            {order.items?.map((item: any, idx: number) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-200">
                    <span className="text-blue-400 font-bold mr-1.5">{item.qty}x</span>
                    {item.itemName}
                  </div>
                  <span className="text-xs font-mono text-slate-400 shrink-0">
                    Rp {item.price.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Serial Number Input */}
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-mono text-slate-400 shrink-0">
                    No. Seri:
                  </label>
                  <input
                    type="text"
                    value={serialNumbers[item.id] || ""}
                    onChange={(e) =>
                      setSerialNumbers({
                        ...serialNumbers,
                        [item.id]: e.target.value,
                      })
                    }
                    placeholder="Contoh: SN-K2C-202610-XXX"
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-lg text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Media Proof Gallery Attached to Order */}
        <section className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Bukti Media Terupload ({order.mediaProofs?.length || 0})
          </h3>

          {order.mediaProofs?.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              Belum ada video atau foto yang diunggah untuk pesanan ini.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {order.mediaProofs?.map((media: any) => {
                const isVideo = media.type === "QC_VIDEO" || media.filePath.includes(".webm") || media.filePath.includes(".mp4");
                let watermarkParsed: any = null;
                try {
                  if (media.watermarkData) {
                    watermarkParsed = JSON.parse(media.watermarkData);
                  }
                } catch (e) {}

                return (
                  <div
                    key={media.id}
                    onClick={() => setActiveMediaPreview(media)}
                    className="group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer hover:border-blue-500 transition-all shadow-md"
                  >
                    <div className="aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                      {isVideo ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                          <video
                            src={media.filePath}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="w-9 h-9 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-4 h-4 ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={media.filePath}
                          alt="Media proof"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>

                    <div className="p-2 bg-slate-900/90">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-400">
                          {media.type}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {new Date(media.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {watermarkParsed?.latitude && (
                        <div className="text-[9px] text-sky-400 font-mono truncate mt-0.5 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span>{watermarkParsed.latitude.toFixed(4)}, {watermarkParsed.longitude.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Watermark Camera Overlay */}
      {showWatermarkCamera && (
        <WatermarkCamera
          receiptNumber={order.receiptNumber}
          orderId={order.id}
          onCaptureComplete={handleWatermarkUploadComplete}
          onClose={() => setShowWatermarkCamera(false)}
        />
      )}

      {/* Video Recorder Overlay */}
      {showVideoRecorder && (
        <MediaUploader
          orderId={order.id}
          type={showVideoRecorder}
          title={
            showVideoRecorder === "QC_VIDEO"
              ? "Rekam Video QC Unit (720p Capped)"
              : "Dokumentasi Unboxing Retur / RMA"
          }
          onUploadComplete={handleMediaUploadComplete}
          onClose={() => setShowVideoRecorder(null)}
        />
      )}

      {/* Media Detail Preview Modal */}
      {activeMediaPreview && (
        <Modal
          isOpen={true}
          onClose={() => setActiveMediaPreview(null)}
          title={`Detail Media: ${activeMediaPreview.type}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[60vh]">
              {activeMediaPreview.type === "QC_VIDEO" ||
              activeMediaPreview.filePath.includes(".webm") ||
              activeMediaPreview.filePath.includes(".mp4") ? (
                <video
                  src={activeMediaPreview.filePath}
                  controls
                  autoPlay
                  className="max-h-[55vh] max-w-full"
                />
              ) : (
                <img
                  src={activeMediaPreview.filePath}
                  alt="Proof preview"
                  className="max-h-[55vh] max-w-full object-contain"
                />
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <p className="text-slate-400">
                Path File: <span className="text-white">{activeMediaPreview.filePath}</span>
              </p>
              <p className="text-slate-400">
                Waktu Upload:{" "}
                <span className="text-slate-200">
                  {new Date(activeMediaPreview.createdAt).toLocaleString("id-ID")}
                </span>
              </p>
              {activeMediaPreview.watermarkData && (
                <div className="pt-1 mt-1 border-t border-slate-800 text-sky-400">
                  <p>Metadata Watermark:</p>
                  <pre className="text-[10px] mt-1 p-2 bg-slate-900 rounded overflow-x-auto">
                    {JSON.stringify(JSON.parse(activeMediaPreview.watermarkData), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

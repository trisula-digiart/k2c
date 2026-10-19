import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  ShieldCheck,
  CheckCircle2,
  Video,
  Camera,
  MapPin,
  Clock,
  Package,
  AlertCircle,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface PageProps {
  params: { token: string };
}

export const dynamic = "force-dynamic";

export default async function PublicQCVerificationPage({ params }: PageProps) {
  const { token } = params;

  const order = await prisma.order.findUnique({
    where: { publicToken: token },
    include: {
      items: true,
      mediaProofs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Mask customer name for privacy (e.g., "Budi Santoso" -> "Budi S*****")
  const maskName = (name: string) => {
    const parts = name.split(" ");
    if (parts.length === 1) {
      return name.slice(0, 2) + "*****";
    }
    return parts[0] + " " + parts.slice(1).map((p) => p[0] + "*****").join(" ");
  };

  const qcVideo = order.mediaProofs.find(
    (m) =>
      m.type === "QC_VIDEO" ||
      m.filePath.endsWith(".webm") ||
      m.filePath.endsWith(".mp4")
  );

  const dispatchPhotos = order.mediaProofs.filter(
    (m) => m.type === "DISPATCH_PHOTO"
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Store Banner */}
      <header className="bg-slate-900 border-b border-slate-800 py-6 px-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20 shrink-0">
              K2C
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-lg font-black text-white tracking-tight">
                  K2C KOMPUTINDO
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> OFFICIAL QC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verifikasi Hasil Pengujian Unit &amp; Bukti Serah Terima
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-xs text-slate-400">Nomor Resi:</span>
            <div className="font-mono text-sm font-bold text-sky-400">
              {order.receiptNumber}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Anti-Fraud Authenticity Card */}
        <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 shadow-2xl flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Unit Asli &amp; Teruji 100% Lolos Uji Fungsional
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pesanan Anda dengan nomor order{" "}
              <span className="font-mono text-white font-semibold">{order.orderNumber}</span>{" "}
              telah melalui tahapan pengujian fungsional ketat oleh teknisi K2C
              Komputindo sebelum diserahterimakan ke kurir. Rekaman video dan
              daftar nomor seri resmi tertera di bawah ini.
            </p>
          </div>
        </section>

        {/* Embedded QC Video Player */}
        <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" />
              Rekaman Video Pengujian Unit (QC Video)
            </h3>
            <Badge status={order.status} size="xs" />
          </div>

          {qcVideo ? (
            <div className="space-y-3">
              <div className="w-full bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                <video
                  src={qcVideo.filePath}
                  controls
                  playsInline
                  className="w-full max-h-[480px] object-contain"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Diuji pada:{" "}
                  {new Date(qcVideo.createdAt).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                  })}{" "}
                  WIB
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  ✔ Video QC Diverifikasi
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/80 rounded-xl border border-slate-800 text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-amber-400 animate-pulse" />
              <p className="text-xs font-semibold text-slate-300">
                Video QC Masih Dalam Proses Perekaman
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Teknisi kami sedang melakukan perakitan atau pengujian stress test
                pada unit Anda. Rekaman video akan muncul otomatis begitu proses selesai.
              </p>
            </div>
          )}
        </section>

        {/* Item List & Serial Numbers (Prevent Fraudulent Returns) */}
        <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-400" />
              Daftar Barang &amp; Nomor Seri Resmi (Serial Number)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Marketplace: {order.marketplace}
            </span>
          </div>

          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    <span className="text-blue-400 mr-1.5">{item.qty}x</span>
                    {item.itemName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Pembeli: {maskName(order.customerName)}
                  </div>
                </div>

                <div className="sm:text-right">
                  {item.serialNumber ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                      <span>SN:</span>
                      <span>{item.serialNumber}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono italic">
                      Nomor Seri tercatat pada barcode segel
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Perhatian: Seluruh klaim retur atau garansi harus mencantumkan nomor seri
            yang sama persis dengan yang tercatat pada sistem verifikasi K2C ini.
          </p>
        </section>

        {/* Dispatch Photos with GPS & Watermark */}
        {dispatchPhotos.length > 0 && (
          <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Bukti Serah Terima Gerai / Kurir (Watermark GPS)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dispatchPhotos.map((photo) => {
                let watermarkParsed: any = null;
                try {
                  if (photo.watermarkData) {
                    watermarkParsed = JSON.parse(photo.watermarkData);
                  }
                } catch (e) {}

                return (
                  <div
                    key={photo.id}
                    className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <img
                      src={photo.filePath}
                      alt="Foto Bukti Serah Terima"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-slate-300">
                          Serah Terima Gerai
                        </span>
                        <span className="font-mono text-[10px]">
                          {new Date(photo.createdAt).toLocaleTimeString("id-ID")} WIB
                        </span>
                      </div>
                      {watermarkParsed?.latitude && (
                        <p className="text-[11px] text-sky-400 font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>
                            GPS: {watermarkParsed.latitude.toFixed(5)},{" "}
                            {watermarkParsed.longitude.toFixed(5)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer Support Assistance */}
        <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Butuh bantuan teknis atau informasi kendala unit Anda?
          </p>
          <a
            href="https://wa.me/6281234567890?text=Halo%20K2C%20Komputindo,%20saya%20ingin%20konfirmasi%20unit%20pesanan%20saya"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Hubungi Customer Support K2C Komputindo
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 K2C Komputindo. Seluruh hak cipta dilindungi undang-undang.</p>
        <p className="text-[10px] text-slate-600 mt-1">
          Sistem Verifikasi Transparansi Mutu Unit &amp; Anti-Fraud
        </p>
      </footer>
    </div>
  );
}

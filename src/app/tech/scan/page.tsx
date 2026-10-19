"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, QrCode } from "lucide-react";
import { BarcodeScanner } from "@/components/tech/BarcodeScanner";

export default function TechnicianScanPage() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [scanStatus, setScanStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const handleScan = async (code: string) => {
    if (isSearching) return;
    setIsSearching(true);
    setScanStatus({
      type: "info",
      message: `Mencari data untuk resi/barcode: "${code}"...`,
    });

    try {
      // 1. Try finding by ID / orderNumber / receiptNumber
      const res = await fetch(`/api/orders/${encodeURIComponent(code)}/status`);
      const data = await res.json();

      if (data.success && data.order) {
        setScanStatus({
          type: "success",
          message: `Ditemukan: ${data.order.receiptNumber} (${data.order.customerName}). Mengalihkan...`,
        });
        setTimeout(() => {
          router.push(`/tech/task/${data.order.id}`);
        }, 600);
        return;
      }

      // 2. Fallback search via q query parameter
      const fallbackRes = await fetch(`/api/orders?q=${encodeURIComponent(code)}`);
      const fallbackData = await fallbackRes.json();

      if (fallbackData.success && fallbackData.orders?.length > 0) {
        const order = fallbackData.orders[0];
        setScanStatus({
          type: "success",
          message: `Ditemukan: ${order.receiptNumber} (${order.customerName}). Mengalihkan...`,
        });
        setTimeout(() => {
          router.push(`/tech/task/${order.id}`);
        }, 600);
        return;
      }

      // Not found
      setScanStatus({
        type: "error",
        message: `Tidak ditemukan pesanan dengan resi/barcode: "${code}". Pastikan nomor resi sesuai.`,
      });
      setIsSearching(false);
    } catch (err: any) {
      console.error("Scan lookup error:", err);
      setScanStatus({
        type: "error",
        message: "Gagal menghubungkan ke server lokal: " + err.message,
      });
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-4">
        <Link
          href="/tech"
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-medium active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>

        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <QrCode className="w-4 h-4 text-blue-400" />
          Scan Resi &amp; Unit
        </h2>

        <div className="w-16" />
      </header>

      {/* Main Scanner Section */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-4">
        {scanStatus && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95 ${
              scanStatus.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : scanStatus.type === "error"
                ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                : "bg-blue-500/15 border-blue-500/30 text-blue-300"
            }`}
          >
            {scanStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : scanStatus.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-blue-400" />
            )}
            <p className="font-medium">{scanStatus.message}</p>
          </div>
        )}

        <BarcodeScanner onScan={handleScan} />

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
          <p className="font-bold text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Tips Scanner K2C:
          </p>
          <p>• Posisikan garis barcode resi atau QR Code di dalam kotak panduan.</p>
          <p>• Pastikan pencahayaan cukup atau aktifkan tombol flash jika gelap.</p>
          <p>• Anda juga dapat mengetik nomor resi secara manual di kolom input.</p>
        </div>
      </div>
    </div>
  );
}

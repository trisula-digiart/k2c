"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Monitor,
  Smartphone,
  QrCode,
  ShieldCheck,
  Video,
  Printer,
  ChevronRight,
  Database,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Package,
} from "lucide-react";

export default function HomePage() {
  const [stats, setStats] = useState({
    total: 5,
    pending: 1,
    inProgress: 1,
    completed: 1,
    dispatched: 1,
  });

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.orders) {
          const orders = data.orders;
          setStats({
            total: orders.length,
            pending: orders.filter((o: any) => o.status === "PENDING").length,
            inProgress: orders.filter((o: any) => o.status === "QC_IN_PROGRESS").length,
            completed: orders.filter((o: any) => o.status === "QC_COMPLETED").length,
            dispatched: orders.filter((o: any) => o.status === "DISPATCHED").length,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/25">
              K2C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white tracking-tight">
                  K2C KOMPUTINDO
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                  v1.0 Production
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pusat Komputer, QC Tracker &amp; Dispatch POS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Aktif ({stats.total} Pesanan)
            </span>
          </div>
        </div>
      </header>

      {/* Main Choice Section */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 md:py-12 flex-1 flex flex-col justify-center">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Pilih Mode Akses Anda
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Portal Utama K2C Komputindo
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Silakan pilih antarmuka yang sesuai dengan perangkat dan peran operasional Anda.
          </p>
        </div>

        {/* 2 Big Distinct Action Cards: ADMIN vs TEKNISI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {/* OPTION 1: ADMIN */}
          <Link
            href="/admin"
            className="group relative p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-slate-800 hover:border-blue-500 shadow-2xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
          >
            {/* Background glowing orb */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/25 transition-all duration-300 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                  <Monitor className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  DESKTOP / KASIR
                </span>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                Portal Admin &amp; POS
                <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Untuk kasir, admin toko, dan operator gudang:
              </p>

              <ul className="space-y-2 text-xs text-slate-300 font-medium mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Papan Live Dispatch pesanan semua marketplace</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Input Pesanan Baru (Tokopedia, Shopee, TikTok, Kasir)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Cetak Struk Thermal (58mm / 80mm) &amp; Faktur A4</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Pemutar video QC langsung &amp; monitoring retur</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm font-bold text-white bg-blue-600 px-5 py-3 rounded-2xl group-hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all">
              <span>Masuk Sebagai Admin</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* OPTION 2: TEKNISI */}
          <Link
            href="/tech"
            className="group relative p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-slate-800 hover:border-emerald-500 shadow-2xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
          >
            {/* Background glowing orb */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-600/25 transition-all duration-300 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                  <Smartphone className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  MOBILE PWA / TEKNISI
                </span>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                Portal Teknisi &amp; QC
                <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Untuk teknisi bench perakitan, QC &amp; serah terima kurir:
              </p>

              <ul className="space-y-2 text-xs text-slate-300 font-medium mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Kamera Scanner Barcode / QR Code resi pengiriman</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Perekaman Video QC 720p langsung terkompresi</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Kamera Bukti Serah Terima Watermark GPS &amp; Waktu WIB</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Input &amp; update nomor seri (Serial Number) unit</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm font-bold text-white bg-emerald-600 px-5 py-3 rounded-2xl group-hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all">
              <span>Masuk Sebagai Teknisi</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Quick Scan & Verification Pill */}
        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-400">
          <span>Akses Cepat Langsung:</span>
          <Link
            href="/tech/scan"
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-sky-400 font-mono flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Kamera Scanner Resi</span>
          </Link>
          <Link
            href="/qc-public/k2c-tok-8f92a1"
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono flex items-center gap-1.5 transition-colors"
          >
            <span>Contoh Verifikasi Pelanggan ↗</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 bg-slate-950">
        <p>
          © 2026 K2C Komputindo • Trisula Framework • Production Ready
        </p>
      </footer>
    </div>
  );
}

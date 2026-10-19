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
  CheckCircle2,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const [stats, setStats] = useState({
    total: 5,
    pending: 1,
    inProgress: 1,
    completed: 1,
    dispatched: 1,
    returned: 1,
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
            returned: orders.filter((o: any) => o.status === "RETURNED").length,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/20">
              K2C
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">
                K2C KOMPUTINDO
              </span>
              <p className="text-[11px] text-slate-400">
                Pusat Komputer, Perakitan &amp; QC Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Operasional Lokal Aktif
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto w-full px-6 py-10 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Dual-Interface Production System
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Desktop POS &amp; Mobile Technician Hub
          </h1>
          <p className="text-sm text-slate-400">
            Sistem manajemen order multi-marketplace terpadu dengan pelacakan
            pengujian mutu (QC video), nomor seri produk (SN), dan bukti serah
            terima ber-watermark koordinat GPS.
          </p>
        </div>

        {/* Dual Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Desktop Admin Hub */}
          <Link
            href="/admin"
            className="group relative p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 shadow-2xl transition-all hover:scale-[1.01] flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6 shadow-inner">
                <Monitor className="w-7 h-7" />
              </div>

              <div className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-2 font-semibold">
                DESKTOP / SERVER PC
              </div>

              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                Desktop Admin &amp; POS Hub
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Papan kontrol live dispatch berdensitas tinggi, input pesanan Tokopedia,
                Shopee, TikTok Shop &amp; Kasir Offline, pemutar video QC, dan pencetakan
                invoice Thermal 58mm/80mm serta A4.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span>Thermal / A4 Print</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-400" />
                  <span>QC Video Player</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Buka Admin Hub &amp; POS Board</span>
              <span className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                →
              </span>
            </div>
          </Link>

          {/* Card 2: Mobile Technician Hub (PWA) */}
          <Link
            href="/tech"
            className="group relative p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 shadow-2xl transition-all hover:scale-[1.01] flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 shadow-inner">
                <Smartphone className="w-7 h-7" />
              </div>

              <div className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2 font-semibold">
                MOBILE PWA / SMARTPHONE
              </div>

              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                Mobile Technician Hub (PWA)
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Antarmuka responsif ramah jempol untuk teknisi lapangan/bench.
                Dilengkapi kamera scanner barcode resi, perekam video QC 720p terkompresi,
                pencatatan nomor seri, dan kamera bukti serah terima watermark GPS.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Kamera Scanner Resi</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Watermark GPS</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Buka Mobile Hub Teknisi</span>
              <span className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                →
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Links & Live Status Bar */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 font-mono text-slate-300">
              <Database className="w-4 h-4 text-blue-400" /> SQLite Database: Aktif ({stats.total} Pesanan)
            </span>
            <span className="flex items-center gap-1.5 font-mono text-slate-300">
              <HardDrive className="w-4 h-4 text-emerald-400" /> File Storage: /public/uploads
            </span>
            <span className="flex items-center gap-1.5 font-mono text-slate-300">
              <Cpu className="w-4 h-4 text-purple-400" /> Client Compression: Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders/new"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Order Baru
            </Link>
            <Link
              href="/tech/scan"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1 transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              Scan Barcode
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 bg-slate-950">
        <p>
          © 2026 K2C Komputindo • Sistem POS, QC Tracker &amp; PWA • Trisula Framework
        </p>
      </footer>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  ChevronRight,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  ShieldCheck,
  Video,
  Camera,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { OrderStatus } from "@/lib/types";

export default function TechnicianWorklistPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter & Search
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      selectedFilter === "ALL"
        ? true
        : selectedFilter === "NEED_QC"
        ? order.status === "PENDING"
        : selectedFilter === "QC_IN_PROGRESS"
        ? order.status === "QC_IN_PROGRESS"
        : selectedFilter === "QC_COMPLETED"
        ? order.status === "QC_COMPLETED"
        : selectedFilter === "DISPATCHED"
        ? order.status === "DISPATCHED"
        : selectedFilter === "RETURNED"
        ? order.status === "RETURNED"
        : order.status === selectedFilter;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.receiptNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.items?.some((i: any) =>
        i.itemName.toLowerCase().includes(q) || (i.serialNumber && i.serialNumber.toLowerCase().includes(q))
      );

    return matchesFilter && matchesSearch;
  });

  const countPending = orders.filter((o) => o.status === "PENDING").length;
  const countInProgress = orders.filter((o) => o.status === "QC_IN_PROGRESS").length;
  const countCompleted = orders.filter((o) => o.status === "QC_COMPLETED").length;
  const countDispatched = orders.filter((o) => o.status === "DISPATCHED").length;
  const countReturns = orders.filter((o) => o.status === "RETURNED").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 select-none">
      {/* Sticky App Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20">
              K2C
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
                K2C TEKNISI HUB
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PWA
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Pusat QC &amp; Serah Terima Gerai</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className={`p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all ${
                refreshing ? "animate-spin" : ""
              }`}
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/tech/scan"
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Resi</span>
            </Link>
          </div>
        </div>

        {/* Search input */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Resi, Order, Pembeli, atau Produk..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </header>

      {/* KPI Worklist Cards */}
      <div className="p-4 grid grid-cols-4 gap-2">
        <button
          onClick={() => setSelectedFilter("NEED_QC")}
          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
            selectedFilter === "NEED_QC"
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
              : "bg-slate-900 border-slate-800 text-slate-400"
          }`}
        >
          <span className="text-xs font-bold">{countPending}</span>
          <span className="text-[10px] mt-0.5">Perlu QC</span>
        </button>

        <button
          onClick={() => setSelectedFilter("QC_IN_PROGRESS")}
          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
            selectedFilter === "QC_IN_PROGRESS"
              ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
              : "bg-slate-900 border-slate-800 text-slate-400"
          }`}
        >
          <span className="text-xs font-bold">{countInProgress}</span>
          <span className="text-[10px] mt-0.5">Proses</span>
        </button>

        <button
          onClick={() => setSelectedFilter("QC_COMPLETED")}
          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
            selectedFilter === "QC_COMPLETED"
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
              : "bg-slate-900 border-slate-800 text-slate-400"
          }`}
        >
          <span className="text-xs font-bold">{countCompleted}</span>
          <span className="text-[10px] mt-0.5">Selesai QC</span>
        </button>

        <button
          onClick={() => setSelectedFilter("RETURNED")}
          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
            selectedFilter === "RETURNED"
              ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
              : "bg-slate-900 border-slate-800 text-slate-400"
          }`}
        >
          <span className="text-xs font-bold">{countReturns}</span>
          <span className="text-[10px] mt-0.5">Retur</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="px-4 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "ALL", label: "Semua Task" },
          { id: "NEED_QC", label: "Menunggu QC" },
          { id: "QC_IN_PROGRESS", label: "QC Berjalan" },
          { id: "QC_COMPLETED", label: "Siap Kirim" },
          { id: "DISPATCHED", label: "Terkirim" },
          { id: "RETURNED", label: "Retur / RMA" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedFilter === f.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders Worklist */}
      <div className="px-4 flex-1 flex flex-col gap-3 mt-2">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <p className="text-xs">Memuat antrean tugas teknisi...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center p-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col items-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Tidak ada tugas dalam kategori ini</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Semua unit sudah diproses atau sesuaikan filter pencarian di atas.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const hasVideo = order.mediaProofs?.some((m: any) => m.type === "QC_VIDEO");
            const hasPhoto = order.mediaProofs?.some((m: any) => m.type === "DISPATCH_PHOTO");
            const hasReturn = order.mediaProofs?.some((m: any) => m.type === "RETURN_UNBOXING");

            return (
              <Link
                key={order.id}
                href={`/tech/task/${order.id}`}
                className="block p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all active:scale-[0.99] shadow-lg shadow-black/20"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge marketplace={order.marketplace} size="xs" />
                      <span className="font-mono text-xs font-bold text-sky-400">
                        {order.receiptNumber}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 mt-1">
                      {order.customerName}
                    </p>
                  </div>

                  <Badge status={order.status} size="xs" />
                </div>

                {/* Items preview */}
                <div className="py-2 border-t border-b border-slate-800/60 my-2 space-y-1">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[220px]">
                        {item.qty}x {item.itemName}
                      </span>
                      {item.serialNumber ? (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                          SN: {item.serialNumber}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                          SN Belum Ada
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer status & quick media badge */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {hasVideo && (
                      <span className="text-[10px] flex items-center gap-1 text-blue-400 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                        <Video className="w-3 h-3" /> QC Video
                      </span>
                    )}
                    {hasPhoto && (
                      <span className="text-[10px] flex items-center gap-1 text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <Camera className="w-3 h-3" /> Foto Serah
                      </span>
                    )}
                    {hasReturn && (
                      <span className="text-[10px] flex items-center gap-1 text-rose-400 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                        <RotateCcw className="w-3 h-3" /> Retur Media
                      </span>
                    )}
                    {!hasVideo && !hasPhoto && !hasReturn && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Belum ada bukti media
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-blue-400 text-xs font-semibold">
                    <span>Buka Task</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Thumb-friendly Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-2.5 flex items-center justify-around shadow-2xl">
        <Link
          href="/tech"
          className="flex flex-col items-center gap-1 text-blue-400 active:scale-95 transition-all"
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Tugas QC</span>
        </Link>

        <Link
          href="/tech/scan"
          className="w-12 h-12 -mt-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 border-2 border-slate-900 active:scale-90 transition-all"
        >
          <QrCode className="w-6 h-6" />
        </Link>

        <Link
          href="/admin"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-medium">Admin POS</span>
        </Link>
      </nav>
    </div>
  );
}

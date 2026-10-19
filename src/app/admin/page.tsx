"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Smartphone,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { CompactOrderTable } from "@/components/admin/CompactOrderTable";
import { Button } from "@/components/ui/Button";
import { OrderStatus } from "@/lib/types";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Optional auto-refresh every 20 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 20000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
      } else {
        alert("Gagal memperbarui status: " + data.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const matchesMp =
      selectedMarketplace === "ALL" ||
      order.marketplace.toLowerCase() === selectedMarketplace.toLowerCase();

    const matchesStatus =
      selectedStatus === "ALL" || order.status === selectedStatus;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.receiptNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.items?.some((i: any) =>
        i.itemName.toLowerCase().includes(q) ||
        (i.serialNumber && i.serialNumber.toLowerCase().includes(q))
      );

    return matchesMp && matchesStatus && matchesSearch;
  });

  // KPI Counts
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const inProgressCount = orders.filter((o) => o.status === "QC_IN_PROGRESS").length;
  const qcCompletedCount = orders.filter((o) => o.status === "QC_COMPLETED").length;
  const dispatchedCount = orders.filter((o) => o.status === "DISPATCHED").length;
  const returnedCount = orders.filter((o) => o.status === "RETURNED").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/20">
              K2C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  K2C KOMPUTINDO
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  DESKTOP ADMIN HUB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Modern Compact POS &amp; Live Dispatch Board
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tech"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-2 transition-all"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>Buka Mobile Hub Teknisi (PWA)</span>
            </Link>

            <Link href="/admin/orders/new">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              >
                Buat Pesanan Baru
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-6 flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div
            onClick={() => setSelectedStatus("ALL")}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedStatus === "ALL"
                ? "bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Total Pesanan</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
            <span className="text-[10px] text-slate-500">Semua Saluran</span>
          </div>

          <div
            onClick={() => setSelectedStatus("PENDING")}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedStatus === "PENDING"
                ? "bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-medium">Menunggu QC</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {pendingCount}
            </div>
            <span className="text-[10px] text-amber-400/60">Antrean Tes Unit</span>
          </div>

          <div
            onClick={() => setSelectedStatus("QC_IN_PROGRESS")}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedStatus === "QC_IN_PROGRESS"
                ? "bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-blue-400">
              <span className="text-xs font-medium">Sedang QC</span>
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {inProgressCount}
            </div>
            <span className="text-[10px] text-blue-400/60">Bench Teknisi</span>
          </div>

          <div
            onClick={() => setSelectedStatus("QC_COMPLETED")}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedStatus === "QC_COMPLETED"
                ? "bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-medium">QC Selesai</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {qcCompletedCount}
            </div>
            <span className="text-[10px] text-emerald-400/60">Siap Packing &amp; Kirim</span>
          </div>

          <div
            onClick={() => setSelectedStatus("DISPATCHED")}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedStatus === "DISPATCHED"
                ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-xs font-medium">Serah Terima</span>
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              {dispatchedCount}
            </div>
            <span className="text-[10px] text-cyan-400/60">Kurir / Pelanggan</span>
          </div>

          <div
            onClick={() => setSelectedStatus("RETURNED")}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedStatus === "RETURNED"
                ? "bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-xs font-medium">Retur / RMA</span>
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {returnedCount}
            </div>
            <span className="text-[10px] text-rose-400/60">Dokumentasi Klaim</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Resi, Order, Pembeli, atau Serial Number..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Marketplace Filter */}
            <select
              value={selectedMarketplace}
              onChange={(e) => setSelectedMarketplace(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 py-2 px-3 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Marketplace</option>
              <option value="Tokopedia">Tokopedia</option>
              <option value="Shopee">Shopee</option>
              <option value="TikTok Shop">TikTok Shop</option>
              <option value="Offline">Offline (Walk-in)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
              />
              <span>Auto-refresh (20s)</span>
            </label>

            <button
              onClick={fetchOrders}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all"
              title="Refresh Data Sekarang"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-400" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Compact Order Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Memuat data pesanan POS...</p>
          </div>
        ) : (
          <CompactOrderTable
            orders={filteredOrders}
            onStatusChange={handleStatusChange}
            onRefresh={fetchOrders}
          />
        )}
      </main>
    </div>
  );
}

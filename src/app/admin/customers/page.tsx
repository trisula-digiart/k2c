"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Store,
  X,
  UserCheck,
  Calendar,
  Building,
} from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/Button";

interface CustomerItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  marketplace: string | null;
  notes: string | null;
  createdAt: string;
}

const MARKETPLACE_STYLES: Record<string, { label: string; badge: string }> = {
  Tokopedia: {
    label: "Tokopedia",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  Shopee: {
    label: "Shopee",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  "TikTok Shop": {
    label: "TikTok Shop",
    badge: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  },
  Offline: {
    label: "Offline / Toko Fisik",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("ALL");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    marketplace: "Offline",
    notes: "",
  });

  const fetchCustomers = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error("Gagal memuat pelanggan:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      marketplace: "Offline",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: CustomerItem) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      marketplace: c.marketplace || "Offline",
      notes: c.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Nama pelanggan wajib diisi!");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCustomer) {
        // PATCH
        const res = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } else {
        // POST
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (c: CustomerItem) => {
    if (!confirm(`Hapus data pelanggan '${c.name}'?`)) return;

    try {
      const res = await fetch(`/api/customers/${c.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCustomers((prev) => prev.filter((item) => item.id !== c.id));
      } else {
        alert("Gagal menghapus pelanggan: " + data.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const formatWhatsAppUrl = (phone: string | null) => {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "62" + clean.slice(1);
    return `https://wa.me/${clean}`;
  };

  // KPIs
  const totalCount = customers.length;
  const offlineCount = useMemo(
    () => customers.filter((c) => c.marketplace === "Offline").length,
    [customers]
  );
  const onlineCount = totalCount - offlineCount;

  // Filtered List
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesChannel =
        selectedChannel === "ALL" || c.marketplace === selectedChannel;

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q));

      return matchesChannel && matchesSearch;
    });
  }, [customers, selectedChannel, search]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">
      <AdminNav />

      <main className="p-3.5 sm:p-6 flex-1 flex flex-col gap-4 sm:gap-6 max-w-7xl mx-auto w-full">
        {/* Page Title & Quick Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Data Pelanggan K2C
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direktori pembeli &amp; langganan walk-in, marketplace, dan instansi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
              }
              onClick={fetchCustomers}
              disabled={refreshing}
            >
              Segarkan
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={openAddModal}
            >
              Tambah Pelanggan
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Pelanggan Terdaftar</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {totalCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">kontak</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Database riwayat pembeli &amp; servis
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Pelanggan Marketplace</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-400">
              {onlineCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">pembeli online</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Shopee, Tokopedia, TikTok Shop
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Langganan Toko Fisik</span>
              <Store className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-blue-400">
              {offlineCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">walk-in customer</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Kunjungan langsung ke toko K2C
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-2xl items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama pelanggan, nomor telepon, alamat, atau catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Channel Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedChannel("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedChannel === "ALL"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Semua Channel
            </button>
            {Object.entries(MARKETPLACE_STYLES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setSelectedChannel(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedChannel === key
                    ? "bg-slate-800 text-white border-indigo-500 shadow-sm"
                    : "bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. SHOPEE SELLER MOBILE CUSTOMER CARDS (Smartphone View) */}
        <div className="md:hidden space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
              Memuat data pelanggan...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">
                Tidak ada pelanggan ditemukan
              </p>
            </div>
          ) : (
            filteredCustomers.map((c) => {
              const mp = MARKETPLACE_STYLES[c.marketplace || "Offline"] || {
                label: c.marketplace || "Lainnya",
                badge: "bg-slate-800 text-slate-300 border-slate-700",
              };
              const waUrl = formatWhatsAppUrl(c.phone);

              return (
                <div
                  key={c.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{c.name}</div>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold border ${mp.badge} mt-0.5`}
                        >
                          {mp.label}
                        </span>
                      </div>
                    </div>

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WA</span>
                      </a>
                    )}
                  </div>

                  {c.phone && (
                    <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{c.phone}</span>
                    </div>
                  )}

                  {c.address && (
                    <div className="text-[11px] text-slate-400 flex items-start gap-1.5 line-clamp-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{c.address}</span>
                    </div>
                  )}

                  {c.notes && (
                    <div className="text-[10px] text-slate-500 italic bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      {c.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => openEditModal(c)}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(c)}
                      className="px-3 py-1 rounded-lg bg-red-500/10 text-xs font-medium text-red-400"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. DESKTOP ERP TABLE (PC View) */}
        <div className="hidden md:block rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-4 min-w-[200px]">Pelanggan</th>
                  <th className="py-3.5 px-4">Kontak &amp; WhatsApp</th>
                  <th className="py-3.5 px-4">Asal Channel</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Alamat Pengiriman</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Catatan Khusus</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                      Memuat data pelanggan...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">
                        Tidak ada pelanggan yang ditemukan
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Coba kata kunci pencarian lain atau tambahkan pelanggan baru.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const mp = MARKETPLACE_STYLES[c.marketplace || "Offline"] || {
                      label: c.marketplace || "Lainnya",
                      badge: "bg-slate-800 text-slate-300 border-slate-700",
                    };
                    const waUrl = formatWhatsAppUrl(c.phone);

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Name & Initials */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                              {c.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                {c.name}
                              </div>
                              {c.email && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  <span>{c.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone & WhatsApp */}
                        <td className="py-3 px-4">
                          {c.phone ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-200">{c.phone}</span>
                              {waUrl && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat via WhatsApp"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold transition-colors"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WA</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">
                              Tidak ada nomor
                            </span>
                          )}
                        </td>

                        {/* Channel Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${mp.badge}`}
                          >
                            {mp.label}
                          </span>
                        </td>

                        {/* Address */}
                        <td className="py-3 px-4">
                          {c.address ? (
                            <div className="text-slate-300 text-[11px] line-clamp-2 flex items-start gap-1 font-normal">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                              <span>{c.address}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-4">
                          {c.notes ? (
                            <span className="text-slate-400 text-[11px] line-clamp-2 font-normal">
                              {c.notes}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(c)}
                              title="Edit Pelanggan"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(c)}
                              title="Hapus Pelanggan"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Menampilkan <b className="text-white">{filteredCustomers.length}</b> dari{" "}
              {customers.length} pelanggan
            </span>
            <span className="text-[11px] text-slate-500">
              Integrasi langsung saat pembuatan pesanan baru
            </span>
          </div>
        </div>
      </main>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  {editingCustomer ? "Edit Data Pelanggan" : "Tambah Pelanggan Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 flex flex-col gap-4">
              {/* Name & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Pelanggan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Budi Santoso"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Asal Channel Pembelian
                  </label>
                  <select
                    value={formData.marketplace}
                    onChange={(e) =>
                      setFormData({ ...formData, marketplace: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Offline">Offline / Toko Fisik</option>
                    <option value="Tokopedia">Tokopedia</option>
                    <option value="Shopee">Shopee</option>
                    <option value="TikTok Shop">TikTok Shop</option>
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="e.g. 081234567890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="e.g. budi@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Lengkap Pengiriman
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Jl. Raya No. ..., Kelurahan, Kecamatan, Kota/Kabupaten..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Khusus (Preferensi Rakitan, Garansi, dll)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Contoh: Langganan PC gaming warnet, minta packing kayu tambahan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                >
                  {editingCustomer ? "Simpan Perubahan" : "Tambahkan Pelanggan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

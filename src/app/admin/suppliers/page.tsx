"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Building2,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Truck,
  HardDrive,
  Monitor,
  Cpu,
  PackageCheck,
  X,
  Layers,
} from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/Button";

interface SupplierItem {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  category: string | null;
  notes: string | null;
  createdAt: string;
}

const SUPPLIER_CATEGORIES: Record<
  string,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  HARDWARE: {
    label: "Hardware & Mainboard",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: <Cpu className="w-3.5 h-3.5" />,
  },
  MONITOR: {
    label: "Monitor & Display",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    icon: <Monitor className="w-3.5 h-3.5" />,
  },
  STORAGE_RAM: {
    label: "Storage & RAM",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: <HardDrive className="w-3.5 h-3.5" />,
  },
  ACCESSORIES: {
    label: "Periferal & Kabel",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    icon: <Layers className="w-3.5 h-3.5" />,
  },
  LOGISTICS: {
    label: "Logistik & Packing",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
};

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    category: "HARDWARE",
    notes: "",
  });

  const fetchSuppliers = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.suppliers || []);
      }
    } catch (e) {
      console.error("Gagal memuat supplier:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      category: "HARDWARE",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: SupplierItem) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      contactPerson: s.contactPerson || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      category: s.category || "HARDWARE",
      notes: s.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Nama supplier / perusahaan wajib diisi!");
      return;
    }

    setSubmitting(true);
    try {
      if (editingSupplier) {
        // PATCH
        const res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } else {
        // POST
        const res = await fetch("/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      }

      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (s: SupplierItem) => {
    if (!confirm(`Hapus data supplier '${s.name}'?`)) return;

    try {
      const res = await fetch(`/api/suppliers/${s.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers((prev) => prev.filter((item) => item.id !== s.id));
      } else {
        alert("Gagal menghapus supplier: " + data.error);
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
  const totalCount = suppliers.length;
  const hardwareCount = useMemo(
    () => suppliers.filter((s) => s.category === "HARDWARE").length,
    [suppliers]
  );
  const monitorCount = useMemo(
    () => suppliers.filter((s) => s.category === "MONITOR").length,
    [suppliers]
  );
  const storageCount = useMemo(
    () => suppliers.filter((s) => s.category === "STORAGE_RAM" || s.category === "LOGISTICS").length,
    [suppliers]
  );

  // Filtered List
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesCategory =
        selectedCategory === "ALL" || s.category === selectedCategory;

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [suppliers, selectedCategory, search]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">
      <AdminNav />

      <main className="p-3.5 sm:p-6 flex-1 flex flex-col gap-4 sm:gap-6 max-w-7xl mx-auto w-full">
        {/* Page Title & Quick Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Data Supplier &amp; Distributor K2C
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direktori mitra pemasok komponen PC, grosir monitor, memori RAM/SSD, dan logistik packing.
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
              onClick={fetchSuppliers}
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
              Tambah Supplier
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Distributor</span>
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {totalCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">mitra</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Pemasok resmi komponen K2C
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Hardware &amp; PC</span>
              <Cpu className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-orange-400">
              {hardwareCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">vendor</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Motherboard, Processor, Casing
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Grosir Monitor</span>
              <Monitor className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-cyan-400">
              {monitorCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">vendor</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              LED/LCD 16–24 inch eks-kantor
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Storage &amp; Logistik</span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-400">
              {storageCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">vendor</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              SSD, RAM, bubble wrap, kardus
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-2xl items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama supplier, kontak PIC, nomor telepon, atau alamat gudang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
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

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === "ALL"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Semua Kategori
            </button>
            {Object.entries(SUPPLIER_CATEGORIES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  selectedCategory === key
                    ? "bg-slate-800 text-white border-amber-500 shadow-sm"
                    : "bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                {val.icon}
                <span>{val.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 1. SHOPEE SELLER MOBILE SUPPLIER CARDS (Smartphone View) */}
        <div className="md:hidden space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              Memuat data supplier...
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">
                Tidak ada supplier ditemukan
              </p>
            </div>
          ) : (
            filteredSuppliers.map((s) => {
              const catInfo = SUPPLIER_CATEGORIES[s.category || "HARDWARE"] || {
                label: s.category || "Hardware",
                badge: "bg-slate-800 text-slate-300 border-slate-700",
                icon: <Layers className="w-3.5 h-3.5" />,
              };
              const waUrl = formatWhatsAppUrl(s.phone);

              return (
                <div
                  key={s.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{s.name}</div>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold border ${catInfo.badge} mt-0.5`}
                        >
                          {catInfo.icon}
                          <span>{catInfo.label}</span>
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

                  {s.contactPerson && (
                    <div className="text-[11px] text-slate-300">
                      PIC: <b className="text-white">{s.contactPerson}</b>
                      {s.phone && <span className="font-mono text-slate-400 ml-1.5">({s.phone})</span>}
                    </div>
                  )}

                  {s.address && (
                    <div className="text-[11px] text-slate-400 flex items-start gap-1 line-clamp-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{s.address}</span>
                    </div>
                  )}

                  {s.notes && (
                    <div className="text-[10px] text-slate-400 italic bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      {s.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <a
                      href="/admin/purchases"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <span>Lihat PO</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(s)}
                        className="px-3 py-1 rounded-lg bg-red-500/10 text-xs font-medium text-red-400"
                      >
                        Hapus
                      </button>
                    </div>
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
                  <th className="py-3.5 px-4 min-w-[220px]">Supplier / Perusahaan</th>
                  <th className="py-3.5 px-4">Kategori Pemasok</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Contact Person (PIC)</th>
                  <th className="py-3.5 px-4">Kontak Langsung</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Alamat Gudang / Kantor</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Catatan / Syarat Garansi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                      Memuat data distributor &amp; supplier...
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">
                        Tidak ada supplier yang cocok
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Coba sesuaikan pencarian atau tambahkan supplier baru.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((s) => {
                    const catInfo = SUPPLIER_CATEGORIES[s.category || "HARDWARE"] || {
                      label: s.category || "Hardware",
                      badge: "bg-slate-800 text-slate-300 border-slate-700",
                      icon: <Layers className="w-3.5 h-3.5" />,
                    };
                    const waUrl = formatWhatsAppUrl(s.phone);

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Company Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                                {s.name}
                              </div>
                              {s.email && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  <span>{s.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${catInfo.badge}`}
                          >
                            {catInfo.icon}
                            <span>{catInfo.label}</span>
                          </span>
                        </td>

                        {/* PIC */}
                        <td className="py-3 px-4">
                          <div className="text-slate-200 font-medium">
                            {s.contactPerson || "-"}
                          </div>
                        </td>

                        {/* Phone & WA */}
                        <td className="py-3 px-4">
                          {s.phone ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-200">{s.phone}</span>
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
                            <span className="text-slate-500 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Address */}
                        <td className="py-3 px-4">
                          {s.address ? (
                            <div className="text-slate-300 text-[11px] line-clamp-2 flex items-start gap-1 font-normal">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                              <span>{s.address}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-4">
                          {s.notes ? (
                            <span className="text-slate-400 text-[11px] line-clamp-2 font-normal">
                              {s.notes}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(s)}
                              title="Edit Supplier"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(s)}
                              title="Hapus Supplier"
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
              Menampilkan <b className="text-white">{filteredSuppliers.length}</b> dari{" "}
              {suppliers.length} supplier
            </span>
            <span className="text-[11px] text-slate-500">
              Manajemen rantai pasok dan RMA suku cadang K2C
            </span>
          </div>
        </div>
      </main>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  {editingSupplier ? "Edit Data Supplier" : "Tambah Supplier Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 flex flex-col gap-4">
              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Supplier / PT / Toko *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. PT Harco Jaya Abadi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori Pasokan
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {Object.entries(SUPPLIER_CATEGORIES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PIC & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Person (Nama PIC)
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                    placeholder="e.g. Hendra (Sales Manager)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="e.g. 081299887766"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Email & Address */}
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
                  placeholder="e.g. order@distributor.co.id"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Lengkap Kantor / Gudang
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Mall / Ruko / Sentra Niaga, Lantai, No. Toko, Kota..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Supplier (Termin, Kebijakan RMA/Garansi)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Contoh: Garansi distributor 1 tahun ganti baru, invoice tempo 14 hari..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
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
                  {editingSupplier ? "Simpan Perubahan" : "Tambahkan Supplier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

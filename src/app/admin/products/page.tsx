"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Package,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  SlidersHorizontal,
  DollarSign,
  Boxes,
  AlertTriangle,
  TrendingUp,
  Tag,
  Check,
  X,
  Copy,
  ChevronDown,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/Button";

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  description: string | null;
  createdAt: string;
}

const CATEGORY_MAP: Record<string, { label: string; badge: string; color: string }> = {
  PC_FULLSET: {
    label: "PC Fullset / CPU",
    badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    color: "from-indigo-600 to-violet-600",
  },
  MONITOR: {
    label: "Monitor LED/LCD",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    color: "from-cyan-600 to-blue-600",
  },
  VGA: {
    label: "VGA Card",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    color: "from-emerald-600 to-teal-600",
  },
  PROCESSOR: {
    label: "Processor & HSF",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    color: "from-amber-600 to-orange-600",
  },
  STORAGE_RAM: {
    label: "Storage & RAM",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    color: "from-blue-600 to-sky-600",
  },
  ACCESSORY: {
    label: "Aksesoris & Lainnya",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    color: "from-purple-600 to-pink-600",
  },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW" | "OUT">("ALL");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "PC_FULLSET",
    price: "",
    costPrice: "",
    stock: "0",
    description: "",
  });

  const fetchProducts = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error("Gagal memuat produk:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: "K2C-" + Math.floor(1000 + Math.random() * 9000),
      name: "",
      category: "PC_FULLSET",
      price: "",
      costPrice: "",
      stock: "5",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      costPrice: p.costPrice.toString(),
      stock: p.stock.toString(),
      description: p.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim() || !formData.price) {
      alert("Mohon isi SKU, Nama Produk, dan Harga Jual!");
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        // PATCH
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            price: Number(formData.price),
            costPrice: Number(formData.costPrice) || 0,
            stock: Number(formData.stock) || 0,
            description: formData.description,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } else {
        // POST
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: formData.sku,
            name: formData.name,
            category: formData.category,
            price: Number(formData.price),
            costPrice: Number(formData.costPrice) || 0,
            stock: Number(formData.stock) || 0,
            description: formData.description,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (p: ProductItem) => {
    if (!confirm(`Hapus produk '${p.name}' (${p.sku})?`)) return;

    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((item) => item.id !== p.id));
      } else {
        alert("Gagal menghapus produk: " + data.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleQuickStockUpdate = async (p: ProductItem, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, stock: newStock } : item))
        );
      }
    } catch (e) {
      console.error("Gagal update stok:", e);
    }
  };

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1500);
  };

  // KPIs
  const totalProducts = products.length;
  const totalInventoryValue = useMemo(
    () => products.reduce((acc, p) => acc + p.price * p.stock, 0),
    [products]
  );
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => p.stock === 0).length,
    [products]
  );

  // Filtered List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "ALL" || p.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === "LOW") matchesStock = p.stock > 0 && p.stock <= 5;
      if (stockFilter === "OUT") matchesStock = p.stock === 0;

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchesCategory && matchesStock && matchesSearch;
    });
  }, [products, selectedCategory, stockFilter, search]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">
      <AdminNav />

      <main className="p-3.5 sm:p-6 flex-1 flex flex-col gap-4 sm:gap-6 max-w-7xl mx-auto w-full">
        {/* Page Title & Quick Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Katalog Produk K2C
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Data riil produk PC rakitan, monitor, sparepart &amp; periferal (diambil dari pc-workshop-hub).
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
              onClick={fetchProducts}
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
              Tambah Produk
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Produk</span>
              <Boxes className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {totalProducts}
              <span className="text-xs font-normal text-slate-400 ml-1.5">item SKU</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Katalog aktif di sistem POS &amp; Hub
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Estimasi Nilai Stok</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-xl font-black text-emerald-400">
              Rp {totalInventoryValue.toLocaleString("id-ID")}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Valuasi persediaan siap jual
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Stok Menipis (≤5)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-400">
              {lowStockCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">produk</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Perlu restock segera ke supplier
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Stok Habis (0)</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-red-400">
              {outOfStockCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">produk</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Habis / tidak tersedia untuk order
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama produk, SKU, atau varian spesifikasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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

            {/* Quick Stock Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap mr-1">
                Stok:
              </span>
              <button
                onClick={() => setStockFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  stockFilter === "ALL"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStockFilter("LOW")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  stockFilter === "LOW"
                    ? "bg-amber-600 text-white font-semibold"
                    : "bg-slate-800 text-slate-400 hover:text-amber-300"
                }`}
              >
                Menipis ({lowStockCount})
              </button>
              <button
                onClick={() => setStockFilter("OUT")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  stockFilter === "OUT"
                    ? "bg-red-600 text-white font-semibold"
                    : "bg-slate-800 text-slate-400 hover:text-red-300"
                }`}
              >
                Habis ({outOfStockCount})
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800/60">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === "ALL"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              Semua Kategori
            </button>
            {Object.entries(CATEGORY_MAP).map(([catKey, catVal]) => {
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-slate-800 text-white border-blue-500 shadow-sm"
                      : "bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  {catVal.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. SHOPEE SELLER MOBILE PRODUCT CARDS (Smartphone View) */}
        <div className="md:hidden space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              Memuat katalog produk...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Package className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">
                Tidak ada produk ditemukan
              </p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const catInfo = CATEGORY_MAP[p.category] || {
                label: p.category,
                badge: "bg-slate-800 text-slate-300 border-slate-700",
              };

              return (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md"
                >
                  {/* Top: SKU & Category Badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-blue-400 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      {p.sku}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${catInfo.badge}`}
                    >
                      {catInfo.label}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {p.name}
                  </h4>

                  {/* Price, Margin & Stock Stepper */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <div className="text-sm font-black font-mono text-white">
                        Rp {p.price.toLocaleString("id-ID")}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Modal: Rp {p.costPrice.toLocaleString("id-ID")}
                      </div>
                    </div>

                    {/* Touch Friendly Stock Controls */}
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => handleQuickStockUpdate(p, -1)}
                        disabled={p.stock <= 0}
                        className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm disabled:opacity-30"
                      >
                        -
                      </button>
                      <span
                        className={`w-8 text-center font-mono font-bold text-xs ${
                          p.stock === 0
                            ? "text-red-400"
                            : p.stock <= 5
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {p.stock}
                      </span>
                      <button
                        onClick={() => handleQuickStockUpdate(p, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/40">
                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p)}
                      className="px-3 py-1 rounded-lg bg-red-500/10 text-xs font-medium text-red-400 hover:bg-red-500/20"
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
                  <th className="py-3.5 px-4">SKU / Kode</th>
                  <th className="py-3.5 px-4 min-w-[280px]">Nama Produk &amp; Spesifikasi</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-right">Harga Jual</th>
                  <th className="py-3.5 px-4 text-right">Modal / HPP</th>
                  <th className="py-3.5 px-4 text-center">Stok</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      Memuat katalog produk...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Package className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">
                        Tidak ada produk yang cocok
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Coba ubah kata kunci pencarian atau filter kategori.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const catInfo = CATEGORY_MAP[p.category] || {
                      label: p.category,
                      badge: "bg-slate-800 text-slate-300 border-slate-700",
                    };
                    const profit = p.price - p.costPrice;
                    const margin = p.price > 0 ? Math.round((profit / p.price) * 100) : 0;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* SKU */}
                        <td className="py-3 px-4 font-mono">
                          <button
                            onClick={() => handleCopySku(p.sku)}
                            title="Salin SKU"
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <span>{p.sku}</span>
                            {copiedSku === p.sku ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100" />
                            )}
                          </button>
                        </td>

                        {/* Name & Specs */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {p.name}
                          </div>
                          {p.description && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                              {p.description}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${catInfo.badge}`}
                          >
                            {catInfo.label}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          Rp {p.price.toLocaleString("id-ID")}
                        </td>

                        {/* Cost Price */}
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          <div>Rp {p.costPrice.toLocaleString("id-ID")}</div>
                          {profit > 0 && (
                            <div className="text-[10px] text-emerald-400 font-sans">
                              +{margin}% margin
                            </div>
                          )}
                        </td>

                        {/* Stock & Quick Adjust */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                            <button
                              onClick={() => handleQuickStockUpdate(p, -1)}
                              disabled={p.stock <= 0}
                              className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              -
                            </button>
                            <span
                              className={`w-8 text-center font-mono font-bold ${
                                p.stock === 0
                                  ? "text-red-400"
                                  : p.stock <= 5
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              {p.stock}
                            </span>
                            <button
                              onClick={() => handleQuickStockUpdate(p, 1)}
                              className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              title="Edit Produk"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              title="Hapus Produk"
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

          {/* Table Footer info */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Menampilkan <b className="text-white">{filteredProducts.length}</b> dari{" "}
              {products.length} produk
            </span>
            <span className="text-[11px] text-slate-500">
              Sinkron otomatis dengan POS &amp; teknisi
            </span>
          </div>
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  {editingProduct ? "Edit Informasi Produk" : "Tambah Produk Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kode SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value.toUpperCase() })
                    }
                    disabled={!!editingProduct}
                    placeholder="e.g. PC-I5-8-128"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Produk &amp; Tipe *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. PC Komputer Core i5 RAM 8GB SSD 128GB LCD 19 Wide"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Prices & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Harga Jual (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="2500000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Harga Modal (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: e.target.value })
                    }
                    placeholder="1900000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jumlah Stok
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deskripsi / Spesifikasi Rinci
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detail spesifikasi: Motherboard, RAM, Penyimpanan, Garansi, dll..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
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
                  {editingProduct ? "Simpan Perubahan" : "Tambahkan ke Katalog"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

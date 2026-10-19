"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  ShoppingBag,
  Package,
  Search,
  X,
  UserCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/admin/AdminNav";

interface OrderItemInput {
  itemName: string;
  qty: number;
  price: number;
  serialNumber: string;
}

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface CustomerItem {
  id: string;
  name: string;
  phone: string | null;
  marketplace: string | null;
}

export default function NewOrderPage() {
  const router = useRouter();

  const [marketplace, setMarketplace] = useState("Tokopedia");
  const [orderNumber, setOrderNumber] = useState(
    `ORD-TKP-${Date.now().toString().slice(-6)}`
  );
  const [receiptNumber, setReceiptNumber] = useState(
    `TKP${Math.floor(100000000 + Math.random() * 900000000)}`
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<OrderItemInput[]>([
    {
      itemName: "PC CPU Komputer Core i5 RAM 8GB HDD 500GB LCD 16 Inch Wide Siap Pakai",
      qty: 1,
      price: 1950000,
      serialNumber: "",
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Catalog picker modal
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [productsCatalog, setProductsCatalog] = useState<ProductItem[]>([]);
  const [customersList, setCustomersList] = useState<CustomerItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("ALL");

  useEffect(() => {
    // Load products
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.products) {
          setProductsCatalog(data.products);
        }
      })
      .catch((e) => console.error("Error loading products:", e));

    // Load customers
    fetch("/api/customers")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.customers) {
          setCustomersList(data.customers);
        }
      })
      .catch((e) => console.error("Error loading customers:", e));
  }, []);

  const handleMarketplaceChange = (mp: string) => {
    setMarketplace(mp);
    const prefix =
      mp === "Tokopedia"
        ? "TKP"
        : mp === "Shopee"
        ? "SPXID"
        : mp === "TikTok Shop"
        ? "TTS"
        : "K2C-POS";

    setOrderNumber(`ORD-${prefix}-${Date.now().toString().slice(-6)}`);
    setReceiptNumber(
      `${prefix}${Math.floor(100000000 + Math.random() * 900000000)}`
    );
  };

  const handleSelectCustomer = (c: CustomerItem) => {
    setCustomerName(c.name);
    if (c.phone) setCustomerPhone(c.phone);
    if (c.marketplace) setMarketplace(c.marketplace);
  };

  const addItem = (presetName?: string, presetPrice?: number) => {
    setItems([
      ...items,
      {
        itemName: presetName || "",
        qty: 1,
        price: presetPrice || 0,
        serialNumber: "",
      },
    ]);
  };

  const handleAddFromCatalog = (p: ProductItem) => {
    addItem(p.name, p.price);
    setIsCatalogOpen(false);
  };

  const updateItem = (index: number, field: keyof OrderItemInput, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber || !receiptNumber || !customerName) {
      alert("Harap isi Nomor Order, Nomor Resi, dan Nama Pelanggan.");
      return;
    }

    if (items.length === 0 || !items[0].itemName.trim()) {
      alert("Harap isi setidaknya satu produk.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          receiptNumber,
          marketplace,
          customerName,
          customerPhone,
          items,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        alert("Gagal membuat order: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered catalog
  const filteredCatalog = productsCatalog.filter((p) => {
    const matchesCat =
      catalogCategory === "ALL" || p.category === catalogCategory;
    const q = catalogSearch.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNav />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Top Breadcrumb & Action */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Live Orders &amp; Dispatch Board</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-500">
            Formulir POS / Invoice Internal
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-blue-500" />
            Buat Pesanan &amp; Antrean QC Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Input pesanan penjualan manual atau sinkronisasi marketplace untuk proses verifikasi teknisi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Marketplace Channel Selector */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Sumber Channel Marketplace *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: "Tokopedia", color: "hover:border-emerald-500 hover:text-emerald-400" },
                { name: "Shopee", color: "hover:border-orange-500 hover:text-orange-400" },
                { name: "TikTok Shop", color: "hover:border-pink-500 hover:text-pink-400" },
                { name: "Offline", color: "hover:border-blue-500 hover:text-blue-400" },
              ].map((m) => {
                const isSelected = marketplace === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => handleMarketplaceChange(m.name)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm"
                        : `bg-slate-950 border-slate-800 text-slate-400 ${m.color}`
                    }`}
                  >
                    {m.name === "Offline" ? "Offline (Toko Fisik)" : m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order & Customer Details */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nomor Resi Pengiriman (Receipt / Tracking #) *
              </label>
              <input
                type="text"
                required
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="Contoh: TKP98234182910X"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs font-mono text-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nomor Pesanan (Order ID) *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Contoh: ORD-TKP-20261019-001"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs font-mono text-white focus:outline-none"
              />
            </div>

            {/* Customer Name with quick select */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Nama Pelanggan / Pembeli *
                </label>
                {customersList.length > 0 && (
                  <span className="text-[10px] text-slate-500">
                    {customersList.length} pelanggan tersimpan
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none"
              />
              {/* Quick Customer Chips */}
              {customersList.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-slate-500 shrink-0">Pilih:</span>
                  {customersList.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCustomer(c)}
                      className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 whitespace-nowrap"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nomor WhatsApp Pelanggan (Opsional)
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Product Items Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  Daftar Barang Pesanan
                </h3>
                <p className="text-xs text-slate-400">
                  Pilih langsung dari katalog produk K2C atau ketik custom.
                </p>
              </div>

              {/* Action to Open Catalog */}
              <button
                type="button"
                onClick={() => setIsCatalogOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Pilih dari Katalog ({productsCatalog.length} Produk)</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  {/* Item name */}
                  <div className="sm:col-span-5">
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Nama Produk / Komponen
                    </label>
                    <input
                      type="text"
                      required
                      value={item.itemName}
                      onChange={(e) => updateItem(index, "itemName", e.target.value)}
                      placeholder="Nama unit / komponen"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Qty</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(index, "qty", parseInt(e.target.value) || 1)
                      }
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  {/* Price */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Harga Satuan (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      required
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, "price", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  {/* Serial Number */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      No. Seri (Opsional)
                    </label>
                    <input
                      type="text"
                      value={item.serialNumber}
                      onChange={(e) =>
                        updateItem(index, "serialNumber", e.target.value)
                      }
                      placeholder="SN-XXX"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  {/* Delete button */}
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 disabled:opacity-30 disabled:hover:text-slate-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                onClick={() => addItem()}
                variant="secondary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              >
                Tambah Baris Kosong
              </Button>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Harga: </span>
                <span className="text-base font-bold text-white font-mono ml-2">
                  Rp {calculateTotal().toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/admin">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<Save className="w-4 h-4" />}
            >
              Simpan &amp; Masukkan ke Antrean QC
            </Button>
          </div>
        </form>
      </div>

      {/* Catalog Quick Picker Modal */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Pilih Produk dari Katalog K2C
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Klik produk untuk memasukkannya ke form pesanan baru.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCatalogOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama unit PC, monitor, SKU..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {["ALL", "PC_FULLSET", "MONITOR", "VGA", "STORAGE_RAM", "PROCESSOR"].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCatalogCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                        catalogCategory === cat
                          ? "bg-blue-600 text-white"
                          : "bg-slate-950 text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat === "ALL"
                        ? "Semua"
                        : cat === "PC_FULLSET"
                        ? "PC Fullset"
                        : cat === "STORAGE_RAM"
                        ? "Storage & RAM"
                        : cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Product items list */}
            <div className="p-4 overflow-y-auto divide-y divide-slate-800/60 max-h-[50vh]">
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tidak ada produk yang cocok dengan pencarian.
                </div>
              ) : (
                filteredCatalog.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleAddFromCatalog(p)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                          {p.sku}
                        </span>
                        <span className="text-xs font-semibold text-white group-hover:text-blue-300">
                          {p.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Stok tersedia:{" "}
                        <b
                          className={
                            p.stock === 0 ? "text-red-400" : "text-emerald-400"
                          }
                        >
                          {p.stock} unit
                        </b>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-xs text-white">
                        Rp {p.price.toLocaleString("id-ID")}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3 h-3" />
                        Pilih
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>{filteredCatalog.length} produk ditampilkan</span>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setIsCatalogOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

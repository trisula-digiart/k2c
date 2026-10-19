"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Sparkles,
  ShoppingBag,
  Package,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OrderItemInput {
  itemName: string;
  qty: number;
  price: number;
  serialNumber: string;
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
      itemName: "PC Rakitan Gaming Core i5 + RTX 4060",
      qty: 1,
      price: 12500000,
      serialNumber: "",
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

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

    if (items.some((i) => !i.itemName.trim())) {
      alert("Harap isi semua nama barang produk.");
      return;
    }

    setSubmitting(true);
    try {
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
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan pesanan baru.");
      }

      alert("Pesanan berhasil dibuat! Antrean siap untuk proses QC teknisi.");
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">Input Pesanan Baru</h1>
              <p className="text-xs text-slate-400">
                Pencatatan Order Marketplace &amp; Offline Kasir K2C
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Marketplace Selector */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Pilih Sumber Saluran Penjualan:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {["Tokopedia", "Shopee", "TikTok Shop", "Offline"].map((mp) => (
                <button
                  key={mp}
                  type="button"
                  onClick={() => handleMarketplaceChange(mp)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    marketplace === mp
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {mp}
                </button>
              ))}
            </div>
          </div>

          {/* Order & Customer Details */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nomor Resi Pengiriman (Receipt / Tracking #) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Contoh: TKP98234182910X"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-mono text-sky-400 focus:outline-none"
                />
              </div>
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
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nama Pelanggan / Pembeli *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm text-white focus:outline-none"
              />
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
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Product Items Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  Daftar Barang Pesanan
                </h3>
                <p className="text-xs text-slate-400">
                  Nomor seri (SN) dapat diisi sekarang atau oleh teknisi saat proses QC.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => addItem("SSD NVMe Kingston 1TB", 1050000)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                >
                  + SSD 1TB
                </button>
                <button
                  type="button"
                  onClick={() => addItem("RAM DDR4 16GB (2x8GB)", 650000)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                >
                  + RAM 16GB
                </button>
                <button
                  type="button"
                  onClick={() => addItem("Monitor Gaming 24 Inch", 1950000)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                >
                  + Monitor
                </button>
              </div>
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
                Tambah Baris Produk
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
          <div className="flex items-center justify-end gap-3 pt-4">
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
    </div>
  );
}

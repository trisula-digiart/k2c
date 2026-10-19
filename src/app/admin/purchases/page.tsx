"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  ShoppingBag,
  Search,
  Plus,
  RefreshCw,
  Building2,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Boxes,
  ArrowRight,
  DollarSign,
  AlertCircle,
  MessageCircle,
  Truck,
  FileText,
} from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/Button";

interface PurchaseOrderItem {
  id: string;
  productId: string | null;
  itemName: string;
  qty: number;
  costPrice: number;
  receivedQty: number;
  product?: {
    sku: string;
    name: string;
    stock: number;
  } | null;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  invoiceNumber: string | null;
  supplierId: string;
  supplier: {
    id: string;
    name: string;
    contactPerson: string | null;
    phone: string | null;
  };
  status: "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";
  totalAmount: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  notes: string | null;
  items: PurchaseOrderItem[];
  createdAt: string;
}

interface SupplierOption {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
}

interface ProductOption {
  id: string;
  sku: string;
  name: string;
  costPrice: number;
  stock: number;
}

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Suppliers & Products for Form
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  // New PO Form Data
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"UNPAID" | "PAID">("UNPAID");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<
    Array<{ productId?: string; itemName: string; qty: number; costPrice: number }>
  >([
    {
      productId: "",
      itemName: "",
      qty: 1,
      costPrice: 0,
    },
  ]);

  const fetchPurchaseOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/purchase-orders");
      const data = await res.json();
      if (data.success) {
        setPurchaseOrders(data.purchaseOrders || []);
      }
    } catch (e) {
      console.error("Gagal memuat purchase orders:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();

    // Fetch suppliers
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSuppliers(d.suppliers || []);
      })
      .catch(console.error);

    // Fetch products
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts(d.products || []);
      })
      .catch(console.error);
  }, []);

  const openAddModal = () => {
    if (suppliers.length > 0) {
      setSelectedSupplierId(suppliers[0].id);
    }
    setInvoiceNumber("");
    setPaymentStatus("UNPAID");
    setNotes("");

    // Set default item if products available
    if (products.length > 0) {
      setItems([
        {
          productId: products[0].id,
          itemName: products[0].name,
          qty: 5,
          costPrice: products[0].costPrice || 0,
        },
      ]);
    } else {
      setItems([{ productId: "", itemName: "", qty: 1, costPrice: 0 }]);
    }
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems([...items, { productId: "", itemName: "", qty: 1, costPrice: 0 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSelectProductForItem = (idx: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updated = [...items];
    if (prod) {
      updated[idx] = {
        productId: prod.id,
        itemName: prod.name,
        qty: updated[idx].qty || 1,
        costPrice: prod.costPrice || 0,
      };
    } else {
      updated[idx].productId = "";
    }
    setItems(updated);
  };

  const handleUpdateItem = (idx: number, field: string, val: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    setItems(updated);
  };

  const calculateFormTotal = () => {
    return items.reduce(
      (sum, it) => sum + (Number(it.costPrice) || 0) * (Number(it.qty) || 1),
      0
    );
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      alert("Pilih supplier terlebih dahulu!");
      return;
    }
    if (items.length === 0 || !items[0].itemName.trim()) {
      alert("Masukkan minimal 1 item produk yang dibeli.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          invoiceNumber,
          paymentStatus,
          notes,
          items,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPurchaseOrders();
      } else {
        alert("Gagal membuat PO: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // REAL INVENTORY STOCK INCREMENT: Receive Goods
  const handleReceiveGoods = async (po: PurchaseOrder) => {
    if (
      !confirm(
        `Konfirmasi penerimaan barang untuk ${po.poNumber}?\n\nStok seluruh produk dalam pesanan ini akan langsung bertambah ke katalog inventaris toko.`
      )
    )
      return;

    try {
      setReceivingId(po.id);
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "RECEIVED",
          paymentStatus: po.paymentStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Berhasil! Barang telah diterima dan stok gudang otomatis diperbarui.`);
        fetchPurchaseOrders();
      } else {
        alert("Gagal memproses penerimaan: " + data.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setReceivingId(null);
    }
  };

  const handleDeletePO = async (po: PurchaseOrder) => {
    if (!confirm(`Hapus Purchase Order '${po.poNumber}'?`)) return;

    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPurchaseOrders((prev) => prev.filter((p) => p.id !== po.id));
      } else {
        alert("Gagal menghapus: " + data.error);
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
  const totalPO = purchaseOrders.length;
  const orderedCount = useMemo(
    () => purchaseOrders.filter((p) => p.status === "ORDERED").length,
    [purchaseOrders]
  );
  const receivedCount = useMemo(
    () => purchaseOrders.filter((p) => p.status === "RECEIVED").length,
    [purchaseOrders]
  );
  const totalSpent = useMemo(
    () => purchaseOrders.reduce((sum, p) => sum + p.totalAmount, 0),
    [purchaseOrders]
  );

  // Filtered List
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((p) => {
      const matchesStatus =
        selectedStatus === "ALL" || p.status === selectedStatus;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.poNumber.toLowerCase().includes(q) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q)) ||
        p.supplier.name.toLowerCase().includes(q) ||
        p.items.some((i) => i.itemName.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [purchaseOrders, selectedStatus, search]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">
      <AdminNav />

      <main className="p-3 sm:p-6 flex-1 flex flex-col gap-4 sm:gap-6 max-w-7xl mx-auto w-full">
        {/* Page Title & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Order Pembelian Supplier (PO)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pengadaan barang masuk dari supplier &amp; penambahan stok otomatis ke katalog toko.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
              }
              onClick={fetchPurchaseOrders}
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
              Buat PO Baru
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total PO Masuk</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-white">
              {totalPO}
              <span className="text-xs font-normal text-slate-400 ml-1.5">faktur</span>
            </div>
            <div className="mt-1 text-[10px] sm:text-[11px] text-slate-500">
              Riwayat pengadaan hardware
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Menunggu Barang</span>
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-amber-400">
              {orderedCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">pesanan</span>
            </div>
            <div className="mt-1 text-[10px] sm:text-[11px] text-slate-500">
              Dalam pengiriman supplier
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Barang Diterima</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-400">
              {receivedCount}
              <span className="text-xs font-normal text-slate-400 ml-1.5">pesanan</span>
            </div>
            <div className="mt-1 text-[10px] sm:text-[11px] text-slate-500">
              Stok sudah masuk ke gudang
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Nilai Belanja</span>
              <DollarSign className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-black text-sky-400">
              Rp {totalSpent.toLocaleString("id-ID")}
            </div>
            <div className="mt-1 text-[10px] sm:text-[11px] text-slate-500">
              Modal pengadaan suku cadang
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 p-3 sm:p-4 bg-slate-900/70 border border-slate-800 rounded-2xl items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari No. PO, Supplier, No. Faktur, atau nama barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: "ALL", label: "Semua PO" },
              { id: "ORDERED", label: "Menunggu Datang" },
              { id: "RECEIVED", label: "Diterima (Stok Masuk)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. SHOPEE SELLER STYLE MOBILE CARD VIEW (Phone/Tablet) */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              Memuat data purchase orders...
            </div>
          ) : filteredPOs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">
                Belum ada Purchase Order
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Klik tombol &quot;Buat PO Baru&quot; untuk mencatat order pembelian dari supplier.
              </p>
            </div>
          ) : (
            filteredPOs.map((po) => {
              const isReceived = po.status === "RECEIVED";
              const waUrl = formatWhatsAppUrl(po.supplier.phone);

              return (
                <div
                  key={po.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
                >
                  {/* Card Header: Supplier & Status */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">
                          {po.supplier.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {po.poNumber}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isReceived
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                      }`}
                    >
                      {isReceived ? "Diterima (Stok Masuk)" : "Menunggu Datang"}
                    </span>
                  </div>

                  {/* Items List (Shopee Seller Product Rows) */}
                  <div className="space-y-2 py-1">
                    {po.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-start justify-between text-xs"
                      >
                        <div className="flex items-start gap-2 pr-2">
                          <Package className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-200 font-medium">
                              {it.itemName}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {it.qty} unit × Rp {it.costPrice.toLocaleString("id-ID")}
                            </div>
                          </div>
                        </div>
                        <div className="font-mono font-semibold text-white shrink-0 text-right">
                          Rp {(it.qty * it.costPrice).toLocaleString("id-ID")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer: Total & Action Button */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">Total Belanja</div>
                      <div className="text-sm font-bold font-mono text-white">
                        Rp {po.totalAmount.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WA</span>
                        </a>
                      )}

                      {!isReceived ? (
                        <button
                          onClick={() => handleReceiveGoods(po)}
                          disabled={receivingId === po.id}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {receivingId === po.id ? "Memproses..." : "Terima Barang"}
                          </span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Stok Aktif</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. DESKTOP ERP HIGH-DENSITY TABLE (PC View) */}
        <div className="hidden md:block rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">No. PO &amp; Faktur</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Supplier</th>
                  <th className="py-3.5 px-4 min-w-[280px]">Daftar Barang Masuk</th>
                  <th className="py-3.5 px-4 text-right">Total Belanja</th>
                  <th className="py-3.5 px-4 text-center">Status Barang</th>
                  <th className="py-3.5 px-4 text-center">Pembayaran</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      Memuat Purchase Orders...
                    </td>
                  </tr>
                ) : filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">
                        Tidak ada Purchase Order
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Buat PO baru untuk mencatat pengadaan barang dari supplier.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map((po) => {
                    const isReceived = po.status === "RECEIVED";
                    const waUrl = formatWhatsAppUrl(po.supplier.phone);

                    return (
                      <tr
                        key={po.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* PO & Invoice */}
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-white">{po.poNumber}</div>
                          {po.invoiceNumber && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Faktur: {po.invoiceNumber}
                            </div>
                          )}
                        </td>

                        {/* Supplier */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">
                            {po.supplier.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-slate-400">
                              {po.supplier.contactPerson || po.supplier.phone}
                            </span>
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 inline-flex items-center"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Items */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {po.items.map((it) => (
                              <div
                                key={it.id}
                                className="flex items-center justify-between text-[11px]"
                              >
                                <span className="text-slate-300 font-medium">
                                  {it.itemName}
                                </span>
                                <span className="font-mono text-slate-400 ml-2">
                                  {it.qty} × Rp {it.costPrice.toLocaleString("id-ID")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          Rp {po.totalAmount.toLocaleString("id-ID")}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isReceived
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                            }`}
                          >
                            {isReceived ? "Diterima (Stok Masuk)" : "Menunggu Datang"}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              po.paymentStatus === "PAID"
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {po.paymentStatus === "PAID" ? "Lunas" : "Belum Lunas"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isReceived ? (
                              <Button
                                variant="primary"
                                size="xs"
                                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                onClick={() => handleReceiveGoods(po)}
                                disabled={receivingId === po.id}
                              >
                                {receivingId === po.id ? "Memproses..." : "Terima Barang"}
                              </Button>
                            ) : (
                              <span className="text-[11px] text-emerald-400 font-semibold px-2">
                                Selesai
                              </span>
                            )}
                            <button
                              onClick={() => handleDeletePO(po)}
                              title="Hapus PO"
                              className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800"
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
        </div>
      </main>

      {/* Modal Buat PO Pembelian Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Buat Order Pembelian Supplier (PO)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Barang yang diterima akan langsung menambah stok katalog toko.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="p-5 flex flex-col gap-4 overflow-y-auto">
              {/* Supplier & Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pilih Supplier *
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.contactPerson || "Vendor"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    No. Faktur / Nota Supplier (Opsional)
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Contoh: INV-NJ-2026-081"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Daftar Barang yang Dipesan *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      {/* Product select or custom name */}
                      <div className="sm:col-span-6">
                        <select
                          value={it.productId || ""}
                          onChange={(e) =>
                            handleSelectProductForItem(idx, e.target.value)
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white mb-1 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">-- Ketik Nama Manual --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.sku}] {p.name} (Stok: {p.stock})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          required
                          value={it.itemName}
                          onChange={(e) =>
                            handleUpdateItem(idx, "itemName", e.target.value)
                          }
                          placeholder="Nama Barang / Spesifikasi"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                        />
                      </div>

                      {/* Qty */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          Jumlah (Qty)
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={it.qty}
                          onChange={(e) =>
                            handleUpdateItem(idx, "qty", parseInt(e.target.value) || 1)
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white text-center focus:outline-none"
                        />
                      </div>

                      {/* Cost Price */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          Harga Beli (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          value={it.costPrice}
                          onChange={(e) =>
                            handleUpdateItem(
                              idx,
                              "costPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                        />
                      </div>

                      {/* Delete row */}
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          disabled={items.length <= 1}
                          className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Catatan Pembelian (Tempo, Pengiriman)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Pengiriman via kurir toko, bayar tempo 7 hari..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col justify-end bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
                  <div className="text-xs text-slate-400">Total Pembelian:</div>
                  <div className="text-lg font-black font-mono text-emerald-400">
                    Rp {calculateFormTotal().toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
                  Simpan Order Pembelian
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";

export default function InvoicePrintPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const initialFormat = (searchParams.get("format") as "58mm" | "80mm" | "A4") || "80mm";
  const [format, setFormat] = useState<"58mm" | "80mm" | "A4">(initialFormat);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/orders/${id}/status`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error("Failed to load invoice order:", e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchInvoice();
  }, [id]);

  const calculateTotal = () => {
    return (order?.items || []).reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.qty || 1),
      0
    );
  };

  const publicUrl =
    typeof window !== "undefined" && order
      ? `${window.location.origin}/qc-public/${order.publicToken}`
      : `/qc-public/${order?.publicToken || ""}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <p className="text-sm">Memuat dokumen invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-400">
        <p className="text-base text-white font-bold mb-2">Invoice Tidak Ditemukan</p>
        <Link href="/admin">
          <Button variant="secondary">Kembali ke Admin</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 print:bg-white text-slate-900 flex flex-col items-center">
      {/* Non-printing Control Toolbar */}
      <header className="print:hidden w-full bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-sm font-bold text-white">Pratinjau &amp; Cetak Dokumen</h2>
              <p className="text-xs text-slate-400 font-mono">
                Resi: {order.receiptNumber} | Order: {order.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format selection */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(["58mm", "80mm", "A4"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    format === fmt
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {fmt === "A4" ? "Standar A4" : `Thermal ${fmt}`}
                </button>
              ))}
            </div>

            <Button
              onClick={() => window.print()}
              variant="primary"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
            >
              Cetak (Ctrl + P)
            </Button>
          </div>
        </div>
      </header>

      {/* Main Printable Document */}
      <main className="p-4 sm:p-8 flex justify-center w-full">
        {format === "A4" ? (
          // ==================== A4 STANDARD INVOICE ====================
          <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-10 shadow-2xl rounded-sm print:shadow-none print:p-0 print:w-full print:m-0 font-sans flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                    K2C KOMPUTINDO
                  </h1>
                  <p className="text-xs font-medium text-slate-700">
                    Pusat Komputer Rakitan Gaming, Sparepart &amp; Servis Bergaransi
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Jl. Veteran Raya No. 42 | WA: 0812-3456-7890 | Email: cs@k2ckomputindo.id
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-slate-950 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2">
                    INVOICE RESMI
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-900">
                    No. {order.orderNumber}
                  </p>
                  <p className="text-xs text-slate-600">
                    Tgl: {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Order & Customer Metadata */}
              <div className="grid grid-cols-2 gap-6 mb-8 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Tujuan Pengiriman / Pelanggan:
                  </p>
                  <p className="font-bold text-sm text-slate-950 mt-1">
                    {order.customerName}
                  </p>
                  <p className="text-slate-600 font-mono mt-0.5">
                    Telp / WA: {order.customerPhone || "-"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Saluran Marketplace &amp; Ekspedisi:
                  </p>
                  <p className="font-bold text-sm text-slate-950 mt-1">
                    {order.marketplace}
                  </p>
                  <p className="text-slate-900 font-mono font-bold mt-0.5">
                    No. Resi: {order.receiptNumber}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs mb-8 border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-900 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Deskripsi Produk &amp; Serial Number</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 align-top font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="font-bold text-slate-900">{item.itemName}</div>
                        {item.serialNumber ? (
                          <div className="text-[10px] font-mono text-blue-700 mt-0.5 font-semibold">
                            S/N: {item.serialNumber} (Garansi Resmi Tercatat)
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            S/N: Non-serialized / Unit Baru
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top text-center font-mono">
                        {item.qty}
                      </td>
                      <td className="py-3 px-3 align-top text-right font-mono">
                        Rp {item.price.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 align-top text-right font-mono font-bold text-slate-950">
                        Rp {(item.price * item.qty).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold text-sm">
                    <td colSpan={4} className="py-3 px-3 text-right">
                      TOTAL PEMBAYARAN:
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-950">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Anti-Fraud QC QR Verification Badge */}
              <div className="p-4 rounded-xl border-2 border-dashed border-blue-500 bg-blue-50/50 flex items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-xs uppercase text-blue-900">
                      Jaminan Keaslian &amp; Pengujian Unit (QC Video)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 max-w-lg leading-relaxed">
                    Setiap unit rakitan dan komponen diuji fungsional sebelum dikirim.
                    Pindai QR code di samping untuk melihat rekaman video QC unit Anda dan
                    bukti serah terima gerai secara transparan.
                  </p>
                  <p className="text-[10px] font-mono text-blue-600">
                    URL Verifikasi: {publicUrl}
                  </p>
                </div>

                <div className="flex flex-col items-center bg-white p-2.5 rounded-lg border border-slate-200 shrink-0">
                  <QRCodeSVG value={publicUrl} size={100} level="M" />
                  <span className="text-[9px] font-bold text-slate-800 mt-1 uppercase">
                    Scan QC Video
                  </span>
                </div>
              </div>
            </div>

            {/* Terms and Signatures */}
            <div className="border-t border-slate-200 pt-6">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <p className="text-slate-600 mb-14">Bagian QC / Teknisi</p>
                  <div className="border-t border-slate-400 mx-6 pt-1 font-semibold text-slate-900">
                    ( Teknisi K2C )
                  </div>
                </div>

                <div>
                  <p className="text-slate-600 mb-14">Petugas Gudang / Dispatch</p>
                  <div className="border-t border-slate-400 mx-6 pt-1 font-semibold text-slate-900">
                    ( Admin Kasir )
                  </div>
                </div>

                <div>
                  <p className="text-slate-600 mb-14">Kurir / Pelanggan Penerima</p>
                  <div className="border-t border-slate-400 mx-6 pt-1 font-semibold text-slate-900">
                    ( {order.customerName} )
                  </div>
                </div>
              </div>

              <p className="text-center text-[10px] text-slate-400 mt-6">
                K2C KOMPUTINDO — Simpan faktur ini sebagai bukti klaim garansi yang sah.
              </p>
            </div>
          </div>
        ) : (
          // ==================== THERMAL 58mm / 80mm INVOICE ====================
          <div
            className={`bg-white text-black p-4 font-mono shadow-2xl rounded-sm print:shadow-none print:p-0 print:m-0 print:w-full ${
              format === "58mm" ? "w-[58mm] text-[10px]" : "w-[80mm] text-xs"
            }`}
          >
            {/* Thermal Header */}
            <div className="text-center border-b border-dashed border-black pb-2 mb-2">
              <h1 className="font-black text-sm uppercase tracking-wider">
                K2C KOMPUTINDO
              </h1>
              <p className="text-[10px]">Pusat Komputer &amp; Servis</p>
              <p className="text-[9px]">WA: 0812-3456-7890</p>
              <p className="text-[9px] font-bold mt-1">[{order.marketplace}]</p>
            </div>

            {/* Info Resi */}
            <div className="space-y-0.5 mb-2 border-b border-dashed border-black pb-2">
              <div className="flex justify-between">
                <span>Resi:</span>
                <span className="font-bold">{order.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Order:</span>
                <span>{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Cust:</span>
                <span className="truncate max-w-[140px] font-semibold">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{new Date(order.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 mb-2 border-b border-dashed border-black pb-2">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-bold truncate max-w-[160px]">
                      {item.qty}x {item.itemName}
                    </span>
                    <span>Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                  </div>
                  {item.serialNumber && (
                    <div className="text-[9px] text-slate-700">
                      SN: {item.serialNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between font-bold text-xs py-1 border-b border-dashed border-black mb-2">
              <span>TOTAL:</span>
              <span>Rp {calculateTotal().toLocaleString("id-ID")}</span>
            </div>

            {/* Thermal QR Code */}
            <div className="flex flex-col items-center justify-center p-2 text-center my-2 border border-black rounded">
              <QRCodeSVG
                value={publicUrl}
                size={format === "58mm" ? 85 : 110}
                level="M"
              />
              <p className="text-[9px] font-bold mt-1.5 uppercase">
                Scan Hasil Tes QC Unit
              </p>
              <p className="text-[8px] text-slate-600 font-mono">
                {publicUrl.replace(/^https?:\/\//, "")}
              </p>
            </div>

            <div className="text-center text-[9px] text-slate-600 mt-2 space-y-0.5">
              <p>Terima kasih atas kunjungan Anda!</p>
              <p>Barang telah lolos QC K2C Komputindo.</p>
            </div>
          </div>
        )}
      </main>

      {/* Global Print-specific CSS styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: ${format === "A4" ? "12mm" : "0"};
            size: ${format === "A4" ? "A4 portrait" : "auto"};
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

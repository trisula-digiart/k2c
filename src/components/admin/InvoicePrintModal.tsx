"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Printer, ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [printFormat, setPrintFormat] = useState<"80mm" | "58mm" | "A4">("80mm");

  if (!order) return null;

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/qc-public/${order.publicToken}`
      : `/qc-public/${order.publicToken}`;

  const calculateTotal = () => {
    return (order.items || []).reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.qty || 1),
      0
    );
  };

  const handleDirectPrint = () => {
    window.open(`/admin/invoices/${order.id}?format=${printFormat}&print=1`, "_blank");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-400" />
          <span>Cetak Invoice / Struk Pesanan</span>
        </div>
      }
      size="lg"
      description={`Order: ${order.orderNumber} | Resi: ${order.receiptNumber}`}
    >
      <div className="space-y-4">
        {/* Format Selector Pills */}
        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-300 ml-2">
            Pilih Format Kertas:
          </span>
          <div className="flex items-center gap-1.5">
            {(["80mm", "58mm", "A4"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setPrintFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  printFormat === fmt
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {fmt === "80mm"
                  ? "Thermal 80mm"
                  : fmt === "58mm"
                  ? "Thermal 58mm"
                  : "Standar A4"}
              </button>
            ))}
          </div>
        </div>

        {/* Live Thermal / Paper Preview */}
        <div className="flex justify-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 overflow-y-auto max-h-[50vh]">
          <div
            className={`bg-white text-slate-900 p-4 rounded-lg shadow-2xl font-mono text-xs transition-all ${
              printFormat === "58mm"
                ? "w-[240px] text-[10px]"
                : printFormat === "80mm"
                ? "w-[320px] text-xs"
                : "w-[480px] text-xs"
            }`}
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
              <h2 className="font-black text-sm uppercase tracking-wider text-slate-950">
                K2C KOMPUTINDO
              </h2>
              <p className="text-[10px] text-slate-600">
                Pusat Komputer, PC Gaming &amp; Servis
              </p>
              <p className="text-[9px] text-slate-500">
                Telp: 0812-3456-7890 | {order.marketplace}
              </p>
            </div>

            {/* Order info */}
            <div className="space-y-1 mb-3 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-600">No. Resi:</span>
                <span className="font-bold">{order.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Order ID:</span>
                <span>{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pelanggan:</span>
                <span className="font-semibold">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tanggal:</span>
                <span>{new Date(order.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-b border-dashed border-slate-300 py-2 my-2 space-y-2">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-semibold truncate max-w-[180px]">
                      {item.qty}x {item.itemName}
                    </span>
                    <span>Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                  </div>
                  {item.serialNumber && (
                    <div className="text-[9px] text-slate-500 font-mono">
                      SN: {item.serialNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between font-bold text-xs py-1 border-b border-dashed border-slate-300 mb-3">
              <span>TOTAL PEMBAYARAN:</span>
              <span>Rp {calculateTotal().toLocaleString("id-ID")}</span>
            </div>

            {/* QC QR Verification */}
            <div className="flex flex-col items-center justify-center p-2 text-center bg-slate-50 rounded border border-slate-200 my-2">
              <QRCodeSVG
                value={publicUrl}
                size={printFormat === "58mm" ? 80 : 96}
                level="M"
              />
              <p className="text-[9px] font-bold text-slate-800 mt-1.5 uppercase">
                Scan Bukti QC &amp; Garansi
              </p>
              <p className="text-[8px] text-slate-500 font-mono">
                {publicUrl.replace(/^https?:\/\//, "")}
              </p>
            </div>

            <div className="text-center text-[9px] text-slate-500 mt-2">
              <p>Terima kasih telah berbelanja di K2C!</p>
              <p>Simpan struk ini sebagai bukti garansi resmi.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <Button
            onClick={() => window.open(`/admin/invoices/${order.id}`, "_blank")}
            variant="ghost"
            icon={<ExternalLink className="w-4 h-4" />}
          >
            Buka Halaman Invoice Full
          </Button>

          <Button
            onClick={handleDirectPrint}
            variant="primary"
            icon={<Printer className="w-4 h-4" />}
          >
            Cetak Sekarang ({printFormat})
          </Button>
        </div>
      </div>
    </Modal>
  );
};

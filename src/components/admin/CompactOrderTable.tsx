"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Video,
  Printer,
  ExternalLink,
  ChevronRight,
  Play,
  Copy,
  Check,
  Package,
  Camera,
  RotateCcw,
  Sliders,
  MoreVertical,
  QrCode,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { OrderStatus, ORDER_STATUS_LABELS } from "@/lib/types";
import { VideoPreviewModal } from "@/components/admin/VideoPreviewModal";
import { InvoicePrintModal } from "@/components/admin/InvoicePrintModal";

interface CompactOrderTableProps {
  orders: any[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onRefresh: () => void;
}

export const CompactOrderTable: React.FC<CompactOrderTableProps> = ({
  orders,
  onStatusChange,
  onRefresh,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<{
    media: any;
    orderNumber?: string;
    receiptNumber?: string;
    publicToken?: string;
  } | null>(null);

  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any | null>(null);
  const [copiedResi, setCopiedResi] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    setTimeout(() => setCopiedResi(null), 2000);
  };

  const handleStatusSelect = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await onStatusChange(orderId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
        <Package className="w-10 h-10 mx-auto text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-300">
          Tidak ada pesanan ditemukan
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Ubah filter pencarian atau buat order baru via tombol di atas.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 1. SHOPEE SELLER MOBILE ORDER CARDS (Smartphone View) */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => {
          const qcVideo = order.mediaProofs?.find((m: any) => m.type === "QC_VIDEO");
          const dispatchPhoto = order.mediaProofs?.find((m: any) => m.type === "DISPATCH_PHOTO");
          const returnMedia = order.mediaProofs?.find((m: any) => m.type === "RETURN_UNBOXING");
          const totalOrderPrice = order.items?.reduce(
            (sum: number, it: any) => sum + (it.price || 0) * (it.qty || 1),
            0
          );

          return (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
            >
              {/* Card Header: Channel & Resi & Status */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Badge marketplace={order.marketplace} size="xs" />
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-sky-400">
                    <span>{order.receiptNumber}</span>
                    <button
                      onClick={() => handleCopyResi(order.receiptNumber)}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedResi === order.receiptNumber ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <Badge status={order.status} size="xs" />
              </div>

              {/* Customer & Timestamp */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{order.customerName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {order.orderNumber}
                  </div>
                </div>

                {order.customerPhone && (
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1"
                  >
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Items List (Shopee Seller Card style) */}
              <div className="space-y-1.5 py-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                {order.items?.map((it: any) => (
                  <div key={it.id} className="text-xs">
                    <div className="flex items-start justify-between">
                      <span className="text-slate-200 font-medium line-clamp-1 pr-2">
                        {it.itemName}
                      </span>
                      <span className="font-mono text-slate-400 shrink-0">
                        {it.qty} × Rp {it.price?.toLocaleString("id-ID")}
                      </span>
                    </div>
                    {it.serialNumber && (
                      <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                        SN: {it.serialNumber}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Media Badges if any */}
              {(qcVideo || dispatchPhoto || returnMedia) && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                  <span className="text-[10px] text-slate-400">Bukti:</span>
                  {qcVideo && (
                    <button
                      onClick={() =>
                        setSelectedMedia({
                          media: qcVideo,
                          orderNumber: order.orderNumber,
                          receiptNumber: order.receiptNumber,
                          publicToken: order.publicToken,
                        })
                      }
                      className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-semibold flex items-center gap-1"
                    >
                      <Video className="w-3 h-3" />
                      <span>Video QC</span>
                    </button>
                  )}
                  {dispatchPhoto && (
                    <button
                      onClick={() =>
                        setSelectedMedia({
                          media: dispatchPhoto,
                          orderNumber: order.orderNumber,
                          receiptNumber: order.receiptNumber,
                          publicToken: order.publicToken,
                        })
                      }
                      className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Foto Serah Terima</span>
                    </button>
                  )}
                  {returnMedia && (
                    <button
                      onClick={() =>
                        setSelectedMedia({
                          media: returnMedia,
                          orderNumber: order.orderNumber,
                          receiptNumber: order.receiptNumber,
                          publicToken: order.publicToken,
                        })
                      }
                      className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retur</span>
                    </button>
                  )}
                </div>
              )}

              {/* Card Footer: Total Price & Quick Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Total Pesanan</div>
                  <div className="text-sm font-bold font-mono text-white">
                    Rp {totalOrderPrice?.toLocaleString("id-ID")}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Status Dropdown */}
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusSelect(order.id, e.target.value as OrderStatus)
                    }
                    disabled={updatingId === order.id}
                    className="bg-slate-950 border border-slate-800 text-[11px] rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none"
                  >
                    {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setSelectedOrderForInvoice(order)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    title="Cetak Struk"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <Link href={`/tech/task/${order.id}`}>
                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30">
                      QC Hub
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. DESKTOP ERP HIGH-DENSITY TABLE (PC View) */}
      <div className="hidden md:block w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-3.5">Resi &amp; Order ID</th>
              <th className="py-3 px-3.5">Marketplace</th>
              <th className="py-3 px-3.5">Pelanggan</th>
              <th className="py-3 px-3.5">Item Produk &amp; Serial Number</th>
              <th className="py-3 px-3.5">Status Pesanan</th>
              <th className="py-3 px-3.5 text-center">Bukti QC / Media</th>
              <th className="py-3 px-3.5 text-right">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {orders.map((order) => {
              const qcVideo = order.mediaProofs?.find((m: any) => m.type === "QC_VIDEO");
              const dispatchPhoto = order.mediaProofs?.find(
                (m: any) => m.type === "DISPATCH_PHOTO"
              );
              const returnMedia = order.mediaProofs?.find(
                (m: any) => m.type === "RETURN_UNBOXING"
              );

              return (
                <tr
                  key={order.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Resi & Order ID */}
                  <td className="py-3 px-3.5 align-top">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-sky-400 text-xs">
                        {order.receiptNumber}
                      </span>
                      <button
                        onClick={() => handleCopyResi(order.receiptNumber)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                        title="Salin Resi"
                      >
                        {copiedResi === order.receiptNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {order.orderNumber}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>

                  {/* Marketplace */}
                  <td className="py-3 px-3.5 align-top">
                    <Badge marketplace={order.marketplace} size="xs" />
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-3.5 align-top">
                    <div className="font-semibold text-slate-200">
                      {order.customerName}
                    </div>
                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-emerald-400/90 hover:text-emerald-300 hover:underline block mt-0.5"
                      >
                        {order.customerPhone}
                      </a>
                    )}
                  </td>

                  {/* Items + Serial Numbers */}
                  <td className="py-3 px-3.5 align-top max-w-xs">
                    <div className="space-y-1">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="text-xs">
                          <div className="text-slate-200">
                            <span className="text-blue-400 font-bold mr-1">
                              {item.qty}x
                            </span>
                            {item.itemName}
                          </div>
                          {item.serialNumber ? (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 inline-block mt-0.5">
                              SN: {item.serialNumber}
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-amber-400/80 italic">
                              (No Serial Belum Dicatat)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3.5 align-top">
                    <div className="space-y-1">
                      <Badge status={order.status} size="xs" />

                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusSelect(order.id, e.target.value as OrderStatus)
                        }
                        className="block mt-1 w-full bg-slate-950 border border-slate-800 text-[10px] font-medium text-slate-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500"
                      >
                        {Object.keys(ORDER_STATUS_LABELS).map((st) => (
                          <option key={st} value={st}>
                            Ubah ke: {ORDER_STATUS_LABELS[st as OrderStatus].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Media Proof Count & Quick Preview */}
                  <td className="py-3 px-3.5 align-top text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {qcVideo ? (
                        <button
                          onClick={() =>
                            setSelectedMedia({
                              media: qcVideo,
                              orderNumber: order.orderNumber,
                              receiptNumber: order.receiptNumber,
                              publicToken: order.publicToken,
                            })
                          }
                          className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-1 text-[10px] font-semibold"
                          title="Putar Video QC Unit"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>QC Video</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono">
                          No Video
                        </span>
                      )}

                      {dispatchPhoto && (
                        <button
                          onClick={() =>
                            setSelectedMedia({
                              media: dispatchPhoto,
                              orderNumber: order.orderNumber,
                              receiptNumber: order.receiptNumber,
                              publicToken: order.publicToken,
                            })
                          }
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1 text-[10px] font-semibold"
                          title="Lihat Foto Bukti Serah Terima Watermark"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Foto</span>
                        </button>
                      )}

                      {returnMedia && (
                        <button
                          onClick={() =>
                            setSelectedMedia({
                              media: returnMedia,
                              orderNumber: order.orderNumber,
                              receiptNumber: order.receiptNumber,
                              publicToken: order.publicToken,
                            })
                          }
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1 text-[10px] font-semibold"
                          title="Lihat Bukti Retur RMA"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Quick Actions */}
                  <td className="py-3 px-3.5 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Print Invoice */}
                      <button
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                        title="Cetak Struk / Invoice (Thermal / A4)"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Open Public QC */}
                      <a
                        href={`/qc-public/${order.publicToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 transition-all"
                        title="Buka Link Verifikasi Pelanggan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* Open Technician Task */}
                      <Link
                        href={`/tech/task/${order.id}`}
                        className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 transition-all"
                        title="Buka di Hub Teknisi"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Video Preview Modal */}
      {selectedMedia && (
        <VideoPreviewModal
          isOpen={true}
          onClose={() => setSelectedMedia(null)}
          media={selectedMedia.media}
          orderNumber={selectedMedia.orderNumber}
          receiptNumber={selectedMedia.receiptNumber}
          publicToken={selectedMedia.publicToken}
        />
      )}

      {/* Invoice Print Modal */}
      {selectedOrderForInvoice && (
        <InvoicePrintModal
          isOpen={true}
          onClose={() => setSelectedOrderForInvoice(null)}
          order={selectedOrderForInvoice}
        />
      )}
    </>
  );
};

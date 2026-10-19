export type OrderStatus =
  | "PENDING"
  | "QC_IN_PROGRESS"
  | "QC_COMPLETED"
  | "PACKED"
  | "DISPATCHED"
  | "COMPLETED"
  | "RETURNED";

export type MediaType = "QC_VIDEO" | "DISPATCH_PHOTO" | "RETURN_UNBOXING";

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING: {
    label: "Menunggu QC",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  QC_IN_PROGRESS: {
    label: "Proses QC",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  QC_COMPLETED: {
    label: "QC Selesai",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  PACKED: {
    label: "Sudah Dipacking",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  DISPATCHED: {
    label: "Serah Terima / Kirim",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
  },
  COMPLETED: {
    label: "Selesai",
    color: "text-slate-300",
    bg: "bg-slate-700/20 border-slate-600/30",
  },
  RETURNED: {
    label: "Retur / RMA",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
  },
};

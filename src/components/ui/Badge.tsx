import React from "react";
import { OrderStatus, ORDER_STATUS_LABELS } from "@/lib/db";

interface BadgeProps {
  status?: OrderStatus | string;
  marketplace?: string;
  label?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "slate";
  size?: "xs" | "sm" | "md";
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  marketplace,
  label,
  variant,
  size = "sm",
  showDot = false,
  className = "",
}) => {
  const sizeStyles = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2 py-0.5 gap-1.5",
    md: "text-sm px-2.5 py-1 gap-1.5",
  }[size];

  // If status is passed, use defined status labels & colors
  if (status && ORDER_STATUS_LABELS[status as OrderStatus]) {
    const meta = ORDER_STATUS_LABELS[status as OrderStatus];
    const isPulsing = status === "QC_IN_PROGRESS" || status === "PENDING";
    return (
      <span
        className={`inline-flex items-center font-medium border rounded-full ${meta.bg} ${meta.color} ${sizeStyles} ${className}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            status === "QC_IN_PROGRESS"
              ? "bg-blue-400 animate-ping"
              : status === "PENDING"
              ? "bg-amber-400 animate-pulse"
              : status === "QC_COMPLETED"
              ? "bg-emerald-400"
              : status === "RETURNED"
              ? "bg-rose-400"
              : "bg-current"
          }`}
        />
        {meta.label}
      </span>
    );
  }

  // If marketplace is passed
  if (marketplace) {
    let mpStyles = "bg-slate-800 text-slate-300 border-slate-700";
    const mpLower = marketplace.toLowerCase();

    if (mpLower.includes("tokopedia")) {
      mpStyles = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    } else if (mpLower.includes("shopee")) {
      mpStyles = "bg-orange-500/15 text-orange-400 border-orange-500/30";
    } else if (mpLower.includes("tiktok")) {
      mpStyles = "bg-pink-500/15 text-pink-400 border-pink-500/30";
    } else if (mpLower.includes("offline") || mpLower.includes("toko")) {
      mpStyles = "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }

    return (
      <span
        className={`inline-flex items-center font-semibold border rounded-md ${mpStyles} ${sizeStyles} ${className}`}
      >
        {marketplace}
      </span>
    );
  }

  // Generic variant
  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    info: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    slate: "bg-slate-800/80 text-slate-400 border-slate-700/50",
  }[variant || "default"];

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md ${variantStyles} ${sizeStyles} ${className}`}
    >
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
};

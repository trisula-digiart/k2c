"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Building2,
  Smartphone,
  Plus,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const AdminNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Live Orders & POS", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/admin/products", label: "Daftar Produk", icon: <Package className="w-4 h-4" /> },
    { href: "/admin/customers", label: "Data Pelanggan", icon: <Users className="w-4 h-4" /> },
    { href: "/admin/suppliers", label: "Data Supplier", icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              K2C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  K2C KOMPUTINDO
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  ADMIN HUB
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Pusat Operasional Toko &amp; Gudang</p>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick External & Action links */}
        <div className="flex items-center gap-2">
          <Link
            href="/tech"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Mobile Hub (PWA)</span>
          </Link>

          <Link href="/admin/orders/new">
            <Button
              variant="primary"
              size="xs"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Order Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="md:hidden flex items-center gap-1 mt-2.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-800/60">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};

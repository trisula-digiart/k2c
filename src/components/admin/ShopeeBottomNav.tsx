"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Building2,
  PlusCircle,
} from "lucide-react";

export const ShopeeBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Pesanan",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: "/admin/products",
      label: "Produk",
      icon: <Package className="w-5 h-5" />,
    },
    {
      href: "/admin/purchases",
      label: "Beli (PO)",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      href: "/admin/customers",
      label: "Pelanggan",
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: "/admin/suppliers",
      label: "Supplier",
      icon: <Building2 className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? "text-blue-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

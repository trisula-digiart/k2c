import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWAInstaller } from "@/components/pwa/PWAInstaller";

export const metadata: Metadata = {
  title: "K2C Komputindo Hub - POS & QC Tracker",
  description:
    "Aplikasi Desktop Admin POS, Mobile Hub Teknisi, dan Pembelian Supplier K2C Komputindo.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "K2C Hub",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content="K2C Hub" />
        <meta name="apple-mobile-web-app-title" content="K2C Hub" />
        <meta name="theme-color" content="#020617" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        <PWAInstaller />
        {children}
      </body>
    </html>
  );
}

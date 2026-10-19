"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, CheckCircle } from "lucide-react";

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker explicitly
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.warn("PWA Service Worker registration error:", err);
        });
    }

    // 2. Check if already installed
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
        return;
      }
    }

    // 3. Listen for Chrome's beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("PWA beforeinstallprompt captured! App is ready for 1-click install.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Listen for appinstalled
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("K2C Hub PWA installed successfully!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instruction if Chrome has not fired event yet
      alert(
        "Untuk menginstall aplikasi K2C di ponsel:\n\n1. Ketuk ikon titik tiga (⋮) di pojok kanan atas Chrome.\n2. Pilih 'Tambahkan ke Layar Utama' (Add to Home screen) atau 'Install Aplikasi'."
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (isInstalled || dismissed) return null;

  return (
    <aside aria-label="Instalasi PWA" className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 text-white px-3.5 py-2.5 shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-bold tracking-tight text-white flex items-center gap-1.5">
            <span>Install Aplikasi K2C Hub</span>
            <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9px] font-mono">
              PWA
            </span>
          </div>
          <p className="text-[10px] text-white/80 line-clamp-1">
            Akses cepat tanpa browser, responsif &amp; ringan mirip aplikasi Play Store.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-slate-100 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

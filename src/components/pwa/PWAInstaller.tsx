"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, CheckCircle2, MoreVertical, Share, ExternalLink } from "lucide-react";

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    }

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
      console.log("PWA beforeinstallprompt captured! Ready for 1-click install.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Listen for appinstalled
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowGuideModal(false);
      console.log("K2C Hub PWA installed successfully!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      // Show guided install modal
      setShowGuideModal(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Top Install Banner (if not dismissed) */}
      {!dismissed && (
        <aside
          aria-label="Instalasi PWA"
          className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 text-white px-3.5 py-2.5 shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-top duration-200"
        >
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
              title="Tutup banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Floating mini install button if top banner was dismissed */}
      {dismissed && !isInstalled && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 right-3.5 z-40 px-3 py-2 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-500 font-bold text-xs flex items-center gap-1.5 border border-white/20 active:scale-95 transition-all md:bottom-5"
          title="Install Aplikasi K2C"
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </button>
      )}

      {/* Guided Modal for Android Chrome & iOS Safari */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Panduan Install K2C Hub</h3>
                  <p className="text-[11px] text-slate-400">PWA Mandiri untuk Ponsel</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <Share className="w-4 h-4 shrink-0" />
                  Langkah di iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>
                    Ketuk tombol <strong>Bagikan / Share</strong> (ikon kotak dengan panah ke atas) di bagian bawah Safari.
                  </li>
                  <li>
                    Gulir ke bawah dan ketuk opsi <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                  </li>
                  <li>
                    Ketuk <strong>"Tambah"</strong> di pojok kanan atas. Aplikasi langsung siap dibuka dari layar HP Anda!
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-sky-400 font-semibold flex items-center gap-1.5">
                  <MoreVertical className="w-4 h-4 shrink-0" />
                  Langkah di Google Chrome Ponsel:
                </p>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>
                    Ketuk tombol menu <strong>titik tiga (⋮)</strong> di pojok kanan atas browser Chrome.
                  </li>
                  <li>
                    Pilih menu <strong>"Install aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama" (Add to Home screen)</strong>.
                  </li>
                  <li>
                    Ketuk <strong>"Install"</strong>. Ikon K2C Hub akan terpasang di layar utama ponsel dan dapat dibuka seperti aplikasi Play Store tanpa browser!
                  </li>
                </ol>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                  }
                  setShowGuideModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 text-center"
              >
                Saya Mengerti, Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

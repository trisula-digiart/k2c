"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Zap, ZapOff, Search, AlertCircle } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  placeholder?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  placeholder = "Masukkan No. Resi atau Scan...",
}) => {
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "html5-qr-reader";

  // Play satisfying success beep using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio not permitted or supported
    }
  };

  useEffect(() => {
    // List video input devices
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back / environment camera
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("rear") ||
              d.label.toLowerCase().includes("environment")
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.warn("Unable to get cameras:", err);
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async (cameraIdToUse?: string) => {
    setErrorMessage(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A,
          ],
          verbose: false,
        });
      }

      const cameraId = cameraIdToUse || selectedCameraId;
      const cameraConfig = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: "environment" };

      await scannerRef.current.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          playBeep();
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          onScan(decodedText.trim());
        },
        () => {
          // Frame scanned without barcode match - silent ignore
        }
      );

      setIsScanning(true);

      // Check torch capability
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities();
        if ((capabilities as any).torch) {
          setHasTorch(true);
        }
      } catch (e) {
        // Torch capability query not supported
      }
    } catch (err: any) {
      console.error("Scanner start error:", err);
      setErrorMessage(
        err.message?.includes("NotAllowedError")
          ? "Izin akses kamera ditolak. Harap izinkan kamera pada browser."
          : "Gagal memulai kamera: " + (err.message || "Pastikan kamera tidak digunakan aplikasi lain.")
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      }
      setIsScanning(false);
      setTorchOn(false);
    }
  };

  const toggleTorch = async () => {
    if (scannerRef.current && isScanning && hasTorch) {
      try {
        const nextState = !torchOn;
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: nextState } as any],
        });
        setTorchOn(nextState);
      } catch (e) {
        console.warn("Torch toggle failed:", e);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Scanner Viewport */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-xl min-h-[300px] flex flex-col items-center justify-center">
        <div
          id={readerElementId}
          className="w-full h-full min-h-[300px] object-cover flex items-center justify-center"
        />

        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-6 text-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-lg">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-white font-semibold text-base mb-1">
              Kamera Scanner Resi / Barcode
            </p>
            <p className="text-xs text-slate-400 max-w-xs mb-4">
              Arahkan kamera ke Barcode Resi Pengiriman atau QR Code pada kemasan
            </p>
            <button
              onClick={() => startScanner()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              Aktifkan Scanner Kamera
            </button>
          </div>
        )}

        {/* Live HUD Overlay when scanning */}
        {isScanning && (
          <>
            {/* Corner Markers Target Box */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <div className="w-64 h-36 border-2 border-dashed border-blue-400/80 rounded-xl relative shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
              </div>
            </div>

            {/* Floating Top Controls */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
              <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Camera
              </span>

              <div className="flex items-center gap-2">
                {hasTorch && (
                  <button
                    onClick={toggleTorch}
                    className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
                      torchOn
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-900/80 text-white border-slate-700"
                    }`}
                  >
                    {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                  </button>
                )}

                <button
                  onClick={stopScanner}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 backdrop-blur-md transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Camera Switcher if multiple cameras */}
            {cameras.length > 1 && (
              <div className="absolute bottom-3 left-3 z-20">
                <button
                  onClick={() => {
                    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
                    const nextIndex = (currentIndex + 1) % cameras.length;
                    const nextId = cameras[nextIndex].id;
                    setSelectedCameraId(nextId);
                    stopScanner().then(() => startScanner(nextId));
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5 hover:bg-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ganti Kamera
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Manual Resi Search / Entry Fallback */}
      <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-all active:scale-95 shrink-0"
        >
          Cari
        </button>
      </form>
    </div>
  );
};

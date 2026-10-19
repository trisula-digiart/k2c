# K2C KOMPUTINDO — POS, QC TRACKER & TECHNICIAN PWA

Sistem produksi terpadu untuk **K2C Komputindo** yang dirancang dengan arsitektur dual-interface:
1. **Desktop Admin & POS Hub**: Berjalan pada PC kasir/server toko lokal dengan tata letak ringkas (high information density), pemantauan antrean QC, pemutar video QC, dan pencetakan faktur thermal (58mm/80mm) serta A4.
2. **Mobile Technician Hub (PWA)**: Web app progresif yang dapat diakses oleh teknisi bengkel/lapangan via smartphone atau tablet dengan kamera scanner barcode resi, perekaman video QC 720p terkompresi, pencatatan nomor seri (SN), dan kamera bukti serah terima gerai ber-watermark koordinat GPS otomatis.

---

## 🛠️ Tech Stack & Arsitektur

- **Framework**: Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Database & ORM**: SQLite via Prisma ORM (`prisma/schema.prisma`)
- **PWA Suite**: `@ducanh2912/next-pwa` dengan service worker caching & manifest kustom
- **Barcode / QR Scanner**: `html5-qrcode` & HTML5 Video Stream
- **Client Compression**: `browser-image-compression` (< 500KB untuk foto) & HTML5 Canvas / MediaRecorder capped bitrate (~1.5 Mbps) untuk video QC
- **Local Media Storage**: Penyimpanan filesystem server lokal (`/public/uploads/qc-videos`, `/public/uploads/dispatches`, `/public/uploads/returns`) tanpa biaya cloud pihak ketiga
- **Watermark Engine**: Generator Canvas HTML5 dinamis dengan stempel Timestamp WIB, koordinat GPS Geolocation akurat, No. Resi, dan branding toko

---

## 📁 Struktur Direktori

```plaintext
k2c/
├── prisma/
│   ├── schema.prisma          # Skema SQLite: Order, OrderItem, MediaProof
│   └── seed.js                # Data awal 5 order realistis (Tokopedia, Shopee, TikTok Shop, Walk-in)
├── public/
│   ├── manifest.json          # PWA Manifest (K2C Teknisi, standalone, #0f172a)
│   ├── sw.js                  # Service Worker PWA (auto-generated)
│   ├── icons/                 # PWA icons (192x192, 512x512, SVG)
│   └── uploads/
│       ├── qc-videos/         # Rekaman video pengujian QC unit (.webm/.mp4)
│       ├── dispatches/        # Foto serah terima gerai / kurir ber-watermark GPS
│       └── returns/           # Dokumentasi unboxing retur / klaim RMA
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + meta viewport PWA
│   │   ├── page.tsx           # Dual-interface launcher portal
│   │   ├── globals.css        # Tailwind & custom scrollbar
│   │   ├── admin/
│   │   │   ├── page.tsx               # Papan live dispatch POS & KPI cards
│   │   │   ├── orders/new/page.tsx    # Formulir input pesanan & marketplace
│   │   │   └── invoices/[id]/page.tsx # Invoice cetak thermal 58mm/80mm & A4
│   │   ├── tech/
│   │   │   ├── page.tsx               # Worklist antrean teknisi (PWA)
│   │   │   ├── scan/page.tsx          # Kamera scanner barcode/QR resi
│   │   │   └── task/[id]/page.tsx     # Alur kerja QC, video recorder & serah terima
│   │   ├── qc-public/[token]/page.tsx # Halaman publik verifikasi QC pelanggan
│   │   └── api/
│   │       ├── orders/route.ts        # GET & POST pesanan
│   │       ├── orders/[id]/status/    # Update status pesanan & serial numbers
│   │       └── upload/route.ts        # Handler upload file ke filesystem lokal
│   ├── components/
│   │   ├── admin/
│   │   │   ├── CompactOrderTable.tsx  # Tabel pesanan berdensitas tinggi
│   │   │   ├── InvoicePrintModal.tsx  # Modal pratinjau cetak struk/faktur
│   │   │   └── VideoPreviewModal.tsx  # Modal pemutar video QC & metadata
│   │   ├── tech/
│   │   │   ├── BarcodeScanner.tsx     # Scanner kamera HTML5 + torch + feedback audio
│   │   │   ├── MediaUploader.tsx      # Perekam video 720p client-side capped
│   │   │   └── WatermarkCamera.tsx    # Kamera watermark GPS + waktu WIB
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       └── Modal.tsx
│   └── lib/
│       ├── db.ts                      # Prisma client singleton & status labels
│       ├── compression.ts             # Kompresi gambar & batas bitrate video
│       └── watermark.ts               # Generator canvas watermark GPS & WIB
└── next.config.mjs                    # Konfigurasi Next.js + PWA
```

---

## 🚀 Panduan Menjalankan Sistem

### 1. Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

### 2. Mengakses Melalui Smartphone Teknisi (PWA di Jaringan Wi-Fi Lokal)
1. Pastikan PC server dan smartphone teknisi terhubung ke jaringan Wi-Fi lokal yang sama.
2. Cari alamat IP lokal PC Anda (contoh: `192.168.1.50`).
3. Buka browser smartphone (Chrome / Safari) dan arahkan ke:
   ```
   http://192.168.1.50:3000/tech
   ```
4. Ketuk menu browser **"Tambahkan ke Layar Utama" (Add to Home Screen)** untuk menginstal aplikasi PWA K2C Teknisi sebagai aplikasi mandiri (standalone).

### 3. Kompilasi & Build Produksi
```bash
npm run build
npm run start
```

### 4. Database Seed Ulang (Opsional)
```bash
npm run prisma:seed
```

---

## 🔒 Fitur Anti-Fraud & Transparansi Mutu

1. **Watermark GPS & Waktu WIB**: Setiap foto serah terima kurir secara otomatis menyematkan koordinat latitude/longitude aktual, toleransi akurasi, nomor resi pengiriman, serta stempel waktu WIB.
2. **Rekaman Video QC Berkecepatan Tinggi**: Video direkam dengan batas resolusi 720p dan bitrate terkendali (~1.5 Mbps) agar hemat memori penyimpanan PC lokal namun tetap tajam menampilkan nomor seri dan indikator lampu motherboard.
3. **Pencatatan Nomor Seri (Serial Number)**: Teknisi menginput nomor seri tiap komponen sehingga pesanan memiliki riwayat SN digital permanen.
4. **Halaman Verifikasi Publik Pelanggan (`/qc-public/[token]`)**: Pelanggan atau pembeli marketplace dapat memindai QR code pada struk belanja untuk melihat rekaman video QC unit mereka dan memverifikasi keaslian barang sebelum mengajukan komplain.

---

© 2026 **K2C Komputindo** • Trisula Framework
Target GitHub Repo: `trisula-digiart/k2c` | Deployment Target: `vercel.com/trisula-framework`

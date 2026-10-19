import { prisma } from "./db";

let isSeeding = false;

export async function ensureDatabaseSeeded() {
  if (isSeeding) return;
  try {
    const productCount = await prisma.product.count();
    if (productCount > 0) {
      return; // Already populated
    }

    isSeeding = true;
    console.log("Database is empty on serverless container. Auto-seeding 29 products from pc-workshop-hub...");

    // 1. Seed Genuine Products Taken Directly from pc-workshop-hub
    const productsData = [
      {
        sku: "PC-C2D-G41-4-500",
        name: "Paket Komputer Fullset Siap Pakai Core 2 Duo RAM 4GB DDR3 HDD 500GB + Bonus USB Wifi",
        category: "PC_FULLSET",
        price: 1250000,
        costPrice: 950000,
        stock: 8,
        description: "Paket lengkap CPU + LCD Monitor 16 inch wide, keyboard mouse, kabel lengkap. Cocok untuk jualan online, office, kasir, dan sekolah. Second bergaransi.",
      },
      {
        sku: "PC-SERI-G-4-500",
        name: "PC CPU Komputer Seri Pentium G RAM 4GB HDD 500GB CPU Saja Termurah",
        category: "PC_FULLSET",
        price: 950000,
        costPrice: 720000,
        stock: 10,
        description: "CPU saja hemat daya untuk kasir toko, office kasir minimarket, admin gudang dan browsing ringan.",
      },
      {
        sku: "PC-I3-4-250-CPU",
        name: "PC CPU Komputer Core i3 RAM 4GB HDD 250GB CPU Saja Siap Pakai",
        category: "PC_FULLSET",
        price: 1150000,
        costPrice: 880000,
        stock: 12,
        description: "CPU Desktop Core i3 hemat listrik, casing standar hitam rapi, terinstal Windows 10 & aplikasi siap pakai.",
      },
      {
        sku: "PC-I3-4-250-16W",
        name: "PC Komputer Core i3 RAM 4GB HDD 250GB Fullset LCD 16 Inch Wide",
        category: "PC_FULLSET",
        price: 1550000,
        costPrice: 1200000,
        stock: 14,
        description: "Fullset PC Core i3 siap pakai lengkap monitor 16 inch wide, keyboard mouse dan kabel lengkap.",
      },
      {
        sku: "PC-I3-4-250-19W",
        name: "PC Komputer Core i3 RAM 4GB HDD 250GB Fullset LCD 19 Inch Wide",
        category: "PC_FULLSET",
        price: 1750000,
        costPrice: 1350000,
        stock: 9,
        description: "Fullset PC Core i3 dengan monitor layar lebar 19 inch wide LED jernih, free packing kayu ke seluruh Indonesia.",
      },
      {
        sku: "PC-I3-8-500-CPU",
        name: "PC Komputer Core i3 RAM 8GB HDD 500GB CPU Saja Multitasking",
        category: "PC_FULLSET",
        price: 1350000,
        costPrice: 1050000,
        stock: 11,
        description: "CPU saja RAM 8GB lega untuk browsing puluhan tab marketplace, olah data excel ribuan baris, kasir POS.",
      },
      {
        sku: "PC-I3-8-500-19W",
        name: "PC Komputer Core i3 RAM 8GB HDD 500GB Fullset LCD 19 Inch Wide",
        category: "PC_FULLSET",
        price: 1950000,
        costPrice: 1500000,
        stock: 7,
        description: "Paket fullset favorit sekolah dan kantor, RAM 8GB, HDD 500GB sentinel 100%, monitor 19 inch jernih.",
      },
      {
        sku: "PC-I3-8-SSD128-19W",
        name: "PC Komputer Core i3 RAM 8GB SSD 128GB Fast Boot LCD 19 Wide Fullset",
        category: "PC_FULLSET",
        price: 2150000,
        costPrice: 1680000,
        stock: 6,
        description: "Booting Windows super cepat 5 detik dengan SSD 128GB, RAM 8GB, layar 19 inch wide tajam anti-glare.",
      },
      {
        sku: "PC-I3-4130-HDMI",
        name: "CPU Komputer PC Desktop Siap Pakai Core i3 4130 Haswell RAM 4GB HDD 500GB Port HDMI",
        category: "PC_FULLSET",
        price: 1450000,
        costPrice: 1100000,
        stock: 8,
        description: "Motherboard LGA 1150 dengan output HDMI langsung ke monitor modern / smart TV, sudah bisa internetan.",
      },
      {
        sku: "PC-I3-6100-DDR4",
        name: "Komputer Siap Pakai Core i3 6100 3.7GHz Skylake RAM 4GB DDR4 HDD 500GB",
        category: "PC_FULLSET",
        price: 2350000,
        costPrice: 1850000,
        stock: 5,
        description: "Arsitektur modern socket 1151 memory DDR4 hemat daya, motherboard support upgrade Core i5/i7 gen 6/7.",
      },
      {
        sku: "PC-I5-8-500-CPU",
        name: "PC CPU Komputer Core i5 RAM 8GB HDD 500GB CPU Saja Quad Core",
        category: "PC_FULLSET",
        price: 1550000,
        costPrice: 1200000,
        stock: 10,
        description: "Processor Intel Core i5 quad core bertenaga untuk kerja multitasking berat, desain Corel Draw, Photoshop.",
      },
      {
        sku: "PC-I5-8-500-16W",
        name: "PC CPU Komputer Core i5 RAM 8GB HDD 500GB LCD 16 Inch Wide Siap Pakai",
        category: "PC_FULLSET",
        price: 1950000,
        costPrice: 1550000,
        stock: 12,
        description: "Unit favorit instansi sekolah & lab komputer. Core i5 bertenaga, RAM 8GB lancar, monitor 16 wide.",
      },
      {
        sku: "PC-I5-8-500-19W",
        name: "PC CPU Komputer Core i5 RAM 8GB HDD 500GB LCD 19 Inch Wide Siap Pakai",
        category: "PC_FULLSET",
        price: 2150000,
        costPrice: 1700000,
        stock: 8,
        description: "Kombinasi layar lebar 19 wide dan processor Core i5 quad core untuk produktivitas kerja harian.",
      },
      {
        sku: "PC-I5-8-SSD-500-19W",
        name: "PC Komputer Core i5 RAM 8GB SSD 128GB + HDD 500GB LCD 19 Wide",
        category: "PC_FULLSET",
        price: 2450000,
        costPrice: 1950000,
        stock: 6,
        description: "Dual storage: SSD untuk booting cepat Windows & apps + HDD 500GB untuk penyimpanan file kerja yang lega.",
      },
      {
        sku: "PC-I5-8-1TB-16W",
        name: "PC CPU Komputer Core i5 RAM 8GB HDD 1TB Storage Jumbo LCD 16 Wide",
        category: "PC_FULLSET",
        price: 2100000,
        costPrice: 1650000,
        stock: 5,
        description: "Kapasitas penyimpanan raksasa 1TB 1000GB untuk arsip foto, video, database kasir, dan master installer.",
      },
      {
        sku: "PC-I7-GEN4-8-500",
        name: "PC Desktop Komputer Core i7 Gen 4 RAM 8GB HDD 500GB High Performance",
        category: "PC_FULLSET",
        price: 2750000,
        costPrice: 2200000,
        stock: 4,
        description: "Processor Intel Core i7 8-Thread untuk rendering desain grafis, editing video ringan, dan kasir multi-cabang.",
      },
      {
        sku: "PC-GAME-PB-I5-VGA",
        name: "Komputer Fullset Game PB Core i5 RAM 8GB SSD 120GB HDD 250GB VGA 1GB DDR3 Monitor 19 Wide",
        category: "PC_FULLSET",
        price: 2650000,
        costPrice: 2100000,
        stock: 7,
        description: "Paket siap main Point Blank, GTA San Andreas, NFS, Dota 2, PES. Sudah terinstal Windows 10 & game favorit.",
      },
      {
        sku: "PC-LENOVO-I5-SSD",
        name: "PC Desktop Built-up Lenovo ThinkCentre Core i5 RAM 8GB SSD 120GB",
        category: "PC_FULLSET",
        price: 1850000,
        costPrice: 1450000,
        stock: 6,
        description: "Unit built-up original Lenovo, komponen kuat tahan nyala 24 jam nonstop untuk server pulsa / kasir ritel.",
      },
      {
        sku: "MON-LCD-16-WIDE",
        name: "LED / LCD Monitor Komputer 16 Inch Wide Screen Mulus Terlaris",
        category: "MONITOR",
        price: 450000,
        costPrice: 320000,
        stock: 25,
        description: "Layar jernih anti-glare, port VGA, resolusi tajam, termasuk kabel power dan kabel VGA original.",
      },
      {
        sku: "MON-LCD-19-WIDE",
        name: "LED / LCD Monitor Komputer PC Desktop & CCTV 19 Inch Wide Second Bergaransi",
        category: "MONITOR",
        price: 650000,
        costPrice: 480000,
        stock: 18,
        description: "Layar lebar 19 inch wide, cocok untuk monitor kantor maupun display CCTV DVR/NVR 24 jam.",
      },
      {
        sku: "MON-LCD-19-CCTV-NOSTAND",
        name: "Monitor LED 19 Inch Wide Khusus CCTV / Wall Mount (Minus Kaki Stand)",
        category: "MONITOR",
        price: 495000,
        costPrice: 350000,
        stock: 10,
        description: "Spesial display bracket dinding VESA CCTV / kasir pos tanpa kaki meja. Fungsi display 100% normal jernih.",
      },
      {
        sku: "VGA-2GB-DDR3",
        name: "VGA Card PC 2GB 64-Bit DDR3 NVidia / AMD Normal Bergaransi",
        category: "VGA",
        price: 285000,
        costPrice: 195000,
        stock: 15,
        description: "VGA add-on low profile / standar hemat daya, port HDMI, DVI, VGA. Cocok untuk dual monitor dan display jernih.",
      },
      {
        sku: "VGA-1GB-128BIT",
        name: "VGA Card PC 1GB 128-Bit DDR3 NVidia GeForce / AMD Radeon",
        category: "VGA",
        price: 225000,
        costPrice: 150000,
        stock: 14,
        description: "Bandwidth 128-bit lega untuk gaming kasual dan display multimedia beresolusi tinggi.",
      },
      {
        sku: "FAN-INTEL-1155-775",
        name: "Fan HSF Processor Intel Socket LGA 1155 / 1150 / 775 Built-up",
        category: "PROCESSOR",
        price: 35000,
        costPrice: 18000,
        stock: 50,
        description: "Pendingin processor dengan heatsink tebal dan thermal paste, kipas senyap dan suhu stabil.",
      },
      {
        sku: "RAM-DDR3-4GB-PC12800",
        name: "RAM PC Desktop DDR3 4GB PC-12800 1600MHz Kingston / Hynix Longdimm",
        category: "STORAGE_RAM",
        price: 95000,
        costPrice: 65000,
        stock: 40,
        description: "Memori DDR3 4GB kompatibel dengan motherboard H61, G41, B75, H81.",
      },
      {
        sku: "RAM-DDR3-8GB-PC12800",
        name: "RAM PC Desktop DDR3 8GB PC-12800 1600MHz Kingston Longdimm",
        category: "STORAGE_RAM",
        price: 185000,
        costPrice: 135000,
        stock: 30,
        description: "Upgrade maksimal RAM DDR3 8GB 1 keping untuk motherboard dual slot.",
      },
      {
        sku: "SSD-SATA-128GB",
        name: "SSD SATA 2.5 Inch 128GB Internal Fast Boot 550MB/s",
        category: "STORAGE_RAM",
        price: 155000,
        costPrice: 110000,
        stock: 35,
        description: "Kecepatan booting Windows di bawah 10 detik, anti guncangan dan tahan lama.",
      },
      {
        sku: "HDD-PC-500GB-SATA",
        name: "Harddisk Internal PC 500GB 3.5 Inch SATA Seagate / WD Blue 7200RPM",
        category: "STORAGE_RAM",
        price: 135000,
        costPrice: 95000,
        stock: 28,
        description: "Harddisk penyimpanan data sentinel 100% sehat no bad sector, bergaransi toko.",
      },
      {
        sku: "ACC-KB-MOUSE-USB",
        name: "Keyboard USB + Mouse Kabel USB Optical Combo Standard Hitam",
        category: "ACCESSORY",
        price: 65000,
        costPrice: 42000,
        stock: 45,
        description: "Paket keyboard dan mouse USB kabel panjang, tombol empuk tahan lama untuk pemakaian kantor/sekolah.",
      },
    ];

    for (const p of productsData) {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: p,
      });
    }

    // 2. Customers
    const customersData = [
      {
        name: "Budi Santoso",
        phone: "081234567890",
        email: "budisantoso@gmail.com",
        address: "Jl. Margonda Raya No. 12, Depok",
        marketplace: "Tokopedia",
        notes: "Langganan rakitan PC gaming dan warnet.",
      },
      {
        name: "Siti Rahmawati",
        phone: "085712398451",
        email: "siti.rahma@yahoo.com",
        address: "Komp. Harapan Indah Blok B3, Bekasi",
        marketplace: "Shopee",
        notes: "Pembeli monitor 19 wide & periferal.",
      },
      {
        name: "Rian Hidayat",
        phone: "082199887766",
        email: "rianhidayat@outlook.com",
        address: "Jl. Veteran No. 45, Bandung",
        marketplace: "TikTok Shop",
        notes: "Konten kreator TikTok, sering pesan VGA & RAM.",
      },
      {
        name: "Agus Pratama",
        phone: "081900112233",
        email: "aguspratama.it@gmail.com",
        address: "K2C Store Walk-in, Jakarta Timur",
        marketplace: "Offline",
        notes: "Pelanggan setia servis & upgrade komponen toko fisik.",
      },
      {
        name: "Lidya Fitriyani",
        phone: "087811223344",
        email: "lidya.fitri@gmail.com",
        address: "Jl. Pahlawan No. 8, Cirebon",
        marketplace: "Shopee",
        notes: "Pesanan Paket Komputer Core i5 RAM 4GB SSD 120GB LCD 19 Wide.",
      },
      {
        name: "Doni Wijaya (Klaim Garansi)",
        phone: "081399882211",
        email: "doni.wijaya@gmail.com",
        address: "Jl. Sudirman Kav 21, Jakarta Selatan",
        marketplace: "Tokopedia",
        notes: "Pengajuan klaim garansi RMA SSD bad sector.",
      },
    ];

    for (const c of customersData) {
      await prisma.customer.create({ data: c });
    }

    // 3. Suppliers
    const suppliersData = [
      {
        name: "PT Nusantara Jaya Komputindo",
        contactPerson: "Hendra Wijaya (Sales Manager)",
        phone: "08118899001",
        email: "sales@nusantarajaya.co.id",
        address: "Harco Mangga Dua Blok A No. 15, Jakarta Pusat",
        category: "HARDWARE",
        notes: "Distributor utama Motherboard H61/H81/B75, Processor Intel/AMD, dan Casing PC.",
      },
      {
        name: "CV Cahaya Megah Monitor",
        contactPerson: "Bambang Setiawan",
        phone: "08129977665",
        email: "order@cahayamegah.id",
        address: "Sentra Niaga Kalimalang Blok D2, Bekasi",
        category: "MONITOR",
        notes: "Grosir monitor LED/LCD baru & second ex-kantor 16 hingga 24 inch.",
      },
      {
        name: "Mega Storage & Memory Perkasa",
        contactPerson: "Dewi Lestari",
        phone: "08131122448",
        email: "dewi@megastorage.com",
        address: "Mall Mangga Dua Lantai 3 No. 42B, Jakarta Pusat",
        category: "STORAGE_RAM",
        notes: "Supplier resmi SSD SATA, Kingston, WD, Seagate & RAM PC DDR3/DDR4.",
      },
      {
        name: "Sinar Surya Logistik & Packing",
        contactPerson: "Rahmat Hidayat",
        phone: "08561122998",
        email: "logistik@sinarsurya.co.id",
        address: "Jl. Raya Bekasi KM 21, Pulo Gadung, Jakarta Timur",
        category: "LOGISTICS",
        notes: "Penyedia bubble wrap tebal, lakban fragile, dan kardus PC rakitan.",
      },
    ];

    for (const s of suppliersData) {
      await prisma.supplier.create({ data: s });
    }

    // 4. Initial orders
    const ordersData = [
      {
        orderNumber: "ORD-TKP-20261019-001",
        receiptNumber: "TKP98234182910X",
        marketplace: "Tokopedia",
        customerName: "Budi Santoso",
        customerPhone: "081234567890",
        status: "PENDING",
        publicToken: "k2c-tok-8f92a1",
        items: [
          {
            itemName: "PC Komputer Core i5 RAM 8GB SSD 128GB + HDD 500GB LCD 19 Wide",
            qty: 1,
            price: 2450000,
            serialNumber: "SN-K2C-PC202610-091",
          },
          {
            itemName: "VGA Card PC 2GB 64-Bit DDR3 NVidia / AMD Normal Bergaransi",
            qty: 1,
            price: 285000,
            serialNumber: "RZ-VGA-772189",
          },
        ],
      },
      {
        orderNumber: "ORD-SHP-20261019-002",
        receiptNumber: "SPXID0482917231",
        marketplace: "Shopee",
        customerName: "Siti Rahmawati",
        customerPhone: "085712398451",
        status: "QC_IN_PROGRESS",
        publicToken: "k2c-shp-9c71e2",
        items: [
          {
            itemName: "Komputer Fullset Game PB Core i5 RAM 8GB SSD 120GB HDD 250GB VGA 1GB DDR3 Monitor 19 Wide",
            qty: 1,
            price: 2650000,
            serialNumber: "AOC-24G2-884192",
          },
        ],
      },
      {
        orderNumber: "ORD-TTS-20261019-003",
        receiptNumber: "TTS9018237192",
        marketplace: "TikTok Shop",
        customerName: "Rian Hidayat",
        customerPhone: "082199887766",
        status: "QC_COMPLETED",
        publicToken: "k2c-tts-4b33d8",
        items: [
          {
            itemName: "Komputer Siap Pakai Core i3 6100 3.7GHz Skylake RAM 4GB DDR4 HDD 500GB",
            qty: 1,
            price: 2350000,
            serialNumber: "ZT-3060-991204",
          },
        ],
      },
      {
        orderNumber: "ORD-OFF-20261019-004",
        receiptNumber: "K2C-POS-2026-004",
        marketplace: "Offline",
        customerName: "Agus Pratama",
        customerPhone: "081900112233",
        status: "DISPATCHED",
        publicToken: "k2c-off-1a55c7",
        items: [
          {
            itemName: "PC Desktop Komputer Core i7 Gen 4 RAM 8GB HDD 500GB High Performance",
            qty: 1,
            price: 2750000,
            serialNumber: "MSI-B760M-5519",
          },
          {
            itemName: "LED / LCD Monitor Komputer PC Desktop & CCTV 19 Inch Wide",
            qty: 1,
            price: 650000,
            serialNumber: "KF-DDR5-32G-110",
          },
        ],
      },
      {
        orderNumber: "ORD-RMA-20261019-005",
        receiptNumber: "RETUR-TKP-88129",
        marketplace: "Tokopedia",
        customerName: "Doni Wijaya (Klaim Garansi)",
        customerPhone: "081399882211",
        status: "RETURNED",
        publicToken: "k2c-rma-7d22f0",
        items: [
          {
            itemName: "SSD SATA 2.5 Inch 128GB Internal Fast Boot 550MB/s (Klaim Bad Sector)",
            qty: 1,
            price: 155000,
            serialNumber: "SM-980PRO-4491",
          },
        ],
      },
    ];

    for (const o of ordersData) {
      await prisma.order.create({
        data: {
          orderNumber: o.orderNumber,
          receiptNumber: o.receiptNumber,
          marketplace: o.marketplace,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          status: o.status,
          publicToken: o.publicToken,
          items: {
            create: o.items,
          },
        },
      });
    }

    // 5. Initial Purchase Orders (Order Pembelian dari Supplier)
    const nusantara = await prisma.supplier.findFirst({
      where: { name: { contains: "Nusantara" } },
    });
    const cahaya = await prisma.supplier.findFirst({
      where: { name: { contains: "Cahaya" } },
    });
    const i5Product = await prisma.product.findFirst({
      where: { sku: "PC-I5-8-500-CPU" },
    });
    const ramProduct = await prisma.product.findFirst({
      where: { sku: "RAM-DDR3-4GB-PC12800" },
    });
    const mon19 = await prisma.product.findFirst({
      where: { sku: "MON-LCD-19-WIDE" },
    });

    if (nusantara) {
      await prisma.purchaseOrder.create({
        data: {
          poNumber: "PO-20261019-001",
          invoiceNumber: "INV-NJ-88219",
          supplierId: nusantara.id,
          status: "ORDERED",
          totalAmount: 6650000,
          paymentStatus: "UNPAID",
          notes: "Pengiriman via kurir toko, estimasi tiba sore hari.",
          items: {
            create: [
              {
                productId: i5Product?.id || null,
                itemName: "PC CPU Komputer Core i5 RAM 8GB HDD 500GB CPU Saja Quad Core",
                qty: 5,
                costPrice: 1200000,
                receivedQty: 0,
              },
              {
                productId: ramProduct?.id || null,
                itemName: "RAM PC Desktop DDR3 4GB PC-12800 1600MHz Kingston / Hynix Longdimm",
                qty: 10,
                costPrice: 65000,
                receivedQty: 0,
              },
            ],
          },
        },
      });
    }

    if (cahaya) {
      await prisma.purchaseOrder.create({
        data: {
          poNumber: "PO-20261019-002",
          invoiceNumber: "FAK-CMM-1029",
          supplierId: cahaya.id,
          status: "RECEIVED",
          totalAmount: 3840000,
          paymentStatus: "PAID",
          notes: "Grosir monitor second mulus eks-bank, garansi 1 bulan ganti unit.",
          items: {
            create: [
              {
                productId: mon19?.id || null,
                itemName: "LED / LCD Monitor Komputer PC Desktop & CCTV 19 Inch Wide Second Bergaransi",
                qty: 8,
                costPrice: 480000,
                receivedQty: 8,
              },
            ],
          },
        },
      });
    }

    console.log("Auto-seeding complete! Database and Purchase Orders ready.");
  } catch (err) {
    console.error("Auto-seeding error:", err);
  } finally {
    isSeeding = false;
  }
}

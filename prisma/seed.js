const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding K2C Komputindo database...");

  // Clear existing data
  await prisma.mediaProof.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

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
          itemName: "PC Rakitan Gaming Intel Core i5 13400F + RTX 4060 8GB",
          qty: 1,
          price: 13500000,
          serialNumber: "SN-K2C-PC202610-091",
        },
        {
          itemName: "Mouse Gaming Razer DeathAdder Essential",
          qty: 1,
          price: 265000,
          serialNumber: "RZ-DA-772189",
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
          itemName: "Monitor Gaming AOC 24G2SP 24 Inch IPS 165Hz",
          qty: 1,
          price: 2150000,
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
          itemName: "VGA Zotac Gaming GeForce RTX 3060 Twin Edge 12GB",
          qty: 1,
          price: 4350000,
          serialNumber: "ZT-3060-991204",
        },
        {
          itemName: "PSU Corsair CX650 650W 80 Plus Bronze",
          qty: 1,
          price: 890000,
          serialNumber: "COR-CX650-1092",
        },
      ],
    },
    {
      orderNumber: "ORD-OFF-20261019-004",
      receiptNumber: "K2C-POS-2026-004",
      marketplace: "Offline",
      customerName: "Agus Pratama (Walk-in Store)",
      customerPhone: "081900112233",
      status: "DISPATCHED",
      publicToken: "k2c-off-1a55c7",
      items: [
        {
          itemName: "Motherboard MSI B760M Bomber DDR5",
          qty: 1,
          price: 1750000,
          serialNumber: "MSI-B760M-5519",
        },
        {
          itemName: "RAM Kingston Fury Beast DDR5 32GB (2x16GB) 5600MHz",
          qty: 1,
          price: 1650000,
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
          itemName: "SSD NVMe Samsung 980 Pro 1TB M.2 Gen4 (Klaim Bad Sector)",
          qty: 1,
          price: 1550000,
          serialNumber: "SM-980PRO-4491",
        },
      ],
    },
  ];

  for (const o of ordersData) {
    const created = await prisma.order.create({
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
    console.log(`Created order: ${created.orderNumber} (${created.marketplace})`);
  }

  console.log("Database seeded successfully with 5 sample orders!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

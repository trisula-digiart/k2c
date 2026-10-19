import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const marketplace = searchParams.get("marketplace")?.trim() || "";

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (marketplace && marketplace !== "ALL") {
      where.marketplace = marketplace;
    }

    if (q) {
      where.OR = [
        { orderNumber: { contains: q } },
        { receiptNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        {
          items: {
            some: {
              OR: [
                { itemName: { contains: q } },
                { serialNumber: { contains: q } },
              ],
            },
          },
        },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        mediaProofs: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      receiptNumber,
      marketplace,
      customerName,
      customerPhone,
      items,
    } = body;

    if (!orderNumber || !receiptNumber || !marketplace || !customerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Nomor order, nomor resi, marketplace, dan nama pelanggan wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Check duplicate order or receipt
    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber }, { receiptNumber }],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Nomor Order atau Nomor Resi sudah terdaftar dalam sistem.",
        },
        { status: 409 }
      );
    }

    // Generate secure public token for customer QC verification
    const publicToken = crypto.randomBytes(12).toString("hex");

    const order = await prisma.order.create({
      data: {
        orderNumber,
        receiptNumber,
        marketplace,
        customerName,
        customerPhone: customerPhone || null,
        status: "PENDING",
        publicToken,
        items: {
          create: (items || []).map((item: any) => ({
            itemName: item.itemName || "Produk Komputer K2C",
            qty: Number(item.qty) || 1,
            price: Number(item.price) || 0,
            serialNumber: item.serialNumber || null,
          })),
        },
      },
      include: {
        items: true,
        mediaProofs: true,
      },
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

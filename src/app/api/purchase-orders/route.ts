import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const supplierId = searchParams.get("supplierId")?.trim() || "";

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (supplierId && supplierId !== "ALL") {
      where.supplierId = supplierId;
    }
    if (q) {
      where.OR = [
        { poNumber: { contains: q } },
        { invoiceNumber: { contains: q } },
        { supplier: { name: { contains: q } } },
        { items: { some: { itemName: { contains: q } } } },
      ];
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, purchaseOrders });
  } catch (error: any) {
    console.error("GET /api/purchase-orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch purchase orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, invoiceNumber, notes, items, paymentStatus } = body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Supplier dan minimal 1 item barang pembelian wajib diisi." },
        { status: 400 }
      );
    }

    // Auto-generate PO Number: PO-YYYYMMDD-XXX
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const poNumber = `PO-${today}-${randomSuffix}`;

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, it: any) => sum + (Number(it.costPrice) || 0) * (Number(it.qty) || 1),
      0
    );

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        invoiceNumber: invoiceNumber?.trim() || null,
        supplierId,
        status: "ORDERED",
        paymentStatus: paymentStatus || "UNPAID",
        notes: notes?.trim() || null,
        totalAmount,
        items: {
          create: items.map((it: any) => ({
            productId: it.productId || null,
            itemName: it.itemName.trim(),
            qty: Number(it.qty) || 1,
            costPrice: Number(it.costPrice) || 0,
            receivedQty: 0,
          })),
        },
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    return NextResponse.json({ success: true, purchaseOrder }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/purchase-orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create purchase order" },
      { status: 500 }
    );
  }
}

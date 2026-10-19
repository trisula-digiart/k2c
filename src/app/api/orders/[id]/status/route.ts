import { NextRequest, NextResponse } from "next/server";
import { prisma, OrderStatus } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Can search by id, orderNumber, or receiptNumber
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }, { receiptNumber: id }],
      },
      include: {
        items: true,
        mediaProofs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("GET /api/orders/[id]/status error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, items } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update status if provided
    const updateData: any = {};
    if (status) {
      updateData.status = status;
    }

    // Update serial numbers of items if provided
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.id && typeof item.serialNumber !== "undefined") {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: { serialNumber: item.serialNumber.trim() || null },
          });
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        mediaProofs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("PATCH /api/orders/[id]/status error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui status" },
      { status: 500 }
    );
  }
}

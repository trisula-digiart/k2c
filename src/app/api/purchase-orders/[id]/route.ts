import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!po) {
      return NextResponse.json(
        { success: false, error: "Purchase order tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, purchaseOrder: po });
  } catch (error: any) {
    console.error("GET /api/purchase-orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch PO" },
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
    const { status, paymentStatus, invoiceNumber, notes } = body;

    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingPO) {
      return NextResponse.json(
        { success: false, error: "Purchase order tidak ditemukan" },
        { status: 404 }
      );
    }

    // REAL STOCK INCREMENT: If changing status to RECEIVED and was not already RECEIVED
    const isBecomingReceived = status === "RECEIVED" && existingPO.status !== "RECEIVED";

    const updated = await prisma.$transaction(async (tx) => {
      // 1. If received, increment product stocks
      if (isBecomingReceived) {
        for (const item of existingPO.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { increment: item.qty },
              },
            });
            // Update receivedQty in item
            await tx.purchaseOrderItem.update({
              where: { id: item.id },
              data: { receivedQty: item.qty },
            });
          }
        }
      }

      // 2. Update PO record
      return await tx.purchaseOrder.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(paymentStatus && { paymentStatus }),
          ...(typeof invoiceNumber !== "undefined" && { invoiceNumber: invoiceNumber?.trim() || null }),
          ...(typeof notes !== "undefined" && { notes: notes?.trim() || null }),
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      purchaseOrder: updated,
      stockUpdated: isBecomingReceived,
    });
  } catch (error: any) {
    console.error("PATCH /api/purchase-orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update PO" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.purchaseOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/purchase-orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete PO" },
      { status: 500 }
    );
  }
}

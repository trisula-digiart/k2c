import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, category, price, costPrice, stock, description } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(category && { category }),
        ...(typeof price !== "undefined" && { price: Number(price) }),
        ...(typeof costPrice !== "undefined" && { costPrice: Number(costPrice) }),
        ...(typeof stock !== "undefined" && { stock: Number(stock) }),
        ...(typeof description !== "undefined" && { description: description?.trim() || null }),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

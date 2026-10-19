import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku, name, category, price, costPrice, stock, description } = body;

    if (!sku || !name || !price) {
      return NextResponse.json(
        { success: false, error: "SKU, Nama Produk, dan Harga wajib diisi." },
        { status: 400 }
      );
    }

    // Check duplicate SKU
    const existing = await prisma.product.findUnique({
      where: { sku: sku.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `SKU '${sku}' sudah digunakan oleh produk lain.` },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku: sku.trim(),
        name: name.trim(),
        category: category || "PC_FULLSET",
        price: Number(price) || 0,
        costPrice: Number(costPrice) || 0,
        stock: Number(stock) || 0,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

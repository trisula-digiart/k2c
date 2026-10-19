import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { address: { contains: q } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, address, marketplace, notes } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nama Pelanggan wajib diisi." },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        marketplace: marketplace || "Offline",
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}

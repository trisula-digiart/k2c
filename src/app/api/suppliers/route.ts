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
        { contactPerson: { contains: q } },
        { phone: { contains: q } },
        { category: { contains: q } },
        { address: { contains: q } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, suppliers });
  } catch (error: any) {
    console.error("GET /api/suppliers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contactPerson, phone, email, address, category, notes } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nama Supplier / Perusahaan wajib diisi." },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        category: category || "HARDWARE",
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, supplier }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/suppliers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create supplier" },
      { status: 500 }
    );
  }
}

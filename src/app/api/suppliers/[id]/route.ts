import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, contactPerson, phone, email, address, category, notes } = body;

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(typeof contactPerson !== "undefined" && { contactPerson: contactPerson?.trim() || null }),
        ...(typeof phone !== "undefined" && { phone: phone?.trim() || null }),
        ...(typeof email !== "undefined" && { email: email?.trim() || null }),
        ...(typeof address !== "undefined" && { address: address?.trim() || null }),
        ...(category && { category }),
        ...(typeof notes !== "undefined" && { notes: notes?.trim() || null }),
      },
    });

    return NextResponse.json({ success: true, supplier: updated });
  } catch (error: any) {
    console.error("PATCH /api/suppliers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update supplier" },
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
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/suppliers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete supplier" },
      { status: 500 }
    );
  }
}

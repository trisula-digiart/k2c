import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, phone, email, address, marketplace, notes } = body;

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(typeof phone !== "undefined" && { phone: phone?.trim() || null }),
        ...(typeof email !== "undefined" && { email: email?.trim() || null }),
        ...(typeof address !== "undefined" && { address: address?.trim() || null }),
        ...(marketplace && { marketplace }),
        ...(typeof notes !== "undefined" && { notes: notes?.trim() || null }),
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    console.error("PATCH /api/customers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update customer" },
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
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete customer" },
      { status: 500 }
    );
  }
}

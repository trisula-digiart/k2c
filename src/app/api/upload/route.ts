import { NextRequest, NextResponse } from "next/server";
import { prisma, MediaType } from "@/lib/db";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string | null;
    const type = formData.get("type") as MediaType | null;
    const watermarkData = (formData.get("watermarkData") as string) || null;
    const autoUpdateStatus = formData.get("autoUpdateStatus") === "true";

    if (!file || !orderId || !type) {
      return NextResponse.json(
        {
          success: false,
          error: "Field 'file', 'orderId', dan 'type' wajib disertakan.",
        },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Map type to designated folder
    let subfolder = "qc-videos";
    if (type === "DISPATCH_PHOTO") {
      subfolder = "dispatches";
    } else if (type === "RETURN_UNBOXING") {
      subfolder = "returns";
    }

    // Determine extension
    let ext = ".jpg";
    const mime = file.type;
    if (mime.includes("video/webm")) ext = ".webm";
    else if (mime.includes("video/mp4")) ext = ".mp4";
    else if (mime.includes("image/png")) ext = ".png";
    else if (mime.includes("image/jpeg") || mime.includes("image/jpg")) ext = ".jpg";
    else if (file.name && path.extname(file.name)) ext = path.extname(file.name);

    const safeRandom = crypto.randomBytes(6).toString("hex");
    const filename = `${type.toLowerCase()}-${Date.now()}-${safeRandom}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let publicFilePath = `/uploads/${subfolder}/${filename}`;

    // Try saving to /public/uploads/ (local environment)
    let savedToPublic = false;
    try {
      const publicBase = path.join(process.cwd(), "public", "uploads", subfolder);
      if (!fs.existsSync(publicBase)) {
        fs.mkdirSync(publicBase, { recursive: true });
      }
      await fs.promises.writeFile(path.join(publicBase, filename), buffer);
      savedToPublic = true;
    } catch (e) {
      // Running on read-only serverless environment (e.g. Vercel)
      savedToPublic = false;
    }

    // If writing to /public failed (Vercel serverless), write to /tmp and provide fallback
    if (!savedToPublic) {
      try {
        const tmpBase = path.join("/tmp", "uploads", subfolder);
        if (!fs.existsSync(tmpBase)) {
          fs.mkdirSync(tmpBase, { recursive: true });
        }
        await fs.promises.writeFile(path.join(tmpBase, filename), buffer);
        publicFilePath = `/api/media/${subfolder}/${filename}`;
      } catch (err) {
        // Fallback for photos / small media: Data URL
        if (buffer.length < 5 * 1024 * 1024) {
          const base64 = buffer.toString("base64");
          publicFilePath = `data:${mime || "image/jpeg"};base64,${base64}`;
        }
      }
    }

    // Create MediaProof record
    const mediaProof = await prisma.mediaProof.create({
      data: {
        orderId,
        type,
        filePath: publicFilePath,
        watermarkData,
      },
    });

    // Optionally auto-update order status based on workflow action
    let updatedStatus = order.status;
    if (autoUpdateStatus) {
      if (type === "QC_VIDEO" && (order.status === "PENDING" || order.status === "QC_IN_PROGRESS")) {
        updatedStatus = "QC_COMPLETED";
      } else if (type === "DISPATCH_PHOTO") {
        updatedStatus = "DISPATCHED";
      } else if (type === "RETURN_UNBOXING") {
        updatedStatus = "RETURNED";
      }

      if (updatedStatus !== order.status) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: updatedStatus },
        });
      }
    }

    const freshOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        mediaProofs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      mediaProof,
      order: freshOrder,
    });
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengunggah file media" },
      { status: 500 }
    );
  }
}

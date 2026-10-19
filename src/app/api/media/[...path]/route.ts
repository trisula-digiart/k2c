import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params.path || [];
    const relativePath = segments.join("/");

    // Check /tmp/uploads first (for Vercel serverless), then /public/uploads
    const tmpPath = path.join("/tmp", "uploads", relativePath);
    const publicPath = path.join(process.cwd(), "public", "uploads", relativePath);

    let filePath = "";
    if (fs.existsSync(tmpPath)) {
      filePath = tmpPath;
    } else if (fs.existsSync(publicPath)) {
      filePath = publicPath;
    } else {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webm") contentType = "video/webm";
    else if (ext === ".mp4") contentType = "video/mp4";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to read media: " + err.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import crypto from "node:crypto";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

  // Validate mimetype and size (<= 5MB)
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxBytes = 5 * 1024 * 1024;
  if (!file.type || !allowed.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (typeof (file as any).size === "number" && (file as any).size > maxBytes) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const ab = await file.arrayBuffer();
  const bytes = new Uint8Array(ab);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name || "").toLowerCase() || ".jpg";
  const name = crypto.randomUUID().replace(/-/g, "");
  const filename = `${name}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  await fs.writeFile(filepath, bytes);

  // Generate tiny blur placeholder (base64 data URL)
  const blurBuffer = await sharp(bytes).resize(12).jpeg({ quality: 50 }).toBuffer();
  const blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString("base64")}`;

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url, blurDataUrl });
}

import { NextRequest, NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "banners";

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

    try {
      const files = await readdir(uploadDir);
      
      const images = files
        .filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
        .map((file) => ({
          filename: file,
          url: `/uploads/${folder}/${file}`,
          timestamp: parseInt(file.split("-").pop()?.split(".")[0] || "0"),
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      return NextResponse.json({ images });
    } catch (error) {
      // Directory doesn't exist yet
      return NextResponse.json({ images: [] });
    }
  } catch (error: any) {
    console.error("Gallery error:", error);
    return NextResponse.json(
      { error: "Failed to load gallery", details: error.message },
      { status: 500 }
    );
  }
}

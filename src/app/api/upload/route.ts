import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

// POST /api/upload - Upload image to Cloudinary
export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để upload ảnh" },
        { status: 401 }
      );
    }

    // 2. Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Không có file được gửi" },
        { status: 400 }
      );
    }

    // 3. Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)" },
        { status: 400 }
      );
    }

    // 4. Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File quá lớn (tối đa 5MB)" },
        { status: 400 }
      );
    }

    // 5. Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "reviews", // Store in 'reviews' folder
          resource_type: "image",
          transformation: [
            { width: 1000, height: 1000, crop: "limit" }, // Max 1000x1000
            { quality: "auto:good" }, // Auto quality optimization
            { fetch_format: "auto" }, // Auto format (WebP if supported)
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // 7. Return URL
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error("Error uploading to Cloudinary:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi upload ảnh" },
      { status: 500 }
    );
  }
}

// DELETE /api/upload?publicId=xxx - Delete image from Cloudinary (optional cleanup)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "publicId là bắt buộc" },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ message: "Xóa ảnh thành công" });
  } catch (error: any) {
    console.error("Error deleting from Cloudinary:", error);
    return NextResponse.json(
      { error: "Lỗi xóa ảnh" },
      { status: 500 }
    );
  }
}

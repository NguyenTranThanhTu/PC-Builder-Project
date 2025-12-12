import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// POST /api/admin/users/[id]/ban - Ban user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    const body = await req.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Vui lòng nhập lý do chặn tài khoản" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, isBanned: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: "Tài khoản này đã bị chặn" },
        { status: 400 }
      );
    }

    // Ban user
    const bannedUser = await prisma.user.update({
      where: { id },
      data: {
        isBanned: true,
        banReason: reason,
        bannedAt: new Date(),
        bannedBy: guard.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
        banReason: true,
        bannedAt: true,
      },
    });

    return NextResponse.json({
      message: "Đã chặn tài khoản thành công",
      user: bannedUser,
    });
  } catch (error) {
    console.error("[BAN_USER_ERROR]", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi chặn tài khoản" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id]/ban - Unban user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, isBanned: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    if (!user.isBanned) {
      return NextResponse.json(
        { error: "Tài khoản này chưa bị chặn" },
        { status: 400 }
      );
    }

    // Unban user
    const unbannedUser = await prisma.user.update({
      where: { id },
      data: {
        isBanned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
      },
    });

    return NextResponse.json({
      message: "Đã mở khóa tài khoản thành công",
      user: unbannedUser,
    });
  } catch (error) {
    console.error("[UNBAN_USER_ERROR]", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi mở khóa tài khoản" },
      { status: 500 }
    );
  }
}

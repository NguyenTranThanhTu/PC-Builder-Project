/**
 * Debug API: Check và Update User Role
 * Route: /api/debug/check-role
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        error: "Not logged in",
        message: "Bạn cần đăng nhập để sử dụng API này"
      }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, role: true }
    });

    // Check if email is in ADMIN_EMAILS
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    
    const isInAdminList = adminEmails.includes(session.user.email.toLowerCase());

    return NextResponse.json({
      success: true,
      session: {
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
      database: user,
      adminCheck: {
        emailInEnv: isInAdminList,
        adminEmails: adminEmails,
      },
      needsUpdate: user?.role !== "ADMIN" && isInAdminList,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        error: "Not logged in"
      }, { status: 401 });
    }

    // Check if email is in ADMIN_EMAILS
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    
    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      return NextResponse.json({
        error: "Email không có trong ADMIN_EMAILS",
        message: `Email ${session.user.email} không được phép làm admin`
      }, { status: 403 });
    }

    // Update user role to ADMIN
    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: { role: "ADMIN" },
      select: { id: true, email: true, name: true, role: true }
    });

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật role thành ADMIN. Vui lòng LOGOUT và LOGIN lại để session được cập nhật!",
      user: updated,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}

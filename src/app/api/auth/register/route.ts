import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user với avatar mặc định
    const defaultAvatar = "/images/users/default-avatar.png";
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "USER",
        image: defaultAvatar,
      },
    });
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

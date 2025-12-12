import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function parseAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || "";
  return emails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;


const providers = [] as NonNullable<NextAuthOptions["providers"]>;
if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
} else if (process.env.NODE_ENV !== "production") {
  // Avoid hard crashing OAuth when not configured locally; show a helpful warning instead
  console.warn(
    "[next-auth] Google OAuth not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local to enable sign-in."
  );
}

// Add CredentialsProvider for email/password login
providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "Enter your email" },
      password: { label: "Password", type: "password", placeholder: "Enter your password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      // Find user by email
      const user = await prisma.user.findUnique({ where: { email: credentials.email } });
      if (!user || !user.hashedPassword) return null;
      
      // Check if user is banned
      if (user.isBanned) {
        throw new Error(`BANNED:${user.banReason || "Tài khoản của bạn đã bị khóa"}`);
      }
      
      // Compare password (assume bcrypt)
      const bcrypt = require("bcryptjs");
      const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);
      if (!isValid) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      };
    },
  })
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      // Khi đăng nhập, merge thông tin user vào token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Luôn truyền đủ thông tin từ token về client
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
      }
      return session;
    },
  },
  pages: {
    // you can customize auth pages later if needed
  },
};

export async function isAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user?.email) return false;
  const allowlist = parseAdminEmails();
  const email = session.user.email.toLowerCase();
  if (allowlist.includes(email)) return true;
  // fallback to user role
  if ((session.user as any).role === "ADMIN") return true;
  return false;
}

// Helper for API routes to enforce ADMIN
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const ok = await isAdmin(session as any);
  if (!ok) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 403 }),
    };
  }
  return { 
    ok: true as const, 
    session,
    user: session?.user as any
  };
}

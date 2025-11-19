import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // expose id and role to client session
        // @ts-expect-error add custom fields
        session.user.id = user.id;
        // @ts-expect-error add custom fields
        session.user.role = user.role;
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
  return { ok: true as const, session };
}

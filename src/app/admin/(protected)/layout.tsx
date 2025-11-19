import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const ok = await isAdmin(session);
  if (!ok) {
    redirect("/admin/access-pending");
  }
  return <>{children}</>;
}

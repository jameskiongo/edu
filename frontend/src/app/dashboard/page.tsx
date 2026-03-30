import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export default async function Page() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login?message=auth_required");
  }

  if (session.role === "ADMIN") {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
}

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function Page() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login?message=auth_required");
  }

  if (session.role === "ADMIN") {
    return <AdminDashboard />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome back, {session.firstName}!</h1>
      <p className="text-muted-foreground mt-2">
        You are logged in as a {session.role?.toLowerCase()}.
      </p>
    </div>
  );
}

import { ProfileForm } from "@/components/auth/ProfileForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login?message=auth_required");
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <ProfileForm />
    </div>
  );
}

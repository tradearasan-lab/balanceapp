import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const userName =
    user.user_metadata?.full_name ?? user.email ?? "Пользователь";
  const avatarUrl = user.user_metadata?.avatar_url ?? "";

  return <DashboardClient userName={userName} avatarUrl={avatarUrl} />;
}

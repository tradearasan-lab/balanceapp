import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import {
  getAdminStats,
  getRegistrationsByDay,
  getTransactionsByDay,
  getAdminUsers,
  getAdminGroups,
  getAdSettings,
} from "@/lib/admin";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    notFound();
  }

  const admin = createAdminSupabase();

  const [stats, regChart, txChart, users, groups, adSettings] =
    await Promise.all([
      getAdminStats(admin),
      getRegistrationsByDay(admin),
      getTransactionsByDay(admin),
      getAdminUsers(admin),
      getAdminGroups(admin),
      getAdSettings(admin),
    ]);

  return (
    <AdminDashboard
      stats={stats}
      regChart={regChart}
      txChart={txChart}
      users={users}
      groups={groups}
      adSettings={adSettings}
    />
  );
}

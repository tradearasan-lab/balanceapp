import { SupabaseClient } from "@supabase/supabase-js";

export interface AdminStats {
  totalUsers: number;
  newUsers7d: number;
  newUsers30d: number;
  totalGroups: number;
  activeGroups7d: number;
  totalTransactions: number;
  transactionsToday: number;
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface AdminUser {
  id: string;
  email: string;
  plan: string;
  created_at: string;
  groups_count: number;
  transactions_count: number;
  last_activity: string | null;
}

export interface AdminGroup {
  id: string;
  name: string;
  emoji: string;
  owner_email: string;
  members_count: number;
  transactions_count: number;
  created_at: string;
}

export interface AdSettings {
  ad_text: string;
  ad_enabled: boolean;
}

export async function getAdminStats(
  supabase: SupabaseClient
): Promise<AdminStats> {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [
    { count: totalUsers },
    { count: newUsers7d },
    { count: newUsers30d },
    { count: totalGroups },
    { count: totalTransactions },
    { count: transactionsToday },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", d7),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", d30),
    supabase.from("groups").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("*", { count: "exact", head: true }).gte("created_at", today),
  ]);

  const { data: activeGroupsData } = await supabase
    .from("transactions")
    .select("group_id")
    .gte("created_at", d7);

  const activeGroupIds = new Set(activeGroupsData?.map((r) => r.group_id) ?? []);

  return {
    totalUsers: totalUsers ?? 0,
    newUsers7d: newUsers7d ?? 0,
    newUsers30d: newUsers30d ?? 0,
    totalGroups: totalGroups ?? 0,
    activeGroups7d: activeGroupIds.size,
    totalTransactions: totalTransactions ?? 0,
    transactionsToday: transactionsToday ?? 0,
  };
}

export async function getRegistrationsByDay(
  supabase: SupabaseClient
): Promise<DailyCount[]> {
  const d30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", d30);

  return aggregateByDay(data?.map((r) => r.created_at) ?? []);
}

export async function getTransactionsByDay(
  supabase: SupabaseClient
): Promise<DailyCount[]> {
  const d30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data } = await supabase
    .from("transactions")
    .select("created_at")
    .gte("created_at", d30);

  return aggregateByDay(data?.map((r) => r.created_at) ?? []);
}

function aggregateByDay(dates: string[]): DailyCount[] {
  const map = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    map.set(key, 0);
  }
  for (const d of dates) {
    const key = d.slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map, ([date, count]) => ({ date, count }));
}

export async function getAdminUsers(
  supabase: SupabaseClient
): Promise<AdminUser[]> {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!profiles) return [];

  const userIds = profiles.map((p) => p.id);

  const { data: memberships } = await supabase
    .from("group_members")
    .select("user_id, group_id")
    .in("user_id", userIds);

  const { data: txs } = await supabase
    .from("transactions")
    .select("user_id, created_at")
    .in("user_id", userIds);

  const groupCounts = new Map<string, number>();
  for (const m of memberships ?? []) {
    groupCounts.set(m.user_id, (groupCounts.get(m.user_id) ?? 0) + 1);
  }

  const txCounts = new Map<string, number>();
  const lastActivity = new Map<string, string>();
  for (const t of txs ?? []) {
    txCounts.set(t.user_id, (txCounts.get(t.user_id) ?? 0) + 1);
    const prev = lastActivity.get(t.user_id);
    if (!prev || t.created_at > prev) lastActivity.set(t.user_id, t.created_at);
  }

  return profiles.map((p) => ({
    id: p.id,
    email: p.email,
    plan: p.plan ?? "free",
    created_at: p.created_at,
    groups_count: groupCounts.get(p.id) ?? 0,
    transactions_count: txCounts.get(p.id) ?? 0,
    last_activity: lastActivity.get(p.id) ?? null,
  }));
}

export async function getAdminGroups(
  supabase: SupabaseClient
): Promise<AdminGroup[]> {
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });

  if (!groups) return [];

  const ownerIds = Array.from(new Set(groups.map((g) => g.created_by)));
  const { data: ownerProfiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", ownerIds);
  const ownerMap = new Map(
    (ownerProfiles ?? []).map((p) => [p.id, p.email])
  );

  const groupIds = groups.map((g) => g.id);

  const { data: members } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", groupIds);

  const { data: txs } = await supabase
    .from("transactions")
    .select("group_id")
    .in("group_id", groupIds);

  const memberCounts = new Map<string, number>();
  for (const m of members ?? []) {
    memberCounts.set(m.group_id, (memberCounts.get(m.group_id) ?? 0) + 1);
  }

  const txCounts = new Map<string, number>();
  for (const t of txs ?? []) {
    txCounts.set(t.group_id, (txCounts.get(t.group_id) ?? 0) + 1);
  }

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    emoji: g.emoji,
    owner_email: ownerMap.get(g.created_by) ?? "—",
    members_count: memberCounts.get(g.id) ?? 0,
    transactions_count: txCounts.get(g.id) ?? 0,
    created_at: g.created_at,
  }));
}

export async function getAdSettings(
  supabase: SupabaseClient
): Promise<AdSettings> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "ad_config")
    .single();

  if (data?.value) {
    return data.value as AdSettings;
  }
  return { ad_text: "", ad_enabled: false };
}

export async function saveAdSettings(
  supabase: SupabaseClient,
  settings: AdSettings
): Promise<void> {
  const { error } = await supabase.from("settings").upsert(
    { key: "ad_config", value: settings },
    { onConflict: "key" }
  );
  if (error) throw error;
}

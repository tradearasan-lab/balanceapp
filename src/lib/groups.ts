import { SupabaseClient } from "@supabase/supabase-js";
import { Group, GroupTransaction } from "@/types";

export async function getGroups(supabase: SupabaseClient): Promise<Group[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.group_id);
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createGroup(
  supabase: SupabaseClient,
  name: string,
  emoji: string
): Promise<Group> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  console.log("[createGroup] user.id:", user.id);
  console.log("[createGroup] name:", name, "emoji:", emoji);

  // Try created_by first (matches RLS policy), fallback to owner_id
  const { data, error } = await supabase
    .from("groups")
    .insert({ name, emoji, created_by: user.id })
    .select()
    .single();

  console.log("[createGroup] error details:", JSON.stringify(error));
  console.log("[createGroup] data:", data?.id ?? "no data");

  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }
  return data;
}

export async function renameGroup(
  supabase: SupabaseClient,
  groupId: string,
  newName: string
): Promise<void> {
  const { error } = await supabase
    .from("groups")
    .update({ name: newName })
    .eq("id", groupId);

  if (error) throw new Error(error.message || JSON.stringify(error));
}

export async function getGroupById(
  supabase: SupabaseClient,
  groupId: string
): Promise<Group | null> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) return null;
  return data;
}

export async function isMember(
  supabase: SupabaseClient,
  groupId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .single();

  return !!data;
}

export async function getMembersCount(
  supabase: SupabaseClient,
  groupId: string
): Promise<number> {
  const { count } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);

  return count ?? 0;
}

export async function getGroupTransactions(
  supabase: SupabaseClient,
  groupId: string
): Promise<GroupTransaction[]> {
  const { data: txs, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!txs || txs.length === 0) return [];

  const userIds = Array.from(new Set(txs.map((t) => t.user_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, { name: p.name, email: p.email }])
  );

  return txs.map((t) => ({
    ...t,
    profiles: profileMap.get(t.user_id) ?? undefined,
  }));
}

export async function addGroupTransaction(
  supabase: SupabaseClient,
  groupId: string,
  type: "income" | "expense",
  amount: number,
  comment: string
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("transactions").insert({
    group_id: groupId,
    user_id: user.id,
    type,
    amount,
    comment,
  });

  if (error) throw error;
}

export async function getGroupByInviteToken(
  supabase: SupabaseClient,
  token: string
): Promise<Group | null> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("invite_token", token)
    .single();

  if (error) return null;
  return data;
}

export async function joinGroup(
  supabase: SupabaseClient,
  groupId: string
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: user.id,
    role: "member",
  });

  if (error) throw error;
}

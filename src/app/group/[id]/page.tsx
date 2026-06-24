import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import {
  getGroupById,
  isMember,
  getGroupTransactions,
} from "@/lib/groups";
import GroupPageClient from "@/components/GroupPageClient";

interface Props {
  params: { id: string };
}

export default async function GroupPage({ params }: Props) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const group = await getGroupById(supabase, params.id);
  if (!group) notFound();

  const member = await isMember(supabase, group.id, user.id);
  if (!member) notFound();

  const transactions = await getGroupTransactions(supabase, group.id);

  const isOwner = group.created_by === user.id;

  return (
    <GroupPageClient
      group={group}
      initialTransactions={transactions}
      isOwner={isOwner}
      userId={user.id}
    />
  );
}

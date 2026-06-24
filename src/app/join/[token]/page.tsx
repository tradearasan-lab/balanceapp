import { redirect, notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import {
  getGroupByInviteToken,
  isMember,
  getMembersCount,
  joinGroup,
} from "@/lib/groups";
import JoinClient from "@/components/JoinClient";

const MAX_FREE_MEMBERS = 3;

interface Props {
  params: { token: string };
}

export default async function JoinPage({ params }: Props) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const group = await getGroupByInviteToken(supabase, params.token);
  if (!group) notFound();

  // Не авторизован — показываем страницу с кнопкой входа
  if (!user) {
    return <JoinClient group={group} token={params.token} status="login" />;
  }

  // Уже участник
  const already = await isMember(supabase, group.id, user.id);
  if (already) {
    redirect(`/group/${group.id}`);
  }

  // Лимит участников
  const count = await getMembersCount(supabase, group.id);
  if (count >= MAX_FREE_MEMBERS) {
    return <JoinClient group={group} token={params.token} status="full" />;
  }

  // Добавляем в группу
  await joinGroup(supabase, group.id);
  redirect(`/group/${group.id}`);
}

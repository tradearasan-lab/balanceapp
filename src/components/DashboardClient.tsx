"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Group } from "@/types";
import { createClient } from "@/lib/supabase";
import { createGroup, getGroups, renameGroup } from "@/lib/groups";
import CreateGroupModal from "./CreateGroupModal";
import PlanBadge from "./PlanBadge";
import AdSlot from "./AdSlot";

const MAX_FREE_GROUPS = 5;

interface Props {
  userName: string;
  avatarUrl: string;
}

export default function DashboardClient({ userName, avatarUrl }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const loadGroups = useCallback(async () => {
    try {
      const data = await getGroups(supabase);
      setGroups(data);
    } catch (err) {
      console.error("[loadGroups]", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleCreateGroup(name: string, emoji: string) {
    if (groups.length >= MAX_FREE_GROUPS) return;
    setCreating(true);
    setError("");
    try {
      await createGroup(supabase, name, emoji);
      await loadGroups();
      setModalOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null
            ? JSON.stringify(err)
            : String(err);
      setError(msg);
    } finally {
      setCreating(false);
    }
  }

  function startRename(group: Group) {
    setRenamingId(group.id);
    setRenameValue(group.name);
  }

  async function handleRename(groupId: string) {
    if (!renameValue.trim()) return;
    setError("");
    try {
      await renameGroup(supabase, groupId, renameValue.trim());
      setRenamingId(null);
      await loadGroups();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    }
  }

  const canCreateMore = groups.length < MAX_FREE_GROUPS;

  return (
    <div
      className="mx-auto flex h-[100dvh] max-w-md flex-col overflow-hidden px-4 pt-6"
      style={{ backgroundColor: "#0f0f0f" }}
    >
      {/* Header — fixed */}
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full"
              referrerPolicy="no-referrer"
              unoptimized
            />
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm"
              style={{ backgroundColor: "#1a1a1a", color: "#999" }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium" style={{ color: "#fff" }}>
              {userName}
            </p>
            <PlanBadge plan="free" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-xs transition"
            style={{ backgroundColor: "#1a1a1a", color: "#999" }}
          >
            Калькулятор
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-1.5 text-xs transition"
            style={{ backgroundColor: "#1a1a1a", color: "#999" }}
          >
            Выйти
          </button>
        </div>
      </div>

      <AdSlot className="mb-3 shrink-0" />

      {error && (
        <div
          className="mb-3 shrink-0 rounded-xl p-3 text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}
        >
          {error}
        </div>
      )}

      {/* Groups header — fixed */}
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-medium" style={{ color: "#999" }}>
          Мои группы
        </h2>
        <span className="text-xs" style={{ color: "#555" }}>
          {groups.length}/{MAX_FREE_GROUPS} (Free)
        </span>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
      {loading ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2"
            style={{ borderColor: "#333", borderTopColor: "#22c55e" }}
          />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 text-4xl">📊</div>
          <p className="mb-1 text-sm font-medium" style={{ color: "#999" }}>
            У вас пока нет групп
          </p>
          <p className="mb-4 text-xs" style={{ color: "#666" }}>
            Создайте группу для совместного учёта
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg px-4 py-2.5 text-sm font-medium transition"
            style={{ backgroundColor: "#22c55e", color: "#fff" }}
          >
            Создать группу
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <div key={group.id}>
              {renamingId === group.id ? (
                <div
                  className="flex items-center gap-2 rounded-xl p-4"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <span className="text-2xl">{group.emoji}</span>
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    maxLength={40}
                    autoFocus
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "#252525", color: "#fff" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(group.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                  />
                  <button
                    onClick={() => handleRename(group.id)}
                    className="rounded-lg px-3 py-2 text-xs font-medium"
                    style={{ backgroundColor: "#22c55e", color: "#fff" }}
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setRenamingId(null)}
                    className="rounded-lg px-3 py-2 text-xs"
                    style={{ backgroundColor: "#252525", color: "#999" }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-3 rounded-xl p-4"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <Link
                    href={`/group/${group.id}`}
                    className="flex flex-1 items-center gap-3"
                  >
                    <span className="text-2xl">{group.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "#fff" }}>
                        {group.name}
                      </p>
                      <p className="text-xs" style={{ color: "#666" }}>
                        {new Date(group.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => startRename(group)}
                    className="rounded-lg px-2 py-1.5 text-xs transition"
                    style={{ backgroundColor: "#252525", color: "#999" }}
                    title="Переименовать"
                  >
                    ✏️
                  </button>
                  <Link href={`/group/${group.id}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      style={{ color: "#555" }}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create group button (when groups exist and limit allows) */}
      {canCreateMore && groups.length > 0 && !loading && (
        <button
          onClick={() => setModalOpen(true)}
          className="mt-4 w-full rounded-xl py-3 text-sm font-medium transition"
          style={{ backgroundColor: "#22c55e", color: "#fff" }}
        >
          + Создать группу
        </button>
      )}

      {/* Limit info for Free */}
      {!canCreateMore && !loading && (
        <div
          className="mt-4 rounded-xl p-4 text-center"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <p className="text-sm" style={{ color: "#999" }}>
            Достигнут лимит {MAX_FREE_GROUPS} групп на Free-плане.
          </p>
          <p className="mt-1 text-xs" style={{ color: "#666" }}>
            Для неограниченных групп перейдите на Pro.
          </p>
        </div>
      )}
      </div>{/* end scrollable */}

      <CreateGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateGroup}
        loading={creating}
      />
    </div>
  );
}

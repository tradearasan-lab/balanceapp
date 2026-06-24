"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AdminStats,
  DailyCount,
  AdminUser,
  AdminGroup,
  AdSettings,
} from "@/lib/admin";

interface Props {
  stats: AdminStats;
  regChart: DailyCount[];
  txChart: DailyCount[];
  users: AdminUser[];
  groups: AdminGroup[];
  adSettings: AdSettings;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function BarChart({ data, label }: { data: DailyCount[]; label: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl bg-zinc-900 p-4">
      <p className="mb-3 text-sm font-medium text-zinc-400">{label}</p>
      <div className="flex items-end gap-[2px]" style={{ height: 80 }}>
        {data.map((d) => (
          <div key={d.date} className="group relative flex-1">
            <div
              className="w-full rounded-t bg-emerald-500 transition-all group-hover:bg-emerald-400"
              style={{
                height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%`,
                minHeight: d.count > 0 ? 2 : 0,
              }}
            />
            <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-white group-hover:block">
              {d.count}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard({
  stats,
  regChart,
  txChart,
  users,
  groups,
  adSettings: initialAd,
}: Props) {
  const [adText, setAdText] = useState(initialAd.ad_text);
  const [adEnabled, setAdEnabled] = useState(initialAd.ad_enabled);
  const [adSaving, setAdSaving] = useState(false);

  async function handleSaveAd() {
    setAdSaving(true);
    try {
      await fetch("/admin/api/ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad_text: adText, ad_enabled: adEnabled }),
      });
    } finally {
      setAdSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Админ-панель</h1>
        <Link
          href="/dashboard"
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-700"
        >
          К дашборду
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Всего пользователей" value={stats.totalUsers} />
        <StatCard label="Новые за 7 дней" value={stats.newUsers7d} />
        <StatCard label="Новые за 30 дней" value={stats.newUsers30d} />
        <StatCard label="Всего групп" value={stats.totalGroups} />
        <StatCard label="Активные группы (7д)" value={stats.activeGroups7d} />
        <StatCard label="Всего транзакций" value={stats.totalTransactions} />
        <StatCard label="Транзакций сегодня" value={stats.transactionsToday} />
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <BarChart data={regChart} label="Регистрации (30 дней)" />
        <BarChart data={txChart} label="Транзакции (30 дней)" />
      </div>

      {/* Users table */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-zinc-400">
          Пользователи ({users.length})
        </h2>
        <div className="overflow-x-auto rounded-xl bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">План</th>
                <th className="px-4 py-3">Регистрация</th>
                <th className="px-4 py-3">Групп</th>
                <th className="px-4 py-3">Транзакций</th>
                <th className="px-4 py-3">Последняя активность</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-zinc-800/50 text-zinc-300"
                >
                  <td className="px-4 py-2.5 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        u.plan === "pro"
                          ? "bg-emerald-600/20 text-emerald-400"
                          : u.plan === "business"
                            ? "bg-amber-600/20 text-amber-400"
                            : "bg-zinc-700 text-zinc-400"
                      }`}
                    >
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">
                    {new Date(u.created_at).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-2.5">{u.groups_count}</td>
                  <td className="px-4 py-2.5">{u.transactions_count}</td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">
                    {u.last_activity
                      ? new Date(u.last_activity).toLocaleDateString("ru-RU")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Groups table */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-zinc-400">
          Группы ({groups.length})
        </h2>
        <div className="overflow-x-auto rounded-xl bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                <th className="px-4 py-3">Группа</th>
                <th className="px-4 py-3">Создатель</th>
                <th className="px-4 py-3">Участников</th>
                <th className="px-4 py-3">Транзакций</th>
                <th className="px-4 py-3">Создана</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-zinc-800/50 text-zinc-300"
                >
                  <td className="px-4 py-2.5">
                    {g.emoji} {g.name}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {g.owner_email}
                  </td>
                  <td className="px-4 py-2.5">{g.members_count}</td>
                  <td className="px-4 py-2.5">{g.transactions_count}</td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">
                    {new Date(g.created_at).toLocaleDateString("ru-RU")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad management */}
      <div className="rounded-xl bg-zinc-900 p-4">
        <h2 className="mb-3 text-sm font-medium text-zinc-400">
          Управление рекламой
        </h2>
        <textarea
          value={adText}
          onChange={(e) => setAdText(e.target.value)}
          placeholder="Текст рекламного блока..."
          rows={3}
          className="mb-3 w-full rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <button
              onClick={() => setAdEnabled(!adEnabled)}
              className={`relative h-6 w-11 rounded-full transition ${
                adEnabled ? "bg-emerald-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  adEnabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
            {adEnabled ? "Включена" : "Выключена"}
          </label>
          <button
            onClick={handleSaveAd}
            disabled={adSaving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {adSaving ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

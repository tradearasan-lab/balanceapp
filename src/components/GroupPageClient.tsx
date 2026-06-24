"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Group, GroupTransaction, TransactionType } from "@/types";
import { createClient } from "@/lib/supabase";
import { addGroupTransaction, getGroupTransactions } from "@/lib/groups";
import AdSlot from "./AdSlot";

interface Props {
  group: Group;
  initialTransactions: GroupTransaction[];
  isOwner: boolean;
  userId: string;
}

export default function GroupPageClient({
  group,
  initialTransactions,
  isOwner,
}: Props) {
  const supabase = createClient();
  const [transactions, setTransactions] =
    useState<GroupTransaction[]>(initialTransactions);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const income = transactions.reduce(
    (s, t) => s + (t.type === "income" ? t.amount : 0),
    0
  );
  const expense = transactions.reduce(
    (s, t) => s + (t.type === "expense" ? t.amount : 0),
    0
  );
  const balance = income - expense;

  const reload = useCallback(async () => {
    const data = await getGroupTransactions(supabase, group.id);
    setTransactions(data);
  }, [supabase, group.id]);

  function openModal(type: TransactionType) {
    setModalType(type);
    setAmount("");
    setComment("");
    setModalOpen(true);
  }

  async function handleSubmit() {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    setSaving(true);
    try {
      await addGroupTransaction(supabase, group.id, modalType, num, comment.trim());
      await reload();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyInvite() {
    const url = `${window.location.origin}/join/${group.invite_token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-8 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">
            {group.emoji} {group.name}
          </h1>
        </div>
        <button
          onClick={handleCopyInvite}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-700"
        >
          {copied ? "Скопировано!" : "Пригласить"}
        </button>
      </div>

      {/* Balance Card */}
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-5">
        <p className="text-sm text-zinc-400">Баланс группы</p>
        <p
          className={`mt-1 text-3xl font-bold ${
            balance > 0
              ? "text-emerald-400"
              : balance < 0
                ? "text-red-400"
                : "text-white"
          }`}
        >
          {balance > 0 ? "+" : balance < 0 ? "−" : ""}
          {Math.abs(balance).toLocaleString("ru-RU")}
        </p>
        <div className="mt-3 flex gap-4">
          <div>
            <p className="text-xs text-zinc-500">Доходы</p>
            <p className="text-sm font-semibold text-emerald-400">
              +{income.toLocaleString("ru-RU")}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Расходы</p>
            <p className="text-sm font-semibold text-red-400">
              −{expense.toLocaleString("ru-RU")}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons — only owner */}
      {isOwner && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => openModal("income")}
            className="flex-1 rounded-xl bg-emerald-600/10 py-3 text-sm font-medium text-emerald-400 transition hover:bg-emerald-600/20"
          >
            + Доход
          </button>
          <button
            onClick={() => openModal("expense")}
            className="flex-1 rounded-xl bg-red-600/10 py-3 text-sm font-medium text-red-400 transition hover:bg-red-600/20"
          >
            − Расход
          </button>
        </div>
      )}

      <AdSlot className="mb-4" />

      {/* Transactions */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-400">История</h2>
        <span className="text-xs text-zinc-600">
          {transactions.length} операций
        </span>
      </div>

      {transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Пока нет операций
        </p>
      ) : (
        <div className="flex-1 space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="rounded-xl bg-zinc-900 px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-base font-semibold ${
                    tx.type === "income" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {tx.type === "income" ? "+" : "−"}
                  {tx.amount.toLocaleString("ru-RU")}
                </span>
                <span className="text-xs text-zinc-600">
                  {new Date(tx.created_at).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              {tx.comment && (
                <p className="mt-0.5 text-sm text-zinc-500">{tx.comment}</p>
              )}
              <p className="mt-0.5 text-xs text-zinc-600">
                {tx.profiles?.name ?? tx.profiles?.email ?? "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">
              {modalType === "income" ? "Новый доход" : "Новый расход"}
            </h2>

            <input
              type="number"
              inputMode="decimal"
              placeholder="Сумма"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mb-3 w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <input
              type="text"
              placeholder="Комментарий (необязательно)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-lg bg-zinc-800 py-3 text-sm font-medium text-zinc-400 transition hover:bg-zinc-700"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className={`flex-1 rounded-lg py-3 text-sm font-medium text-white transition disabled:opacity-50 ${
                  modalType === "income"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {saving ? "Сохраняем..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

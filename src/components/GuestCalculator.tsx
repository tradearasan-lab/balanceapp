"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Transaction, TransactionType } from "@/types";
import { addTransaction, clearTransactions, getTransactions } from "@/lib/localStorage";
import { createClient } from "@/lib/supabase";
import TransactionList from "./TransactionList";
import AdSlot from "./AdSlot";

export default function GuestCalculator() {
  const supabase = useMemo(() => createClient(), []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setTransactions(getTransactions());
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setLoggedIn(true);
    });
  }, [supabase]);

  const balance = transactions.reduce(
    (sum, tx) => sum + (tx.type === "income" ? tx.amount : -tx.amount),
    0
  );

  const balanceFormatted =
    (balance >= 0 ? "" : "−") + Math.abs(balance).toLocaleString("ru-RU");

  const handleAdd = useCallback(
    (type: TransactionType) => {
      const num = parseFloat(amount);
      if (!num || num <= 0) return;
      const tx: Transaction = {
        id: crypto.randomUUID(),
        type,
        amount: num,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };
      setTransactions(addTransaction(tx));
      setAmount("");
      setComment("");
    },
    [amount, comment]
  );

  function handleGoogleLogin() {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  const authButton = loggedIn ? (
    <Link
      href="/dashboard"
      className="rounded-lg px-3 py-1.5 text-xs font-medium transition"
      style={{ backgroundColor: "#1a1a1a", color: "#22c55e" }}
    >
      Мои группы →
    </Link>
  ) : (
    <button
      onClick={handleGoogleLogin}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition"
      style={{ backgroundColor: "#1a1a1a", color: "#999" }}
    >
      <svg className="h-3 w-3" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Войти
    </button>
  );

  return (
    <div
      className="mx-auto flex h-[100dvh] max-w-md flex-col overflow-hidden px-4 pt-6"
      style={{ backgroundColor: "#0f0f0f" }}
    >
      {/* Header — fixed */}
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#ffffff" }}>
            BalanceApp
          </h1>
          <p className="mt-0.5 text-xs" style={{ color: "#777" }}>
            Личный учёт финансов
          </p>
        </div>
        {authButton}
      </div>

      {/* Balance — fixed */}
      <div ref={balanceRef} className="mb-4 shrink-0 text-center">
        <p className="text-sm" style={{ color: "#777" }}>Баланс</p>
        <p
          className="mt-1 text-4xl font-bold"
          style={{ color: balance >= 0 ? "#ffffff" : "#ef4444" }}
        >
          {balanceFormatted}
        </p>
      </div>

      {/* Input — fixed */}
      <input
        type="number"
        inputMode="decimal"
        placeholder="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-2 w-full shrink-0 rounded-xl px-4 py-3 text-center text-2xl font-semibold outline-none"
        style={{ backgroundColor: "#1a1a1a", color: "#ffffff", border: "none" }}
      />
      <input
        type="text"
        placeholder="Комментарий..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-3 w-full shrink-0 rounded-xl px-4 py-2.5 text-center text-sm outline-none"
        style={{ backgroundColor: "#1a1a1a", color: "#ffffff", border: "none" }}
      />

      {/* Action buttons — fixed */}
      <div className="mb-3 flex shrink-0 gap-3">
        <button
          onClick={() => handleAdd("expense")}
          className="flex-1 rounded-xl py-3.5 text-base font-semibold transition active:scale-[0.98]"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}
        >
          − Расход
        </button>
        <button
          onClick={() => handleAdd("income")}
          className="flex-1 rounded-xl py-3.5 text-base font-semibold transition active:scale-[0.98]"
          style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e" }}
        >
          + Доход
        </button>
      </div>

      <AdSlot className="mb-3 shrink-0" />

      {/* History header — fixed */}
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-medium" style={{ color: "#999" }}>
          История
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "#555" }}>
            {transactions.length} операций
          </span>
          {transactions.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="rounded-lg px-2.5 py-1 text-xs transition"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {/* Scrollable transaction list */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
        <TransactionList transactions={transactions} />
      </div>

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: "#1a1a1a" }}>
            <h3 className="mb-2 text-lg font-semibold" style={{ color: "#fff" }}>
              Очистить историю?
            </h3>
            <p className="mb-6 text-sm" style={{ color: "#999" }}>
              Все транзакции будут удалены навсегда. Продолжить?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-xl py-3 text-sm font-medium transition"
                style={{ backgroundColor: "#252525", color: "#999" }}
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  clearTransactions();
                  setTransactions([]);
                  setShowClearConfirm(false);
                }}
                className="flex-1 rounded-xl py-3 text-sm font-medium transition"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}
              >
                Удалить всё
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

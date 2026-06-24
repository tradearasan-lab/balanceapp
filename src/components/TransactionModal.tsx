"use client";

import { useState } from "react";
import { TransactionType } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (type: TransactionType, amount: number, comment: string) => void;
}

export default function TransactionModal({ open, onClose, onSubmit }: Props) {
  const [type, setType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");

  if (!open) return null;

  function handleSubmit() {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    onSubmit(type, num, comment.trim());
    setAmount("");
    setComment("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Новая операция
        </h2>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setType("income")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              type === "income"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            Доход
          </button>
          <button
            onClick={() => setType("expense")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              type === "expense"
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            Расход
          </button>
        </div>

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
            onClick={onClose}
            className="flex-1 rounded-lg bg-zinc-800 py-3 text-sm font-medium text-zinc-400 transition hover:bg-zinc-700"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-emerald-600 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm" style={{ color: "#666" }}>
        Пока нет операций
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <div className="min-w-0 flex-1">
            <span
              className="text-base font-semibold"
              style={{
                color: tx.type === "income" ? "#22c55e" : "#ef4444",
              }}
            >
              {tx.type === "income" ? "+" : "−"}
              {tx.amount.toLocaleString("ru-RU")}
            </span>
            {tx.comment && (
              <p
                className="mt-0.5 truncate text-sm"
                style={{ color: "#777" }}
              >
                {tx.comment}
              </p>
            )}
          </div>
          <span className="text-xs" style={{ color: "#555" }}>
            {new Date(tx.createdAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

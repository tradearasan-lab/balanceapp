import { Transaction } from "@/types";

const STORAGE_KEY = "balanceapp_transactions";

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function addTransaction(tx: Transaction): Transaction[] {
  const list = getTransactions();
  list.unshift(tx);
  saveTransactions(list);
  return list;
}

export function deleteTransaction(id: string): Transaction[] {
  const list = getTransactions().filter((t) => t.id !== id);
  saveTransactions(list);
  return list;
}

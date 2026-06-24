"use client";

interface Props {
  name: string;
  balance: number;
  membersCount: number;
}

export default function GroupCard({ name, balance, membersCount }: Props) {
  return (
    <div className="rounded-xl bg-zinc-900 p-4">
      <h3 className="text-sm font-medium text-white">{name}</h3>
      <p
        className={`mt-1 text-xl font-bold ${
          balance >= 0 ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {balance >= 0 ? "+" : ""}
        {balance.toLocaleString("ru-RU")}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {membersCount} {membersCount === 1 ? "участник" : "участников"}
      </p>
    </div>
  );
}

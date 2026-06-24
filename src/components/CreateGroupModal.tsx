"use client";

import { useState } from "react";

const EMOJIS = ["💰", "🏠", "🚗", "🍔", "✈️", "🎮", "📱", "💼", "🎓", "❤️", "🐱", "⚽"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, emoji: string) => void;
  loading?: boolean;
}

export default function CreateGroupModal({
  open,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💰");

  if (!open) return null;

  function handleSubmit() {
    if (!name.trim() || loading) return;
    onSubmit(name.trim(), emoji);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "#fff" }}>
          Новая группа
        </h2>

        <div className="mb-4">
          <p className="mb-2 text-sm" style={{ color: "#999" }}>Иконка</p>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-xl transition"
                style={{
                  backgroundColor: emoji === e ? "rgba(34,197,94,0.2)" : "#252525",
                  outline: emoji === e ? "2px solid #22c55e" : "none",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Название группы"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="mb-4 w-full rounded-lg px-4 py-3 text-sm outline-none"
          style={{ backgroundColor: "#252525", color: "#fff" }}
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg py-3 text-sm font-medium transition"
            style={{ backgroundColor: "#252525", color: "#999" }}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex-1 rounded-lg py-3 text-sm font-medium transition disabled:opacity-50"
            style={{ backgroundColor: "#22c55e", color: "#fff" }}
          >
            {loading ? "Создаём..." : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
}

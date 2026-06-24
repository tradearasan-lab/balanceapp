"use client";

interface Props {
  className?: string;
}

export default function AdSlot({ className = "" }: Props) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl px-4 py-3 ${className}`}
      style={{
        backgroundColor: "rgba(26,26,26,0.5)",
        border: "1px dashed #333",
      }}
    >
      <span className="text-xs" style={{ color: "#555" }}>
        Рекламный блок
      </span>
    </div>
  );
}

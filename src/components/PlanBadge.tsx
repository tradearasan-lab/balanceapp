"use client";

type Plan = "free" | "pro" | "business";

interface Props {
  plan: Plan;
}

const labels: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

const colors: Record<Plan, string> = {
  free: "bg-zinc-700 text-zinc-300",
  pro: "bg-emerald-600/20 text-emerald-400",
  business: "bg-amber-600/20 text-amber-400",
};

export default function PlanBadge({ plan }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[plan]}`}
    >
      {labels[plan]}
    </span>
  );
}

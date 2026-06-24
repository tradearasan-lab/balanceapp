"use client";

interface Props {
  className?: string;
}

export default function AdSlot({ className = "" }: Props) {
  return <div className={className} />;
}

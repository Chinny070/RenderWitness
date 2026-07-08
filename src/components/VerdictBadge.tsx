"use client";

import { Verdict, VERDICT_CONFIG } from "@/lib/types";

export function VerdictBadge({
  verdict,
  size = "md",
}: {
  verdict: Verdict;
  size?: "sm" | "md" | "lg";
}) {
  const config = VERDICT_CONFIG[verdict];
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[0.65rem]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-[family-name:var(--font-mono)] font-medium uppercase tracking-wider ${sizeClasses[size]}`}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}

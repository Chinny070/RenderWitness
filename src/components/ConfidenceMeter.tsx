"use client";

import { Confidence } from "@/lib/types";

const LEVELS: Record<Confidence, { width: string; color: string; label: string }> = {
  low: { width: "25%", color: "#FF5A66", label: "Low" },
  medium: { width: "50%", color: "#F6B84B", label: "Medium" },
  high: { width: "75%", color: "#4BA3FF", label: "High" },
  very_high: { width: "100%", color: "#36D399", label: "Very High" },
};

export function ConfidenceMeter({ confidence }: { confidence: Confidence }) {
  const level = LEVELS[confidence];

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 rounded-full bg-deep-slate">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: level.width, backgroundColor: level.color }}
        />
      </div>
      <span
        className="font-[family-name:var(--font-mono)] text-xs font-medium"
        style={{ color: level.color }}
      >
        {level.label}
      </span>
    </div>
  );
}

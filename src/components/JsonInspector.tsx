"use client";

import { useState } from "react";

export function JsonInspector({
  data,
  label,
}: {
  data: Record<string, unknown> | null;
  label: string;
}) {
  const [open, setOpen] = useState(true);

  if (!data) return null;

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="panel-header flex w-full items-center justify-between text-left"
      >
        <span>{label}</span>
        <span className="text-muted">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <pre className="overflow-x-auto p-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-muted">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

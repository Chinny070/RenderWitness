"use client";

export function RiskFlags({ flags }: { flags: string }) {
  if (!flags || flags.trim() === "") return null;

  const items = flags.split("|").filter(Boolean);

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((flag) => (
        <span
          key={flag}
          className="rounded bg-warning-amber/10 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[0.65rem] text-warning-amber"
        >
          {flag}
        </span>
      ))}
    </div>
  );
}

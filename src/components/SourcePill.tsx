"use client";

const AUTHORITY_COLORS: Record<string, string> = {
  official_primary: "#36D399",
  official_secondary: "#4BA3FF",
  public_repository: "#4BA3FF",
  public_dashboard: "#4BA3FF",
  community_mirror: "#F6B84B",
  third_party_report: "#F6B84B",
  unknown: "#9AA7B8",
  suspicious: "#FF5A66",
};

const STABILITY_COLORS: Record<string, string> = {
  stable_static: "#36D399",
  stable_api: "#36D399",
  rendered_dynamic: "#4BA3FF",
  frequently_changing: "#F6B84B",
  login_required: "#FF5A66",
  blocked: "#FF5A66",
  unreachable: "#FF5A66",
  unknown: "#9AA7B8",
};

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function AuthorityPill({ value }: { value: string }) {
  const color = AUTHORITY_COLORS[value] ?? "#9AA7B8";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-[family-name:var(--font-mono)] text-[0.65rem] capitalize"
      style={{ color, backgroundColor: color + "18" }}
    >
      {formatLabel(value)}
    </span>
  );
}

export function StabilityPill({ value }: { value: string }) {
  const color = STABILITY_COLORS[value] ?? "#9AA7B8";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-[family-name:var(--font-mono)] text-[0.65rem] capitalize"
      style={{ color, backgroundColor: color + "18" }}
    >
      {formatLabel(value)}
    </span>
  );
}

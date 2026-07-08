"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClaimPacket, ResultPacket, CLAIM_TYPE_LABELS, ClaimType, Verdict } from "@/lib/types";
import { getAllClaims, getResult } from "@/lib/genlayer";
import { VerdictBadge } from "@/components/VerdictBadge";

type ClaimWithResult = {
  claim: ClaimPacket;
  result: ResultPacket | null;
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "SUPPORTED", label: "Supported" },
  { value: "CONTRADICTED", label: "Contradicted" },
  { value: "UNVERIFIABLE", label: "Unverifiable" },
  { value: "pending", label: "Pending" },
];

export default function ExplorePage() {
  const [items, setItems] = useState<ClaimWithResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const claims = await getAllClaims();
      const withResults = await Promise.all(
        claims.map(async (claim) => {
          const result = await getResult(claim.claim_id);
          return { claim, result };
        })
      );
      setItems(withResults);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "pending") return item.claim.status === "pending";
    return item.result?.verdict === filter;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-bright">
            Explore Verifications
          </h1>
          <p className="mt-1 text-sm text-muted">
            Recent source claims verified through GenLayer consensus.
          </p>
        </div>
        <Link href="/submit" className="btn-primary shrink-0">
          New Claim
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs transition-colors ${
              filter === f.value
                ? "bg-source-blue/20 text-source-blue"
                : "bg-deep-slate text-muted hover:text-bright"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-source-blue border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="mb-2 font-[family-name:var(--font-display)] text-lg font-semibold text-bright">
            No source claims have been witnessed yet.
          </p>
          <p className="mb-6 text-sm text-muted">
            Create the first claim packet and let GenLayer validators judge the
            source.
          </p>
          <Link href="/submit" className="btn-primary">
            Create First Claim
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const domain = (() => {
              try {
                return new URL(item.claim.source_url).hostname;
              } catch {
                return item.claim.source_url;
              }
            })();

            return (
              <Link
                key={item.claim.claim_id}
                href={`/claim/${item.claim.claim_id}`}
                className="panel flex flex-col p-5 transition-colors hover:border-source-blue/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded bg-deep-slate px-2 py-0.5 font-[family-name:var(--font-mono)] text-[0.6rem] text-muted">
                    {CLAIM_TYPE_LABELS[item.claim.claim_type as ClaimType]
                      ?.replace(/ /g, " ")
                      .toLowerCase() ?? item.claim.claim_type}
                  </span>
                  {item.result ? (
                    <VerdictBadge
                      verdict={item.result.verdict as Verdict}
                      size="sm"
                    />
                  ) : (
                    <span className="font-[family-name:var(--font-mono)] text-[0.6rem] text-muted">
                      PENDING
                    </span>
                  )}
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-sm font-semibold text-bright">
                  {item.claim.title}
                </h3>
                {item.result && (
                  <p className="mb-3 flex-1 text-xs leading-relaxed text-muted">
                    {item.result.short_reason}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-[family-name:var(--font-mono)] text-[0.6rem] text-line-grid">
                    {domain}
                  </span>
                  {item.result && (
                    <span className="font-[family-name:var(--font-mono)] text-[0.6rem] capitalize text-muted">
                      {item.result.confidence.replace("_", " ")}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

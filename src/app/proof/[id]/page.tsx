"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ClaimPacket, ResultPacket, CLAIM_TYPE_LABELS, ClaimType } from "@/lib/types";
import { getClaim, getResult } from "@/lib/genlayer";
import { VerdictBadge } from "@/components/VerdictBadge";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { RiskFlags } from "@/components/RiskFlags";

export default function ProofPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [claim, setClaim] = useState<ClaimPacket | null>(null);
  const [result, setResult] = useState<ResultPacket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const c = await getClaim(id);
      setClaim(c);
      const r = await getResult(id);
      setResult(r);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-source-blue border-t-transparent" />
      </div>
    );
  }

  if (!claim || !result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="panel p-8 text-center">
          <p className="mb-2 font-[family-name:var(--font-display)] text-lg font-semibold text-bright">
            Proof Not Available
          </p>
          <p className="mb-4 font-[family-name:var(--font-mono)] text-xs text-muted">
            {!claim
              ? `Claim #${id} does not exist.`
              : "Verification has not completed yet."}
          </p>
          <Link href="/explore" className="btn-secondary">
            Browse Claims
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <p className="mb-3 font-[family-name:var(--font-mono)] text-xs text-muted">
          Public Proof #{id}
        </p>
        <VerdictBadge verdict={result.verdict} size="lg" />
      </div>

      <div className="panel mb-6">
        <div className="panel-header">Verified Claim</div>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded bg-deep-slate px-2 py-0.5 font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
              {CLAIM_TYPE_LABELS[claim.claim_type as ClaimType] ??
                claim.claim_type}
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-bright">
            {claim.title}
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            {claim.statement}
          </p>
          <div className="rounded border border-line-grid bg-deep-slate p-3">
            <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
              SOURCE
            </span>
            <p className="mt-1 truncate font-[family-name:var(--font-mono)] text-xs text-source-blue">
              {claim.source_url}
            </p>
          </div>
        </div>
      </div>

      <div className="panel mb-6">
        <div className="panel-header">Consensus Result</div>
        <div className="space-y-5 p-6">
          <div>
            <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
              REASON
            </span>
            <p className="mt-1 text-sm leading-relaxed text-bright">
              {result.short_reason}
            </p>
          </div>

          <div>
            <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
              CONFIDENCE
            </span>
            <div className="mt-2">
              <ConfidenceMeter confidence={result.confidence} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                AUTHORITY
              </span>
              <p className="mt-1 font-[family-name:var(--font-mono)] text-xs capitalize text-bright">
                {result.source_authority.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                STABILITY
              </span>
              <p className="mt-1 font-[family-name:var(--font-mono)] text-xs capitalize text-bright">
                {result.source_stability.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                ALIGNMENT
              </span>
              <p className="mt-1 font-[family-name:var(--font-mono)] text-xs capitalize text-bright">
                {result.source_alignment}
              </p>
            </div>
          </div>

          {result.risk_flags && (
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                RISK FLAGS
              </span>
              <div className="mt-2">
                <RiskFlags flags={result.risk_flags} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Link href={`/claim/${id}`} className="btn-secondary">
          View Full Claim Room
        </Link>
        <Link href="/submit" className="btn-primary">
          Verify Another Source
        </Link>
      </div>
    </div>
  );
}

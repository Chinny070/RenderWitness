"use client";

import { useEffect, useState, use } from "react";
import { ClaimPacket, ResultPacket, CLAIM_TYPE_LABELS, ClaimType } from "@/lib/types";
import { getClaim, getResult, verifyClaim, challengeResult } from "@/lib/genlayer";
import { VerdictBadge } from "@/components/VerdictBadge";
import { JsonInspector } from "@/components/JsonInspector";
import { RiskFlags } from "@/components/RiskFlags";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { AuthorityPill, StabilityPill } from "@/components/SourcePill";
import { ConsensusTimeline } from "@/components/ConsensusTimeline";
import { ChallengeDrawer } from "@/components/ChallengeDrawer";

export default function ClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [claim, setClaim] = useState<ClaimPacket | null>(null);
  const [result, setResult] = useState<ResultPacket | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const c = await getClaim(id);
      setClaim(c);
      const r = await getResult(id);
      setResult(r);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleVerify = async () => {
    setVerifying(true);
    setError("");
    try {
      await verifyClaim(id);
      const r = await getResult(id);
      setResult(r);
      const c = await getClaim(id);
      setClaim(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleChallenge = async (reason: string, alternateUrl: string) => {
    try {
      await challengeResult(id, reason, alternateUrl);
      const r = await getResult(id);
      setResult(r);
      const c = await getClaim(id);
      setClaim(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Challenge failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-source-blue border-t-transparent" />
          <p className="font-[family-name:var(--font-mono)] text-xs text-muted">
            Loading claim #{id}...
          </p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="panel p-8 text-center">
          <p className="mb-2 font-[family-name:var(--font-display)] text-lg font-semibold text-bright">
            Claim Not Found
          </p>
          <p className="font-[family-name:var(--font-mono)] text-xs text-muted">
            Claim #{id} does not exist or could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const isPending = claim.status === "pending";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Verdict Rail */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-mono)] text-xs text-muted">
            Claim #{id}
          </span>
          {result ? (
            <VerdictBadge verdict={result.verdict} size="lg" />
          ) : (
            <span className="rounded bg-deep-slate px-3 py-1 font-[family-name:var(--font-mono)] text-xs text-muted">
              {isPending ? "PENDING" : claim.status.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          {isPending && (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="btn-primary"
            >
              {verifying ? "Verifying..." : "Run Verification"}
            </button>
          )}
          {result && (
            <>
              <button
                onClick={() => setShowChallenge(true)}
                className="btn-secondary"
              >
                Challenge
              </button>
              <a href={`/proof/${id}`} className="btn-secondary">
                View Proof
              </a>
            </>
          )}
        </div>
      </div>

      {verifying && (
        <div className="scan-line mb-6 rounded border border-source-blue/30 bg-source-blue/5 p-4">
          <p className="font-[family-name:var(--font-mono)] text-xs text-source-blue">
            Validators are checking the submitted source. This page will update
            when consensus returns.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded bg-contradiction-red/10 px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-contradiction-red">
          {error}
        </div>
      )}

      {/* Main split view */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Claim Packet */}
        <div className="panel">
          <div className="panel-header">Claim Packet</div>
          <div className="space-y-4 p-5">
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                TYPE
              </span>
              <p className="mt-0.5 text-sm text-bright">
                {CLAIM_TYPE_LABELS[claim.claim_type as ClaimType] ??
                  claim.claim_type}
              </p>
            </div>
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                TITLE
              </span>
              <p className="mt-0.5 font-[family-name:var(--font-display)] text-base font-semibold text-bright">
                {claim.title}
              </p>
            </div>
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                STATEMENT
              </span>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">
                {claim.statement}
              </p>
            </div>
            {claim.expected_value && (
              <div>
                <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                  EXPECTED VALUE
                </span>
                <p className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-bright">
                  {claim.expected_value}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Source Panel */}
        <div className="panel">
          <div className="panel-header">Source Panel</div>
          <div className="space-y-4 p-5">
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                URL
              </span>
              <p className="mt-0.5 truncate font-[family-name:var(--font-mono)] text-xs text-source-blue">
                {claim.source_url}
              </p>
            </div>
            {claim.source_hint && (
              <div>
                <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                  HINT
                </span>
                <p className="mt-0.5 text-sm text-bright">
                  {claim.source_hint}
                </p>
              </div>
            )}
            {result && (
              <>
                <div>
                  <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                    AUTHORITY
                  </span>
                  <div className="mt-1">
                    <AuthorityPill value={result.source_authority} />
                  </div>
                </div>
                <div>
                  <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                    STABILITY
                  </span>
                  <div className="mt-1">
                    <StabilityPill value={result.source_stability} />
                  </div>
                </div>
                <div>
                  <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                    ALIGNMENT
                  </span>
                  <p className="mt-0.5 font-[family-name:var(--font-mono)] text-xs capitalize text-bright">
                    {result.source_alignment}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Result details */}
      {result && (
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="panel p-5">
            <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
              CONFIDENCE
            </span>
            <div className="mt-2">
              <ConfidenceMeter confidence={result.confidence} />
            </div>
          </div>
          <div className="panel p-5">
            <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
              SHORT REASON
            </span>
            <p className="mt-2 text-sm leading-relaxed text-bright">
              {result.short_reason}
            </p>
          </div>
          <div className="panel p-5">
            <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
              RISK FLAGS
            </span>
            <div className="mt-2">
              <RiskFlags flags={result.risk_flags} />
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="mb-6">
        <ConsensusTimeline status={claim.status} hasResult={!!result} />
      </div>

      {/* JSON Inspectors */}
      <div className="grid gap-6 lg:grid-cols-2">
        <JsonInspector
          data={claim as unknown as Record<string, unknown>}
          label="Claim Packet JSON"
        />
        {result && (
          <JsonInspector
            data={result as unknown as Record<string, unknown>}
            label="Result Packet JSON"
          />
        )}
      </div>

      <ChallengeDrawer
        claimId={id}
        open={showChallenge}
        onClose={() => setShowChallenge(false)}
        onSubmit={handleChallenge}
      />
    </div>
  );
}

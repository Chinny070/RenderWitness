"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClaimType, CLAIM_TYPE_LABELS } from "@/lib/types";
import { submitClaim } from "@/lib/genlayer";

const CLAIM_TYPES = Object.keys(CLAIM_TYPE_LABELS) as ClaimType[];

export default function SubmitPage() {
  const router = useRouter();
  const [claimType, setClaimType] = useState<ClaimType>("page_contains_text");
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceHint, setSourceHint] = useState("");
  const [expectedValue, setExpectedValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validate = (): string | null => {
    if (!title.trim()) return "Title is required.";
    if (!statement.trim()) return "Claim statement is required.";
    if (!sourceUrl.trim()) return "Source URL is required.";
    if (
      !sourceUrl.startsWith("https://") &&
      !sourceUrl.startsWith("http://")
    )
      return "URL must start with https:// or http://";
    if (statement.length > 500) return "Claim statement is too long (max 500 chars).";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const claimId = await submitClaim(
        claimType,
        title,
        statement,
        sourceUrl,
        sourceHint,
        expectedValue
      );
      router.push(`/claim/${claimId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-bright">
        Submit Claim Packet
      </h1>
      <p className="mb-8 text-sm text-muted">
        Create a structured claim about a live public source for GenLayer
        verification.
      </p>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Claim Builder */}
        <div className="lg:col-span-3">
          <div className="panel">
            <div className="panel-header">Claim Builder</div>
            <div className="space-y-5 p-5">
              <div>
                <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs text-muted">
                  Claim Type
                </label>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value as ClaimType)}
                  className="input-field"
                >
                  {CLAIM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {CLAIM_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs text-muted">
                  Claim Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short descriptive title for this claim"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs text-muted">
                  Claim Statement
                </label>
                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="The page says GitHub Actions is degraded."
                  className="input-field min-h-[100px] resize-y"
                  rows={4}
                />
                <div className="mt-1.5 space-y-1 text-[0.65rem] text-muted">
                  <p>
                    <span className="text-proof-green">Good:</span> &quot;The
                    pricing page lists the Pro plan at $20/month.&quot;
                  </p>
                  <p>
                    <span className="text-contradiction-red">Bad:</span>{" "}
                    &quot;This product is expensive.&quot;
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs text-muted">
                  Source URL
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="input-field font-[family-name:var(--font-mono)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs text-muted">
                  Source Hint / Keyword
                </label>
                <input
                  type="text"
                  value={sourceHint}
                  onChange={(e) => setSourceHint(e.target.value)}
                  placeholder="Exact keyword, service name, or section title validators should focus on"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs text-muted">
                  Expected Value
                </label>
                <input
                  type="text"
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  placeholder="What you expect the source to say"
                  className="input-field"
                />
              </div>

              {error && (
                <div className="rounded bg-contradiction-red/10 px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-contradiction-red">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? "Creating..." : "Create Claim Packet"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Source Readiness & Notes */}
        <div className="space-y-4 lg:col-span-2">
          <div className="panel">
            <div className="panel-header">Source Readiness</div>
            <div className="space-y-3 p-4">
              {sourceUrl ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-proof-green" />
                    <span className="font-[family-name:var(--font-mono)] text-xs text-bright">
                      URL provided
                    </span>
                  </div>
                  <p className="truncate font-[family-name:var(--font-mono)] text-xs text-muted">
                    {sourceUrl}
                  </p>
                  <p className="text-[0.65rem] text-muted">
                    Frontend preview is not consensus. Only the GenLayer verdict
                    is final.
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted">
                  Enter a source URL to check readiness.
                </p>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">Risk Notes</div>
            <div className="space-y-2 p-4">
              <p className="text-[0.65rem] leading-relaxed text-warning-amber">
                Dynamic pages may require rendered verification.
              </p>
              <p className="text-[0.65rem] leading-relaxed text-warning-amber">
                Login-gated sources cannot be verified.
              </p>
              <p className="text-[0.65rem] leading-relaxed text-muted">
                Use official primary sources where possible.
              </p>
              <p className="text-[0.65rem] leading-relaxed text-muted">
                Frontend preview is not consensus.
              </p>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">Verification Warning</div>
            <div className="p-4">
              <p className="text-xs leading-relaxed text-muted">
                RenderWitness verifies what a public source supports. It does
                not guarantee that the source itself is truthful.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

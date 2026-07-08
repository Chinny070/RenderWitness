"use client";

import { useState } from "react";
import { ChallengeCategory } from "@/lib/types";

const CATEGORIES: { value: ChallengeCategory; label: string }[] = [
  { value: "wrong_source", label: "Wrong Source" },
  { value: "source_changed", label: "Source Changed" },
  { value: "claim_too_broad", label: "Claim Too Broad" },
  { value: "visual_mismatch", label: "Visual Mismatch" },
  { value: "unofficial_source", label: "Unofficial Source" },
  { value: "stale_content", label: "Stale Content" },
  { value: "bad_interpretation", label: "Bad Interpretation" },
  { value: "other", label: "Other" },
];

export function ChallengeDrawer({
  claimId,
  open,
  onClose,
  onSubmit,
}: {
  claimId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, alternateUrl: string) => void;
}) {
  const [category, setCategory] = useState<ChallengeCategory>("other");
  const [reason, setReason] = useState("");
  const [alternateUrl, setAlternateUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    const fullReason = `[${category}] ${reason}`;
    onSubmit(fullReason, alternateUrl);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md border-l border-line-grid bg-panel-ink p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-bright">
            Challenge Result
          </h3>
          <button
            onClick={onClose}
            className="text-muted transition-colors hover:text-bright"
          >
            &times;
          </button>
        </div>

        <p className="mb-4 font-[family-name:var(--font-mono)] text-xs text-muted">
          Claim #{claimId}
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs text-muted">
              Challenge Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ChallengeCategory)
              }
              className="input-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs text-muted">
              Challenge Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the prior result may be wrong..."
              className="input-field min-h-[100px] resize-y"
              rows={4}
            />
          </div>

          <div>
            <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-xs text-muted">
              Alternate Source URL (optional)
            </label>
            <input
              type="url"
              value={alternateUrl}
              onChange={(e) => setAlternateUrl(e.target.value)}
              placeholder="https://..."
              className="input-field font-[family-name:var(--font-mono)]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || submitting}
            className="btn-primary w-full"
          >
            {submitting ? "Submitting..." : "Submit Challenge"}
          </button>
        </div>
      </div>
    </div>
  );
}

export type ClaimType =
  | "page_contains_text"
  | "page_excludes_text"
  | "status_assertion"
  | "incident_assertion"
  | "pricing_assertion"
  | "documentation_assertion"
  | "governance_result_assertion"
  | "repository_metadata_assertion"
  | "visual_page_assertion"
  | "api_json_assertion";

export type Verdict =
  | "SUPPORTED"
  | "PARTIALLY_SUPPORTED"
  | "UNSUPPORTED"
  | "CONTRADICTED"
  | "UNVERIFIABLE"
  | "SOURCE_UNREACHABLE"
  | "SOURCE_UNSTABLE"
  | "SOURCE_NOT_AUTHORITATIVE"
  | "AMBIGUOUS"
  | "MALFORMED_CLAIM";

export type Confidence = "low" | "medium" | "high" | "very_high";

export type SourceAuthority =
  | "official_primary"
  | "official_secondary"
  | "public_repository"
  | "public_dashboard"
  | "community_mirror"
  | "third_party_report"
  | "unknown"
  | "suspicious";

export type SourceStability =
  | "stable_static"
  | "stable_api"
  | "rendered_dynamic"
  | "frequently_changing"
  | "login_required"
  | "blocked"
  | "unreachable"
  | "unknown";

export type SourceAlignment =
  | "strong"
  | "moderate"
  | "weak"
  | "none"
  | "contradictory"
  | "unknown";

export type ChallengeCategory =
  | "wrong_source"
  | "source_changed"
  | "claim_too_broad"
  | "visual_mismatch"
  | "unofficial_source"
  | "stale_content"
  | "bad_interpretation"
  | "other";

export interface ClaimPacket {
  claim_id: string;
  claim_type: ClaimType;
  title: string;
  statement: string;
  source_url: string;
  source_hint: string;
  expected_value: string;
  status: string;
}

export interface ResultPacket {
  claim_id: string;
  verdict: Verdict;
  confidence: Confidence;
  source_authority: SourceAuthority;
  source_stability: SourceStability;
  source_alignment: SourceAlignment;
  short_reason: string;
  risk_flags: string;
}

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  page_contains_text: "Page Contains Text",
  page_excludes_text: "Page Excludes Text",
  status_assertion: "Status Assertion",
  incident_assertion: "Incident Assertion",
  pricing_assertion: "Pricing Assertion",
  documentation_assertion: "Documentation Assertion",
  governance_result_assertion: "Governance Result Assertion",
  repository_metadata_assertion: "Repository Metadata Assertion",
  visual_page_assertion: "Visual Page Assertion",
  api_json_assertion: "API JSON Assertion",
};

export const VERDICT_CONFIG: Record<
  Verdict,
  { label: string; color: string; bg: string }
> = {
  SUPPORTED: { label: "Supported", color: "#36D399", bg: "#36D39920" },
  PARTIALLY_SUPPORTED: {
    label: "Partially Supported",
    color: "#F6B84B",
    bg: "#F6B84B20",
  },
  UNSUPPORTED: { label: "Unsupported", color: "#9AA7B8", bg: "#9AA7B820" },
  CONTRADICTED: { label: "Contradicted", color: "#FF5A66", bg: "#FF5A6620" },
  UNVERIFIABLE: { label: "Unverifiable", color: "#8B7CF6", bg: "#8B7CF620" },
  SOURCE_UNREACHABLE: {
    label: "Source Unreachable",
    color: "#FF5A66",
    bg: "#FF5A6620",
  },
  SOURCE_UNSTABLE: {
    label: "Source Unstable",
    color: "#F6B84B",
    bg: "#F6B84B20",
  },
  SOURCE_NOT_AUTHORITATIVE: {
    label: "Not Authoritative",
    color: "#F6B84B",
    bg: "#F6B84B20",
  },
  AMBIGUOUS: { label: "Ambiguous", color: "#8B7CF6", bg: "#8B7CF620" },
  MALFORMED_CLAIM: {
    label: "Malformed Claim",
    color: "#9AA7B8",
    bg: "#9AA7B820",
  },
};

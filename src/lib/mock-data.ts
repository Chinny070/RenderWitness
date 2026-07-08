import { ClaimPacket, ResultPacket } from "./types";

export const MOCK_CLAIMS: ClaimPacket[] = [
  {
    claim_id: "0",
    claim_type: "documentation_assertion",
    title: "GenLayer docs confirm rendered page HTML mode",
    statement:
      "The GenLayer documentation page says rendered pages can return HTML mode for web content extraction.",
    source_url: "https://docs.genlayer.com/intelligent-contracts/contract-methods",
    source_hint: "render html mode",
    expected_value: "html mode supported",
    status: "verified",
  },
  {
    claim_id: "1",
    claim_type: "incident_assertion",
    title: "GitHub Actions shows degraded deployments",
    statement:
      "The GitHub status page reports that GitHub Actions deployments are currently experiencing degraded performance.",
    source_url: "https://www.githubstatus.com",
    source_hint: "Actions degraded",
    expected_value: "degraded deployments",
    status: "verified",
  },
  {
    claim_id: "2",
    claim_type: "repository_metadata_assertion",
    title: "GenLayer SDK supports injected wallet provider",
    statement:
      "The GenLayer JS SDK README states that injected wallet provider connections are supported.",
    source_url: "https://github.com/yeagerai/genlayer-js",
    source_hint: "injected wallet",
    expected_value: "injected wallet support",
    status: "pending",
  },
];

export const MOCK_RESULTS: Record<string, ResultPacket> = {
  "0": {
    claim_id: "0",
    verdict: "SUPPORTED",
    confidence: "high",
    source_authority: "official_primary",
    source_stability: "rendered_dynamic",
    source_alignment: "strong",
    short_reason:
      "Official GenLayer documentation confirms HTML mode is available for rendered page content extraction.",
    risk_flags: "dynamic_page|requires_render",
  },
  "1": {
    claim_id: "1",
    verdict: "CONTRADICTED",
    confidence: "very_high",
    source_authority: "official_primary",
    source_stability: "frequently_changing",
    source_alignment: "contradictory",
    short_reason:
      "GitHub status page currently shows all systems operational. No degraded deployments found.",
    risk_flags: "frequently_changing|source_changed",
  },
};

export function getMockClaim(id: string): ClaimPacket | null {
  return MOCK_CLAIMS.find((c) => c.claim_id === id) ?? null;
}

export function getMockResult(id: string): ResultPacket | null {
  return MOCK_RESULTS[id] ?? null;
}

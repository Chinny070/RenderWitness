# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json

VALID_CLAIM_TYPES = [
    "page_contains_text",
    "page_excludes_text",
    "status_assertion",
    "incident_assertion",
    "pricing_assertion",
    "documentation_assertion",
    "governance_result_assertion",
    "repository_metadata_assertion",
    "visual_page_assertion",
    "api_json_assertion",
]

BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

BLOCKED_PREFIXES = [
    "10.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.",
    "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.",
    "172.27.", "172.28.", "172.29.", "172.30.", "172.31.", "192.168.",
]

BLOCKED_SCHEMES = ["file://", "ftp://", "chrome://"]


def is_url_safe(url: str) -> bool:
    lower = url.lower().strip()
    for scheme in BLOCKED_SCHEMES:
        if lower.startswith(scheme):
            return False
    if not lower.startswith("https://") and not lower.startswith("http://"):
        return False
    host_part = lower.split("://", 1)[1].split("/")[0].split(":")[0]
    for blocked in BLOCKED_HOSTS:
        if host_part == blocked:
            return False
    for prefix in BLOCKED_PREFIXES:
        if host_part.startswith(prefix):
            return False
    return True


class RenderWitness(gl.Contract):
    next_claim_id: u256
    claims: TreeMap[u256, str]
    claim_results: TreeMap[u256, str]
    claim_statuses: TreeMap[u256, str]
    claimants: TreeMap[u256, str]
    challenge_count: TreeMap[u256, u256]

    def __init__(self):
        self.next_claim_id = u256(0)

    @gl.public.write
    def submit_claim(
        self,
        claim_type: str,
        title: str,
        statement: str,
        source_url: str,
        source_hint: str,
        expected_value: str,
    ) -> u256:
        if claim_type not in VALID_CLAIM_TYPES:
            raise gl.vm.UserError("Unsupported claim type: " + claim_type)
        if not source_url or len(source_url.strip()) == 0:
            raise gl.vm.UserError("Source URL is required")
        if not is_url_safe(source_url):
            raise gl.vm.UserError("Unsafe or blocked URL")
        if not title or len(title.strip()) == 0:
            raise gl.vm.UserError("Title is required")
        if not statement or len(statement.strip()) == 0:
            raise gl.vm.UserError("Statement is required")

        claim_id = self.next_claim_id
        self.next_claim_id = self.next_claim_id + u256(1)

        caller = gl.message.sender_address.as_hex

        packet = json.dumps({
            "claim_id": str(claim_id),
            "claim_type": claim_type,
            "expected_value": expected_value or "",
            "source_hint": source_hint or "",
            "source_url": source_url,
            "statement": statement,
            "status": "pending",
            "title": title,
        }, sort_keys=True)

        self.claims[claim_id] = packet
        self.claim_statuses[claim_id] = "pending"
        self.claimants[claim_id] = caller
        self.challenge_count[claim_id] = u256(0)

        return claim_id

    @gl.public.write
    def verify_claim(self, claim_id: u256) -> str:
        if claim_id not in self.claims:
            raise gl.vm.UserError("Claim not found")

        status = self.claim_statuses[claim_id]
        if status == "verified":
            raise gl.vm.UserError("Claim already verified")

        claim_data = json.loads(self.claims[claim_id])
        source_url = claim_data["source_url"]
        claim_type = claim_data["claim_type"]
        statement = claim_data["statement"]
        source_hint = claim_data.get("source_hint", "")
        expected_value = claim_data.get("expected_value", "")

        prompt = (
            "You are a GenLayer validator evaluating a live-source claim.\n"
            "You must decide whether the fetched source supports the submitted claim.\n\n"
            "Claim type: " + claim_type + "\n"
            "Claim statement: " + statement + "\n"
            "Source URL: " + source_url + "\n"
            "Source hint: " + source_hint + "\n"
            "Expected value: " + expected_value + "\n\n"
            "IMPORTANT: Fetch the source URL and evaluate the content you find.\n\n"
            "Return only canonical JSON with these fields:\n"
            '- verdict: one of SUPPORTED, PARTIALLY_SUPPORTED, UNSUPPORTED, CONTRADICTED, UNVERIFIABLE, SOURCE_UNREACHABLE, SOURCE_UNSTABLE, SOURCE_NOT_AUTHORITATIVE, AMBIGUOUS, MALFORMED_CLAIM\n'
            "- confidence: one of low, medium, high, very_high\n"
            "- source_authority: one of official_primary, official_secondary, public_repository, public_dashboard, community_mirror, third_party_report, unknown, suspicious\n"
            "- source_stability: one of stable_static, stable_api, rendered_dynamic, frequently_changing, login_required, blocked, unreachable, unknown\n"
            "- source_alignment: one of strong, moderate, weak, none, contradictory, unknown\n"
            "- short_reason: maximum 160 characters\n"
            "- risk_flags: pipe-separated lowercase tags, or empty string\n\n"
            "Rules:\n"
            "1. Judge only the submitted source and claim context.\n"
            "2. Do not invent facts not present in the source.\n"
            "3. If the source is unreachable, return SOURCE_UNREACHABLE.\n"
            "4. If the source requires login or blocks rendering, return UNVERIFIABLE.\n"
            "5. If the source is not official but still relevant, lower source_authority.\n"
            "6. If the claim is broader than the evidence, return PARTIALLY_SUPPORTED or AMBIGUOUS.\n"
            "7. If the source directly refutes the claim, return CONTRADICTED.\n"
            "8. Output only JSON. No markdown. No reasoning outside JSON.\n"
            "Do not include ```json or ```. Your output must be only JSON."
        )

        def call_llm() -> str:
            web_data = gl.nondet.web.get(source_url)
            page_content = web_data.body.decode("utf-8")

            full_prompt = prompt + "\n\nFetched source content:\n" + page_content
            result = gl.nondet.exec_prompt(full_prompt)
            result = result.replace("```json", "").replace("```", "").strip()
            return result

        final_result = gl.eq_principle.prompt_comparative(
            call_llm,
            "The resulting verdicts must reach the same conclusion about whether the source supports the claim. The verdict and confidence must match.",
        )

        result_obj = json.loads(final_result)
        result_obj["claim_id"] = str(claim_id)

        if "risk_flags" not in result_obj:
            result_obj["risk_flags"] = ""

        result_packet = json.dumps({
            "claim_id": result_obj.get("claim_id", str(claim_id)),
            "confidence": result_obj.get("confidence", "low"),
            "risk_flags": result_obj.get("risk_flags", ""),
            "short_reason": result_obj.get("short_reason", ""),
            "source_alignment": result_obj.get("source_alignment", "unknown"),
            "source_authority": result_obj.get("source_authority", "unknown"),
            "source_stability": result_obj.get("source_stability", "unknown"),
            "verdict": result_obj.get("verdict", "UNVERIFIABLE"),
        }, sort_keys=True)

        self.claim_results[claim_id] = result_packet

        verdict = result_obj.get("verdict", "UNVERIFIABLE")
        if verdict in ["SOURCE_UNREACHABLE", "UNVERIFIABLE", "MALFORMED_CLAIM"]:
            self.claim_statuses[claim_id] = "unverifiable"
        else:
            self.claim_statuses[claim_id] = "verified"

        claim_data["status"] = self.claim_statuses[claim_id]
        self.claims[claim_id] = json.dumps(claim_data, sort_keys=True)

        return final_result

    @gl.public.write
    def challenge_result(
        self,
        claim_id: u256,
        challenge_reason: str,
        alternate_source_url: str,
    ) -> str:
        if claim_id not in self.claims:
            raise gl.vm.UserError("Claim not found")
        if not challenge_reason or len(challenge_reason.strip()) == 0:
            raise gl.vm.UserError("Challenge reason is required")

        if alternate_source_url and len(alternate_source_url.strip()) > 0:
            if not is_url_safe(alternate_source_url):
                raise gl.vm.UserError("Unsafe or blocked alternate URL")

        claim_data = json.loads(self.claims[claim_id])
        source_url = alternate_source_url if alternate_source_url and len(alternate_source_url.strip()) > 0 else claim_data["source_url"]
        statement = claim_data["statement"]
        claim_type = claim_data["claim_type"]
        source_hint = claim_data.get("source_hint", "")
        expected_value = claim_data.get("expected_value", "")

        previous_result = ""
        if claim_id in self.claim_results:
            previous_result = self.claim_results[claim_id]

        prompt = (
            "You are a GenLayer validator re-evaluating a challenged live-source claim.\n"
            "A previous verification was challenged. Re-evaluate the source independently.\n\n"
            "Claim type: " + claim_type + "\n"
            "Claim statement: " + statement + "\n"
            "Source URL: " + source_url + "\n"
            "Source hint: " + source_hint + "\n"
            "Expected value: " + expected_value + "\n"
            "Challenge reason: " + challenge_reason + "\n"
            "Previous result: " + previous_result + "\n\n"
            "IMPORTANT: Fetch the source URL and evaluate the content you find.\n\n"
            "Return only canonical JSON with these fields:\n"
            '- verdict: one of SUPPORTED, PARTIALLY_SUPPORTED, UNSUPPORTED, CONTRADICTED, UNVERIFIABLE, SOURCE_UNREACHABLE, SOURCE_UNSTABLE, SOURCE_NOT_AUTHORITATIVE, AMBIGUOUS, MALFORMED_CLAIM\n'
            "- confidence: one of low, medium, high, very_high\n"
            "- source_authority: one of official_primary, official_secondary, public_repository, public_dashboard, community_mirror, third_party_report, unknown, suspicious\n"
            "- source_stability: one of stable_static, stable_api, rendered_dynamic, frequently_changing, login_required, blocked, unreachable, unknown\n"
            "- source_alignment: one of strong, moderate, weak, none, contradictory, unknown\n"
            "- short_reason: maximum 160 characters\n"
            "- risk_flags: pipe-separated lowercase tags, or empty string\n\n"
            "Rules:\n"
            "1. Judge only the submitted source and claim context.\n"
            "2. Do not invent facts not present in the source.\n"
            "3. Consider the challenge reason but judge independently.\n"
            "4. If the source is unreachable, return SOURCE_UNREACHABLE.\n"
            "5. Output only JSON. No markdown. No reasoning outside JSON.\n"
            "Do not include ```json or ```. Your output must be only JSON."
        )

        def call_llm() -> str:
            web_data = gl.nondet.web.get(source_url)
            page_content = web_data.body.decode("utf-8")

            full_prompt = prompt + "\n\nFetched source content:\n" + page_content
            result = gl.nondet.exec_prompt(full_prompt)
            result = result.replace("```json", "").replace("```", "").strip()
            return result

        final_result = gl.eq_principle.prompt_comparative(
            call_llm,
            "The resulting verdicts must reach the same conclusion about whether the source supports the claim. The verdict and confidence must match.",
        )

        result_obj = json.loads(final_result)
        result_obj["claim_id"] = str(claim_id)

        result_packet = json.dumps({
            "claim_id": result_obj.get("claim_id", str(claim_id)),
            "confidence": result_obj.get("confidence", "low"),
            "risk_flags": result_obj.get("risk_flags", ""),
            "short_reason": result_obj.get("short_reason", ""),
            "source_alignment": result_obj.get("source_alignment", "unknown"),
            "source_authority": result_obj.get("source_authority", "unknown"),
            "source_stability": result_obj.get("source_stability", "unknown"),
            "verdict": result_obj.get("verdict", "UNVERIFIABLE"),
        }, sort_keys=True)

        self.claim_results[claim_id] = result_packet

        current_count = self.challenge_count.get(claim_id, u256(0))
        self.challenge_count[claim_id] = current_count + u256(1)

        verdict = result_obj.get("verdict", "UNVERIFIABLE")
        if verdict in ["SOURCE_UNREACHABLE", "UNVERIFIABLE", "MALFORMED_CLAIM"]:
            self.claim_statuses[claim_id] = "unverifiable"
        else:
            self.claim_statuses[claim_id] = "verified"

        claim_data["status"] = self.claim_statuses[claim_id]
        self.claims[claim_id] = json.dumps(claim_data, sort_keys=True)

        return final_result

    @gl.public.view
    def get_claim(self, claim_id: u256) -> str:
        if claim_id not in self.claims:
            raise gl.vm.UserError("Claim not found")
        return self.claims[claim_id]

    @gl.public.view
    def get_result(self, claim_id: u256) -> str:
        if claim_id not in self.claim_results:
            raise gl.vm.UserError("Result not found")
        return self.claim_results[claim_id]

    @gl.public.view
    def get_status(self, claim_id: u256) -> str:
        if claim_id not in self.claim_statuses:
            raise gl.vm.UserError("Claim not found")
        return self.claim_statuses[claim_id]

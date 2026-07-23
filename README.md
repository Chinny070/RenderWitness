# RenderWitness

**A decentralized notary for the live web, powered by GenLayer.**

RenderWitness turns live web sources into consensus-backed, on-chain proof. Submit a factual claim about what a public webpage says, and GenLayer validators independently fetch the page, evaluate your claim, and reach consensus on whether the source supports it.

**Live app:** https://render-witness.vercel.app  
**Contract:** Deployed on GenLayer Studionet at `0x2d7741CDd170E9994aDF14FE5C30DBDa51E9b39B`  
**Repo:** https://github.com/Chinny070/RenderWitness

---

## Why RenderWitness?

Websites change constantly. Screenshots can be faked. Archive services can be slow or incomplete. RenderWitness solves this by having multiple independent GenLayer validators fetch the same URL, evaluate the claim against real page content, and reach consensus. The result is stored on-chain as verifiable, tamper-proof proof of what a source said at a specific moment.

**This is not an AI wrapper.** The contract uses `gl.nondet.web.get()` to fetch live web content inside the validator execution environment, and `gl.eq_principle.prompt_comparative()` to enforce that validators reach the same conclusion independently. The AI evaluates real evidence — it does not generate opinions.

---

## How It Works

1. **Connect Wallet** — Generate a new Studionet keypair or import your own private key (stored locally, never sent to any server)
2. **Submit a Claim** — Describe what a public webpage says, provide the URL, and specify what you expect to find
3. **Validator Consensus** — GenLayer validators independently fetch the URL using `gl.nondet.web.get()`, read the content, and evaluate your claim via `gl.nondet.exec_prompt()`. Consensus is enforced with `gl.eq_principle.prompt_comparative()`
4. **On-Chain Result** — The verdict (SUPPORTED, CONTRADICTED, UNVERIFIABLE, etc.) is stored on-chain with confidence scores, source authority ratings, and risk flags
5. **Challenge** — Anyone can challenge a result with a reason and alternate source URL, triggering a full re-verification

---

## Use Cases

| Scenario | Claim Example | Source |
|----------|--------------|--------|
| **Price verification** | "The pricing page lists Pro at $20/month" | Company pricing page |
| **Uptime/downtime proof** | "GitHub Actions status is operational" | githubstatus.com |
| **Policy snapshots** | "The ToS says data is not sold to third parties" | Company terms page |
| **Open source licensing** | "This repo uses the MIT license" | GitHub repository |
| **Governance outcomes** | "The proposal passed with 67% approval" | DAO governance page |
| **Incident documentation** | "AWS reported an S3 outage" | AWS status page |

---

## Contract Architecture

The GenLayer intelligent contract (`contracts/render_witness.py`) is the core of RenderWitness.

### Key Design Decisions

- **Module-level constants** for `VALID_CLAIM_TYPES`, `BLOCKED_HOSTS`, `BLOCKED_PREFIXES`, `BLOCKED_SCHEMES` — GenVM parses class-level attributes as state fields, so validation constants must be at module level
- **URL safety validation** — Blocks localhost, private IP ranges (10.x, 172.16-31.x, 192.168.x), and non-HTTP schemes (file://, ftp://, chrome://) to prevent SSRF
- **Canonical JSON storage** — All state is stored as `TreeMap[u256, str]` with `json.dumps(data, sort_keys=True)` for deterministic serialization
- **Non-deterministic verification** — Source fetching and LLM evaluation happen inside a `call_llm()` closure passed to `gl.eq_principle.prompt_comparative()`, ensuring each validator fetches and evaluates independently

### Contract Methods

| Method | Type | Description |
|--------|------|-------------|
| `submit_claim(claim_type, title, statement, source_url, source_hint, expected_value)` | `@gl.public.write` | Create a claim packet on-chain |
| `verify_claim(claim_id)` | `@gl.public.write` | Trigger non-deterministic verification via validators |
| `challenge_result(claim_id, challenge_reason, alternate_source_url)` | `@gl.public.write` | Challenge and re-verify with fresh source data |
| `get_claim(claim_id)` | `@gl.public.view` | Read claim JSON |
| `get_result(claim_id)` | `@gl.public.view` | Read verification result JSON |
| `get_status(claim_id)` | `@gl.public.view` | Read claim status |

### How Verification Works (Inside the Contract)

```python
def call_llm() -> str:
    # Each validator fetches the source independently
    web_data = gl.nondet.web.get(source_url)
    page_content = web_data.body.decode("utf-8")

    # Each validator evaluates the claim against the fetched content
    full_prompt = prompt + "\n\nFetched source content:\n" + page_content
    result = gl.nondet.exec_prompt(full_prompt)
    return result

# Validators must reach the same verdict and confidence
final_result = gl.eq_principle.prompt_comparative(
    call_llm,
    "The resulting verdicts must reach the same conclusion...",
)
```

---

## Verdict System

Each verified claim receives a structured result:

| Field | Values | Purpose |
|-------|--------|---------|
| **Verdict** | SUPPORTED, PARTIALLY_SUPPORTED, UNSUPPORTED, CONTRADICTED, UNVERIFIABLE, SOURCE_UNREACHABLE, SOURCE_UNSTABLE, SOURCE_NOT_AUTHORITATIVE, AMBIGUOUS, MALFORMED_CLAIM | Did the source support the claim? |
| **Confidence** | low, medium, high, very_high | How confident are validators? |
| **Source Authority** | official_primary, official_secondary, public_repository, public_dashboard, community_mirror, third_party_report, unknown, suspicious | Is this an authoritative source? |
| **Source Stability** | stable_static, stable_api, rendered_dynamic, frequently_changing, login_required, blocked, unreachable, unknown | Will this source change? |
| **Source Alignment** | strong, moderate, weak, none, contradictory, unknown | How well does the source match the claim? |
| **Risk Flags** | Pipe-separated tags | Potential issues (e.g., "dynamic_content\|frequently_changing") |

---

## Claim Types

| Type | Description |
|------|-------------|
| `page_contains_text` | Verify specific text exists on a page |
| `page_excludes_text` | Verify specific text is absent from a page |
| `status_assertion` | Verify a service's operational status |
| `incident_assertion` | Verify a reported incident |
| `pricing_assertion` | Verify pricing information |
| `documentation_assertion` | Verify documentation content |
| `governance_result_assertion` | Verify governance/voting outcomes |
| `repository_metadata_assertion` | Verify repo metadata (license, stars, etc.) |
| `visual_page_assertion` | Verify visual/rendered page content |
| `api_json_assertion` | Verify JSON API response content |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | GenLayer Intelligent Contract (Python) |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Blockchain SDK** | `genlayer-js` |
| **Chain** | GenLayer Studionet |
| **Deployment** | Vercel |
| **Fonts** | Space Grotesk, Inter, JetBrains Mono |

---

## Project Structure

```
contracts/
  render_witness.py           # GenLayer intelligent contract

src/
  app/
    page.tsx                  # Landing page
    submit/page.tsx           # Claim submission form
    claim/[id]/page.tsx       # Claim detail + verification result
    proof/[id]/page.tsx       # Public shareable proof page
    explore/page.tsx          # Browse all verified claims
    about/page.tsx            # Protocol explanation
    layout.tsx                # Root layout with navbar
    globals.css               # Design system (dark forensic theme)
  components/
    Navbar.tsx                # Navigation with wallet button
    WalletButton.tsx          # Wallet connect / import key / disconnect
    VerdictBadge.tsx          # Color-coded verdict display
    SourcePill.tsx            # Source metadata pills
    JsonInspector.tsx         # Expandable JSON viewer
    ConsensusTimeline.tsx     # Consensus process visualization
    ConfidenceMeter.tsx       # Confidence level indicator
    RiskFlags.tsx             # Risk flag tags
    ChallengeDrawer.tsx       # Challenge submission drawer
  lib/
    genlayer.ts               # GenLayer SDK integration layer
    types.ts                  # TypeScript type definitions
    mock-data.ts              # Mock data for offline development
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev
```

Open http://localhost:3000

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_USE_MOCK` | `false` for live contract, `true` for mock data | `true` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed GenLayer contract address | — |
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | GenLayer Studionet RPC endpoint | `https://studio.genlayer.com/api` |

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with protocol overview |
| `/submit` | Claim Builder form with source readiness panel and risk notes |
| `/claim/[id]` | Claim detail view with verdict, source panel, confidence, and challenge button |
| `/proof/[id]` | Public shareable proof packet |
| `/explore` | Browse and filter all verified claims |
| `/about` | Protocol explanation and FAQ |

---

## Deployment

The app is deployed to Vercel with environment variables configured for live GenLayer Studionet access:

```bash
# Deploy to Vercel
npx vercel --yes --prod
```

Ensure `NEXT_PUBLIC_USE_MOCK`, `NEXT_PUBLIC_CONTRACT_ADDRESS`, and `NEXT_PUBLIC_GENLAYER_RPC_URL` are set in Vercel's environment variables.

---

## License

MIT

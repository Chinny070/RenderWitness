# RenderWitness

A forensic browser for consensus-backed web evidence. Built on GenLayer.

RenderWitness lets anyone turn a live web page into a consensus-backed proof about what the source says, shows, or implies.

## How It Works

1. **Submit** a structured claim packet with a source URL and natural-language statement
2. **Verify** through GenLayer — validators fetch the live source and evaluate the claim
3. **Result** is stored on-chain as canonical JSON with verdict, confidence, alignment, and risk flags
4. **Challenge** any result with a reason and alternate source for re-verification

## Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Contract**: GenLayer Intelligent Contract (Python)
- **Fonts**: Space Grotesk, Inter, JetBrains Mono

## Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env.local

# Run development server (mock mode by default)
npm run dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCK` | `true` | Use mock data for UI development |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | — | Deployed GenLayer contract address |
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | `https://studio.genlayer.com:8443/api` | GenLayer RPC endpoint |

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/submit` | Claim submission form |
| `/claim/[id]` | Claim verification room |
| `/proof/[id]` | Public shareable proof page |
| `/explore` | Browse recent verifications |
| `/about` | Protocol explanation |

## Contract

The GenLayer intelligent contract is at `contracts/render_witness.py`.

**Methods:**
- `submit_claim(claim_type, title, statement, source_url, source_hint, expected_value)` — create a claim packet
- `verify_claim(claim_id)` — run non-deterministic verification via validators
- `challenge_result(claim_id, challenge_reason, alternate_source_url)` — challenge and re-verify
- `get_claim(claim_id)` — read claim JSON
- `get_result(claim_id)` — read result JSON
- `get_status(claim_id)` — read claim status

**Supported Claim Types:** page_contains_text, page_excludes_text, status_assertion, incident_assertion, pricing_assertion, documentation_assertion, governance_result_assertion, repository_metadata_assertion, visual_page_assertion, api_json_assertion

## Deployment

To switch from mock mode to a live GenLayer contract:

1. Deploy `contracts/render_witness.py` to GenLayer
2. Set `NEXT_PUBLIC_USE_MOCK=false` in `.env.local`
3. Set `NEXT_PUBLIC_CONTRACT_ADDRESS` to the deployed address
4. Restart the dev server

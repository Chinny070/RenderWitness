import Link from "next/link";

const EXAMPLE_CLAIMS = [
  {
    type: "documentation_assertion",
    title: "Docs confirm rendered page HTML mode",
    statement: "The documentation says rendered pages can return HTML mode.",
    source: "docs.example.com",
    verdict: "SUPPORTED",
    verdictColor: "#36D399",
  },
  {
    type: "incident_assertion",
    title: "Status page shows degraded deployments",
    statement: "The status page says deployments are degraded.",
    source: "status.example.com",
    verdict: "CONTRADICTED",
    verdictColor: "#FF5A66",
  },
  {
    type: "repository_metadata_assertion",
    title: "README confirms injected wallet support",
    statement: "The repository README says injected wallet is supported.",
    source: "github.com/example/repo",
    verdict: "PENDING",
    verdictColor: "#9AA7B8",
  },
];

const CAPABILITIES = [
  {
    icon: "01",
    title: "Fetch Live Sources",
    description:
      "Validators pull content from public URLs at verification time — not from cached snapshots.",
  },
  {
    icon: "02",
    title: "Interpret Unstructured Data",
    description:
      "Claims against HTML, rendered pages, status dashboards, and documentation are evaluated semantically.",
  },
  {
    icon: "03",
    title: "Consensus Over Meaning",
    description:
      "Multiple validators independently judge whether the source supports the claim using the Equivalence Principle.",
  },
  {
    icon: "04",
    title: "Challengeable Proofs",
    description:
      "Any result can be challenged with a reason and alternate source. Re-verification updates the consensus.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line-grid">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(75,163,255,0.08)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-grid bg-panel-ink px-4 py-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-proof-green animate-pulse" />
            <span className="font-[family-name:var(--font-mono)] text-xs text-muted">
              GenLayer Verification Protocol
            </span>
          </div>
          <h1 className="mx-auto mb-6 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-tight text-bright sm:text-5xl lg:text-6xl">
            Turn live web sources into{" "}
            <span className="text-source-blue">consensus-backed proof</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted">
            Submit a claim and a public URL. RenderWitness asks GenLayer
            validators whether the source actually supports it.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/submit" className="btn-primary text-base">
              Create Claim Packet
            </Link>
            <Link href="/explore" className="btn-secondary text-base">
              Explore Verifications
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-line-grid py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-4 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-bright">
            How GenLayer Judges the Claim
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted">
            Unlike fixed-value oracles, RenderWitness evaluates whether
            unstructured web content supports a natural-language claim.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {CAPABILITIES.map((cap) => (
              <div key={cap.icon} className="panel p-6">
                <div className="mb-3 font-[family-name:var(--font-mono)] text-xs font-medium text-source-blue">
                  {cap.icon}
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-lg font-semibold text-bright">
                  {cap.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example claims */}
      <section className="border-b border-line-grid py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-4 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-bright">
            Example Claim Packets
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted">
            These are the kinds of live-source claims RenderWitness can verify
            through GenLayer consensus.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {EXAMPLE_CLAIMS.map((claim, i) => (
              <div key={i} className="panel flex flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded bg-deep-slate px-2 py-0.5 font-[family-name:var(--font-mono)] text-[0.65rem] text-muted">
                    {claim.type.replace(/_/g, " ")}
                  </span>
                  <span
                    className="font-[family-name:var(--font-mono)] text-[0.65rem] font-medium uppercase"
                    style={{ color: claim.verdictColor }}
                  >
                    {claim.verdict}
                  </span>
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-sm font-semibold text-bright">
                  {claim.title}
                </h3>
                <p className="mb-3 flex-1 text-xs leading-relaxed text-muted">
                  {claim.statement}
                </p>
                <p className="font-[family-name:var(--font-mono)] text-[0.6rem] text-line-grid">
                  {claim.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why not normal oracles */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-bright">
            Why Normal Oracles Cannot Do This
          </h2>
          <p className="mb-8 text-muted leading-relaxed">
            Traditional oracle systems return structured values like{" "}
            <code className="rounded bg-deep-slate px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-xs text-source-blue">
              price = 2500
            </code>{" "}
            or{" "}
            <code className="rounded bg-deep-slate px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-xs text-source-blue">
              status = operational
            </code>
            . They cannot inspect a rendered incident page, understand what the
            content means, compare it to a natural-language claim, and produce a
            consensus verdict.
          </p>
          <p className="mb-10 text-muted leading-relaxed">
            RenderWitness uses GenLayer where GenLayer is strongest: live web
            access, rendered web evidence, unstructured data interpretation, and
            validator consensus over meaning.
          </p>
          <Link href="/submit" className="btn-primary text-base">
            Start Verification
          </Link>
        </div>
      </section>
    </div>
  );
}

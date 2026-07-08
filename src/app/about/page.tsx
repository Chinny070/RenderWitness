import Link from "next/link";

const USE_CASES = [
  "DAOs verifying governance outcomes",
  "Incident response teams proving outage timelines",
  "Documentation auditors tracking API changes",
  "Prediction markets needing source-backed resolution",
  "Dispute protocols requiring public evidence",
  "AI agents verifying web claims autonomously",
  "Research communities creating proof pages",
  "Insurance apps verifying incident reports",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-4 font-[family-name:var(--font-display)] text-3xl font-bold text-bright">
        About RenderWitness
      </h1>

      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p>
          RenderWitness is a technical GenLayer protocol for verifying live web
          claims using web fetching, rendered page capture, visual inspection,
          and validator consensus.
        </p>

        <p>
          Users submit a claim such as &ldquo;This status page says deployments
          are degraded&rdquo; or &ldquo;This pricing page changed from $10 to
          $15&rdquo;. The contract fetches or renders the source, extracts the
          relevant evidence, and asks validators to decide whether the public
          source supports the submitted claim.
        </p>

        <div className="panel p-5">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-bright">
            Why GenLayer?
          </h2>
          <p className="text-muted">
            Traditional smart contracts cannot inspect a live website, understand
            what the page means, compare it to a natural-language claim, and
            produce a consensus verdict. RenderWitness uses GenLayer where
            GenLayer is strongest: live web access, rendered web evidence,
            unstructured data interpretation, and validator consensus over
            meaning.
          </p>
        </div>

        <div className="panel p-5">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-bright">
            Use Cases
          </h2>
          <ul className="space-y-2">
            {USE_CASES.map((uc) => (
              <li
                key={uc}
                className="flex items-start gap-2 text-muted"
              >
                <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-source-blue" />
                {uc}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-bright">
            How It Works
          </h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="font-[family-name:var(--font-mono)] text-xs text-source-blue">
                01
              </span>
              <span className="text-muted">
                User submits a structured claim packet with a source URL and
                natural-language statement.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-[family-name:var(--font-mono)] text-xs text-source-blue">
                02
              </span>
              <span className="text-muted">
                The GenLayer contract fetches the live source and presents it to
                validators.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-[family-name:var(--font-mono)] text-xs text-source-blue">
                03
              </span>
              <span className="text-muted">
                Validators independently evaluate whether the source supports
                the claim using the Equivalence Principle.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-[family-name:var(--font-mono)] text-xs text-source-blue">
                04
              </span>
              <span className="text-muted">
                A canonical result packet is stored on-chain with verdict,
                confidence, alignment, and risk flags.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-[family-name:var(--font-mono)] text-xs text-source-blue">
                05
              </span>
              <span className="text-muted">
                Anyone can view the public proof page or challenge the result
                with new evidence.
              </span>
            </li>
          </ol>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/submit" className="btn-primary text-base">
          Start Verification
        </Link>
      </div>
    </div>
  );
}

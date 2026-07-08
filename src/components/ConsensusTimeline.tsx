"use client";

const STEPS = [
  { key: "created", label: "Claim created" },
  { key: "requested", label: "Verification requested" },
  { key: "fetched", label: "Source fetched" },
  { key: "evaluated", label: "Validators evaluated" },
  { key: "consensus", label: "Consensus reached" },
  { key: "stored", label: "Result stored" },
];

function stepIndex(status: string, hasResult: boolean): number {
  if (status === "verified" && hasResult) return 6;
  if (status === "unverifiable" && hasResult) return 6;
  if (status === "pending") return 1;
  return 0;
}

export function ConsensusTimeline({
  status,
  hasResult,
}: {
  status: string;
  hasResult: boolean;
}) {
  const currentStep = stepIndex(status, hasResult);

  return (
    <div className="panel overflow-hidden">
      <div className="panel-header">Consensus Timeline</div>
      <div className="p-4">
        <div className="flex items-center gap-0">
          {STEPS.map((step, i) => {
            const completed = i < currentStep;
            const active = i === currentStep - 1;
            return (
              <div key={step.key} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <div
                      className="h-px flex-1 transition-colors duration-300"
                      style={{
                        backgroundColor: completed
                          ? "#4BA3FF"
                          : "#263244",
                      }}
                    />
                  )}
                  <div
                    className="relative z-10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300"
                    style={{
                      borderColor: completed ? "#4BA3FF" : "#263244",
                      backgroundColor: completed ? "#4BA3FF" : "transparent",
                      boxShadow: active
                        ? "0 0 8px rgba(75,163,255,0.5)"
                        : "none",
                    }}
                  />
                  {i < STEPS.length - 1 && (
                    <div
                      className="h-px flex-1 transition-colors duration-300"
                      style={{
                        backgroundColor: completed
                          ? "#4BA3FF"
                          : "#263244",
                      }}
                    />
                  )}
                </div>
                <span
                  className="mt-2 text-center font-[family-name:var(--font-mono)] text-[0.6rem] leading-tight transition-colors"
                  style={{
                    color: completed ? "#F5F7FA" : "#9AA7B8",
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

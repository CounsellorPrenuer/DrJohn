// Template-based narrative generation (not LLM-backed) — see ASSUMPTIONS.md
// item 11. Deterministic, offline-safe, and free of external API cost/latency.
// Swap this implementation for an LLM call later without touching callers,
// since the function signature is the contract.

const FACTOR_LABELS: Record<string, string> = {
  FACTOR_I_PLANNING: "Planning & Organising",
  FACTOR_II_SOCIAL_ADJUSTMENT: "Social Adjustment",
  FACTOR_III_SOCIAL_EFFECTIVENESS: "Social Effectiveness",
  FACTOR_IV_DYNAMIC: "Dynamic / Achieving Orientation",
};

function bandFor(score: number): "developing" | "emerging" | "strong" | "exceptional" {
  if (score < 2.5) return "developing";
  if (score < 3.5) return "emerging";
  if (score < 4.5) return "strong";
  return "exceptional";
}

export function generateNarrative(
  olqScores: Record<string, number>,
  factorScores: Record<string, number>,
  overallScore: number
): string {
  const overallBand = bandFor(overallScore);

  const factorLines = Object.entries(factorScores)
    .sort((a, b) => b[1] - a[1])
    .map(([factor, score]) => {
      const label = FACTOR_LABELS[factor] ?? factor;
      const band = bandFor(score);
      return `- ${label}: ${score.toFixed(2)}/5 (${band})`;
    })
    .join("\n");

  const strongest = Object.entries(olqScores).sort((a, b) => b[1] - a[1])[0];
  const weakest = Object.entries(olqScores).sort((a, b) => a[1] - b[1])[0];

  return [
    `Overall Officer Selection Potential: ${overallScore.toFixed(2)}/5 (${overallBand}).`,
    ``,
    `Factor breakdown:`,
    factorLines,
    ``,
    strongest
      ? `Strongest observed quality: ${strongest[0]} (${strongest[1].toFixed(2)}/5).`
      : "",
    weakest
      ? `Area with the most development headroom: ${weakest[0]} (${weakest[1].toFixed(2)}/5).`
      : "",
    ``,
    `This report reflects responses to a single assessment session and should be read as a directional indicator, not a definitive psychometric diagnosis.`,
  ]
    .filter(Boolean)
    .join("\n");
}

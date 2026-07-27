// ============================================================
// OSPA static-site engine — pure vanilla JS, no dependencies.
// Ported from the Next.js version's lib/scoring.ts, scoring-config.ts,
// and lib/narrative.ts. Logic is intentionally identical so scores match
// the full-stack version exactly.
// ============================================================

const FACTOR_WEIGHTS = {
  FACTOR_I_PLANNING: 0.3,
  FACTOR_II_SOCIAL_ADJUSTMENT: 0.25,
  FACTOR_III_SOCIAL_EFFECTIVENESS: 0.2,
  FACTOR_IV_DYNAMIC: 0.25,
};

const FACTOR_LABELS = {
  FACTOR_I_PLANNING: "Planning & Organising",
  FACTOR_II_SOCIAL_ADJUSTMENT: "Social Adjustment",
  FACTOR_III_SOCIAL_EFFECTIVENESS: "Social Effectiveness",
  FACTOR_IV_DYNAMIC: "Dynamic / Achieving Orientation",
};

const SCORE_MIN = 1;
const SCORE_MAX = 5;

// The 15 SSB Officer Like Qualities, grouped under the 4 standard factors.
// See ASSUMPTIONS.md in the full-stack repo for the sourcing note — this
// is a reconstructed framework, not verified against the original spec.
const OLQS = [
  { code: "EI", name: "Effective Intelligence", factor: "FACTOR_I_PLANNING", prompt: "When faced with an unfamiliar problem, I quickly identify the practical steps needed to solve it." },
  { code: "REASONING", name: "Reasoning Ability", factor: "FACTOR_I_PLANNING", prompt: "I can break down a complex situation into its logical components before deciding." },
  { code: "ORGANISING", name: "Organising Ability", factor: "FACTOR_I_PLANNING", prompt: "I naturally take charge of coordinating tasks when a group project has no clear leader." },
  { code: "EXPRESSION", name: "Power of Expression", factor: "FACTOR_I_PLANNING", prompt: "I can explain a complex idea clearly to someone unfamiliar with the topic." },
  { code: "COOPERATION", name: "Cooperation", factor: "FACTOR_II_SOCIAL_ADJUSTMENT", prompt: "I adjust my own preferences to help a team reach a shared goal." },
  { code: "RESPONSIBILITY", name: "Sense of Responsibility", factor: "FACTOR_II_SOCIAL_ADJUSTMENT", prompt: "I follow through on commitments even when no one is checking on me." },
  { code: "INITIATIVE", name: "Initiative", factor: "FACTOR_II_SOCIAL_ADJUSTMENT", prompt: "I start addressing a problem as soon as I notice it, without waiting for instructions." },
  { code: "ADAPTABILITY", name: "Social Adaptability", factor: "FACTOR_III_SOCIAL_EFFECTIVENESS", prompt: "I feel comfortable in social settings with people very different from me." },
  { code: "LIVELINESS", name: "Liveliness", factor: "FACTOR_III_SOCIAL_EFFECTIVENESS", prompt: "I bring energy and enthusiasm to group activities." },
  { code: "INFLUENCE", name: "Group Influencing Ability", factor: "FACTOR_III_SOCIAL_EFFECTIVENESS", prompt: "Others often follow my suggestions in group discussions." },
  { code: "DETERMINATION", name: "Determination", factor: "FACTOR_IV_DYNAMIC", prompt: "I keep working toward a goal even after repeated setbacks." },
  { code: "COURAGE", name: "Courage", factor: "FACTOR_IV_DYNAMIC", prompt: "I am willing to take a difficult but necessary stand, even if unpopular." },
  { code: "STAMINA", name: "Stamina", factor: "FACTOR_IV_DYNAMIC", prompt: "I can sustain high effort over long, demanding periods." },
  { code: "SELF_CONFIDENCE", name: "Self-Confidence", factor: "FACTOR_IV_DYNAMIC", prompt: "I trust my own judgement even under scrutiny from others." },
  { code: "DECISION_SPEED", name: "Speed of Decision", factor: "FACTOR_IV_DYNAMIC", prompt: "I can make a sound decision quickly when time is limited." },
];

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * responses: { [olqCode]: number (1-5) }
 * Pure function — identical logic to the server version's computeOspaScore,
 * simplified because in this single-module static build every question maps
 * 1:1 to exactly one OLQ with weight 1.
 */
function computeOspaScore(responses) {
  const answered = Object.entries(responses);
  if (answered.length === 0) {
    throw new Error("Cannot score an attempt with zero responses");
  }

  const olqScores = {};
  const olqFactor = {};

  for (const olq of OLQS) {
    const value = responses[olq.code];
    if (value === undefined) continue;
    if (value < SCORE_MIN || value > SCORE_MAX) {
      throw new Error(`Response value ${value} for ${olq.code} out of range [${SCORE_MIN}, ${SCORE_MAX}]`);
    }
    olqScores[olq.code] = round2(value);
    olqFactor[olq.code] = olq.factor;
  }

  const factorBuckets = {};
  for (const [code, score] of Object.entries(olqScores)) {
    const factor = olqFactor[code];
    if (!factorBuckets[factor]) factorBuckets[factor] = [];
    factorBuckets[factor].push(score);
  }

  const factorScores = {};
  for (const [factor, scores] of Object.entries(factorBuckets)) {
    factorScores[factor] = round2(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  let overallScore = 0;
  let weightSum = 0;
  for (const [factor, score] of Object.entries(factorScores)) {
    const w = FACTOR_WEIGHTS[factor] ?? 0;
    overallScore += score * w;
    weightSum += w;
  }
  overallScore = weightSum > 0 ? round2(overallScore / weightSum) : 0;

  return { olqScores, factorScores, overallScore };
}

function bandFor(score) {
  if (score < 2.5) return "developing";
  if (score < 3.5) return "emerging";
  if (score < 4.5) return "strong";
  return "exceptional";
}

/**
 * Deterministic template-based narrative — identical approach to
 * lib/narrative.ts in the full-stack version.
 */
function generateNarrative(olqScores, factorScores, overallScore) {
  const overallBand = bandFor(overallScore);

  const factorLines = Object.entries(factorScores)
    .sort((a, b) => b[1] - a[1])
    .map(([factor, score]) => `- ${FACTOR_LABELS[factor] ?? factor}: ${score.toFixed(2)}/5 (${bandFor(score)})`)
    .join("\n");

  const strongest = Object.entries(olqScores).sort((a, b) => b[1] - a[1])[0];
  const weakest = Object.entries(olqScores).sort((a, b) => a[1] - b[1])[0];

  const olqName = (code) => (OLQS.find((o) => o.code === code) || {}).name || code;

  return [
    `Overall Officer Selection Potential: ${overallScore.toFixed(2)}/5 (${overallBand}).`,
    ``,
    `Factor breakdown:`,
    factorLines,
    ``,
    strongest ? `Strongest observed quality: ${olqName(strongest[0])} (${strongest[1].toFixed(2)}/5).` : "",
    weakest ? `Area with the most development headroom: ${olqName(weakest[0])} (${weakest[1].toFixed(2)}/5).` : "",
    ``,
    `This report reflects responses to a single assessment session and should be read as a directional indicator, not a definitive psychometric diagnosis.`,
  ]
    .filter(Boolean)
    .join("\n");
}

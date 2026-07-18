import { FACTOR_WEIGHTS, SCORE_MIN, SCORE_MAX } from "./scoring-config";

export interface RawResponse {
  questionId: string;
  value: number; // normalized 1-5 by the caller before this stage
}

export interface QuestionOLQMap {
  questionId: string;
  olqCode: string;
  factor: string;
  weight: number;
}

export interface ScoringResult {
  olqScores: Record<string, number>;
  factorScores: Record<string, number>;
  overallScore: number;
}

/**
 * Pure function: given raw responses and the question->OLQ weight map,
 * compute OLQ-level, factor-level, and overall scores.
 * No I/O, no DB access — safe to unit test in isolation.
 */
export function computeOspaScore(
  responses: RawResponse[],
  qMap: QuestionOLQMap[]
): ScoringResult {
  if (responses.length === 0) {
    throw new Error("Cannot score an attempt with zero responses");
  }

  const responseByQ = new Map(responses.map((r) => [r.questionId, r.value]));

  // Accumulate weighted sums per OLQ
  const olqSum = new Map<string, number>();
  const olqWeight = new Map<string, number>();
  const olqFactor = new Map<string, string>();

  for (const link of qMap) {
    const value = responseByQ.get(link.questionId);
    if (value === undefined) continue;
    if (value < SCORE_MIN || value > SCORE_MAX) {
      throw new Error(
        `Response value ${value} for question ${link.questionId} out of range [${SCORE_MIN}, ${SCORE_MAX}]`
      );
    }

    olqSum.set(link.olqCode, (olqSum.get(link.olqCode) ?? 0) + value * link.weight);
    olqWeight.set(link.olqCode, (olqWeight.get(link.olqCode) ?? 0) + link.weight);
    olqFactor.set(link.olqCode, link.factor);
  }

  const olqScores: Record<string, number> = {};
  for (const [code, sum] of olqSum.entries()) {
    const w = olqWeight.get(code) ?? 1;
    olqScores[code] = round2(sum / w);
  }

  // Factor scores: simple average of the OLQ scores under each factor
  const factorBuckets = new Map<string, number[]>();
  for (const [code, score] of Object.entries(olqScores)) {
    const factor = olqFactor.get(code)!;
    if (!factorBuckets.has(factor)) factorBuckets.set(factor, []);
    factorBuckets.get(factor)!.push(score);
  }

  const factorScores: Record<string, number> = {};
  for (const [factor, scores] of factorBuckets.entries()) {
    factorScores[factor] = round2(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  // Overall: weighted composite using FACTOR_WEIGHTS, renormalized over
  // whatever factors actually have data (in case a module was skipped).
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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

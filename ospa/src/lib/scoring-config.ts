export const FACTOR_WEIGHTS: Record<string, number> = {
  FACTOR_I_PLANNING: 0.3,
  FACTOR_II_SOCIAL_ADJUSTMENT: 0.25,
  FACTOR_III_SOCIAL_EFFECTIVENESS: 0.2,
  FACTOR_IV_DYNAMIC: 0.25,
};

// Sanity check: weights must sum to 1.0
const sum = Object.values(FACTOR_WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(sum - 1) > 1e-6) {
  throw new Error(`FACTOR_WEIGHTS must sum to 1.0, got ${sum}`);
}

export const SCORE_MIN = 1;
export const SCORE_MAX = 5;

import { describe, it, expect } from "vitest";
import { generateNarrative } from "@/lib/narrative";

describe("generateNarrative", () => {
  const olqScores = { EI: 4.5, COURAGE: 3, COOPERATION: 4, LIVELINESS: 2 };
  const factorScores = {
    FACTOR_I_PLANNING: 4.5,
    FACTOR_IV_DYNAMIC: 3,
    FACTOR_II_SOCIAL_ADJUSTMENT: 4,
    FACTOR_III_SOCIAL_EFFECTIVENESS: 2,
  };

  it("includes the overall score and band", () => {
    const text = generateNarrative(olqScores, factorScores, 3.5);
    expect(text).toContain("3.50/5");
    expect(text).toContain("strong");
  });

  it("identifies the strongest and weakest OLQ correctly", () => {
    const text = generateNarrative(olqScores, factorScores, 3.5);
    expect(text).toContain("Strongest observed quality: EI");
    expect(text).toContain("development headroom: LIVELINESS");
  });

  it("labels factor bands consistently with score thresholds", () => {
    const text = generateNarrative(olqScores, factorScores, 3.5);
    expect(text).toContain("Planning & Organising: 4.50/5 (exceptional)");
    expect(text).toContain("Social Effectiveness: 2.00/5 (developing)");
  });
});

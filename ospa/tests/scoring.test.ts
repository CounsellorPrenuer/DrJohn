import { describe, it, expect } from "vitest";
import { computeOspaScore, type QuestionOLQMap, type RawResponse } from "@/lib/scoring";

const qMap: QuestionOLQMap[] = [
  { questionId: "q1", olqCode: "EI", factor: "FACTOR_I_PLANNING", weight: 1 },
  { questionId: "q2", olqCode: "EI", factor: "FACTOR_I_PLANNING", weight: 1 },
  { questionId: "q3", olqCode: "COURAGE", factor: "FACTOR_IV_DYNAMIC", weight: 1 },
  { questionId: "q4", olqCode: "COOPERATION", factor: "FACTOR_II_SOCIAL_ADJUSTMENT", weight: 1 },
  { questionId: "q5", olqCode: "LIVELINESS", factor: "FACTOR_III_SOCIAL_EFFECTIVENESS", weight: 1 },
];

describe("computeOspaScore", () => {
  it("computes weighted OLQ, factor, and overall scores", () => {
    const responses: RawResponse[] = [
      { questionId: "q1", value: 4 },
      { questionId: "q2", value: 5 },
      { questionId: "q3", value: 3 },
      { questionId: "q4", value: 4 },
      { questionId: "q5", value: 2 },
    ];

    const result = computeOspaScore(responses, qMap);

    expect(result.olqScores.EI).toBe(4.5);
    expect(result.olqScores.COURAGE).toBe(3);
    expect(result.factorScores.FACTOR_I_PLANNING).toBe(4.5);
    expect(result.overallScore).toBe(3.5);
  });

  it("throws on zero responses", () => {
    expect(() => computeOspaScore([], qMap)).toThrow(/zero responses/);
  });

  it("throws on out-of-range response values", () => {
    expect(() =>
      computeOspaScore([{ questionId: "q1", value: 9 }], qMap)
    ).toThrow(/out of range/);
  });

  it("ignores responses with no matching question map entry", () => {
    const result = computeOspaScore(
      [{ questionId: "unknown-question", value: 5 }],
      qMap
    );
    expect(Object.keys(result.olqScores)).toHaveLength(0);
    expect(result.overallScore).toBe(0);
  });

  it("applies per-question weights correctly", () => {
    const weightedMap: QuestionOLQMap[] = [
      { questionId: "q1", olqCode: "EI", factor: "FACTOR_I_PLANNING", weight: 2 },
      { questionId: "q2", olqCode: "EI", factor: "FACTOR_I_PLANNING", weight: 1 },
    ];
    const responses: RawResponse[] = [
      { questionId: "q1", value: 5 },
      { questionId: "q2", value: 2 },
    ];
    // Weighted avg: (5*2 + 2*1) / 3 = 4.0
    const result = computeOspaScore(responses, weightedMap);
    expect(result.olqScores.EI).toBe(4);
  });

  it("renormalizes overall score when only some factors have data", () => {
    const partialMap: QuestionOLQMap[] = [
      { questionId: "q1", olqCode: "EI", factor: "FACTOR_I_PLANNING", weight: 1 },
    ];
    const result = computeOspaScore([{ questionId: "q1", value: 5 }], partialMap);
    // Only one factor present -> overall should equal that factor's score
    expect(result.overallScore).toBe(5);
  });
});

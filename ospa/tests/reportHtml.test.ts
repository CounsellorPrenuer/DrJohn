import { describe, it, expect } from "vitest";
import { renderReportHtml } from "@/lib/reportHtml";

describe("renderReportHtml", () => {
  const base = {
    candidateName: "Test Candidate",
    generatedAt: new Date("2026-07-13T00:00:00Z"),
    overallScore: 3.5,
    factorScores: { FACTOR_I_PLANNING: 4.5, FACTOR_IV_DYNAMIC: 3 },
    olqScores: { EI: 4.5, COURAGE: 3 },
    narrative: "Line one.\nLine two.",
  };

  it("escapes HTML-unsafe characters in candidate name", () => {
    const html = renderReportHtml({ ...base, candidateName: 'Test <script>alert(1)</script> & "Co"' });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("formats scores to 2 decimal places", () => {
    const html = renderReportHtml(base);
    expect(html).toContain("4.50 / 5");
    expect(html).toContain("3.50 / 5");
  });

  it("includes the disclaimer footer", () => {
    const html = renderReportHtml(base);
    expect(html).toContain("directional indicator");
  });
});

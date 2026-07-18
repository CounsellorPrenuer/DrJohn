const FACTOR_LABELS: Record<string, string> = {
  FACTOR_I_PLANNING: "Planning & Organising",
  FACTOR_II_SOCIAL_ADJUSTMENT: "Social Adjustment",
  FACTOR_III_SOCIAL_EFFECTIVENESS: "Social Effectiveness",
  FACTOR_IV_DYNAMIC: "Dynamic / Achieving Orientation",
};

interface ReportHtmlInput {
  candidateName: string;
  generatedAt: Date;
  overallScore: number;
  factorScores: Record<string, number>;
  olqScores: Record<string, number>;
  narrative: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderReportHtml(input: ReportHtmlInput): string {
  const factorRows = Object.entries(input.factorScores)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([factor, score]) =>
        `<tr><td>${escapeHtml(FACTOR_LABELS[factor] ?? factor)}</td><td>${score.toFixed(2)} / 5</td></tr>`
    )
    .join("");

  const olqRows = Object.entries(input.olqScores)
    .sort((a, b) => b[1] - a[1])
    .map(([olq, score]) => `<tr><td>${escapeHtml(olq)}</td><td>${score.toFixed(2)} / 5</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .subtitle { color: #64748b; font-size: 12px; margin-bottom: 24px; }
  .overall { font-size: 36px; font-weight: bold; margin-bottom: 24px; }
  h2 { font-size: 14px; margin-top: 28px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  td { padding: 6px 4px; border-bottom: 1px solid #e2e8f0; }
  .narrative { white-space: pre-line; font-size: 12px; line-height: 1.6; margin-top: 12px; }
  .footer { margin-top: 32px; font-size: 10px; color: #94a3b8; }
</style>
</head>
<body>
  <h1>Officer Development Report</h1>
  <p class="subtitle">
    Candidate: ${escapeHtml(input.candidateName)} &middot;
    Generated: ${input.generatedAt.toLocaleDateString()}
  </p>
  <p class="overall">${input.overallScore.toFixed(2)} / 5 <span style="font-size:14px;color:#64748b;">Overall Score</span></p>

  <h2>Factor Breakdown</h2>
  <table>${factorRows}</table>

  <h2>Officer Like Qualities</h2>
  <table>${olqRows}</table>

  <h2>Narrative</h2>
  <p class="narrative">${escapeHtml(input.narrative)}</p>

  <p class="footer">OSPA™ — Officer Selection Potential Assessment. This report is a directional indicator based on a single self-assessment session, not a definitive psychometric diagnosis.</p>
</body>
</html>`;
}

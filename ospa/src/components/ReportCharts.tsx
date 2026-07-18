"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const FACTOR_LABELS: Record<string, string> = {
  FACTOR_I_PLANNING: "Planning",
  FACTOR_II_SOCIAL_ADJUSTMENT: "Social Adjustment",
  FACTOR_III_SOCIAL_EFFECTIVENESS: "Social Effectiveness",
  FACTOR_IV_DYNAMIC: "Dynamic",
};

export default function ReportCharts({
  factorScores,
  olqScores,
}: {
  factorScores: Record<string, number>;
  olqScores: Record<string, number>;
}) {
  const factorData = Object.entries(factorScores).map(([factor, score]) => ({
    factor: FACTOR_LABELS[factor] ?? factor,
    score,
  }));

  const olqData = Object.entries(olqScores)
    .sort((a, b) => b[1] - a[1])
    .map(([olq, score]) => ({ olq, score }));

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <p className="mb-2 text-sm font-medium text-slate-300">Factor Breakdown</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={factorData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="factor" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 10 }} />
            <Radar dataKey="score" stroke="#2f5fd8" fill="#2f5fd8" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <p className="mb-2 text-sm font-medium text-slate-300">OLQ Scores</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={olqData} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis
              type="category"
              dataKey="olq"
              width={90}
              tick={{ fill: "#cbd5e1", fontSize: 10 }}
            />
            <Tooltip />
            <Bar dataKey="score" fill="#2f5fd8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

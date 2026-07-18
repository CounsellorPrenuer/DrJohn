import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReportCharts from "@/components/ReportCharts";
import FeedbackWidget from "@/components/FeedbackWidget";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { attemptId } = await params;

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { report: true },
  });

  if (!attempt || attempt.userId !== session.user.id || !attempt.report) {
    notFound();
  }

  const report = attempt.report;
  const factorScores = report.factorScores as Record<string, number>;
  const olqScores = report.olqScores as Record<string, number>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Officer Development Report</h1>
          <p className="text-sm text-slate-400">
            Generated {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>
        <a
          href={`/api/assessments/${attemptId}/report/pdf`}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
        >
          Download PDF
        </a>
      </header>

      <div className="mb-8 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
        <p className="text-sm text-slate-400">Overall Score</p>
        <p className="text-4xl font-semibold">{report.overallScore.toFixed(2)} / 5</p>
      </div>

      <ReportCharts factorScores={factorScores} olqScores={olqScores} />

      <div className="mt-8 whitespace-pre-line rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm leading-relaxed text-slate-300">
        {report.narrative}
      </div>

      <FeedbackWidget attemptId={attemptId} />
    </main>
  );
}

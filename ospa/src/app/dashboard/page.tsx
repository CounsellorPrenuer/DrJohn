import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StartAssessmentButton from "@/components/StartAssessmentButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const attempts = await prisma.assessmentAttempt.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: "desc" },
    include: { report: true },
  });

  const inProgress = attempts.find((a) => a.status === "IN_PROGRESS");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {session.user.name ?? "Candidate"}</h1>
          <p className="text-sm text-slate-400">Your Officer Selection Potential Assessment history</p>
        </div>
        <StartAssessmentButton resumeAttemptId={inProgress?.id} />
      </header>

      {attempts.length === 0 ? (
        <p className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
          You haven&apos;t started an assessment yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {attempts.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-4"
            >
              <div>
                <p className="text-sm font-medium">
                  Attempt started {new Date(a.startedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-400">Status: {a.status}</p>
              </div>
              {a.status === "SCORED" && a.report ? (
                <a
                  href={`/report/${a.id}`}
                  className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                >
                  View report
                </a>
              ) : a.status === "IN_PROGRESS" ? (
                <a
                  href={`/assessment/${a.id}`}
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Resume
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

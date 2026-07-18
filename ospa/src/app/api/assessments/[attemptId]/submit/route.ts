import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { computeOspaScore, type RawResponse, type QuestionOLQMap } from "@/lib/scoring";
import { generateNarrative } from "@/lib/narrative";

// POST /api/assessments/[attemptId]/submit
// Marks the attempt SUBMITTED, computes OLQ/factor/overall scores, and
// persists a Report row. This is idempotent: re-calling on an already
// SCORED attempt just returns the existing report.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await params;

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { responses: true, report: true },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (attempt.status === "SCORED" && attempt.report) {
    return NextResponse.json({ report: attempt.report, alreadyScored: true });
  }

  if (attempt.responses.length === 0) {
    return NextResponse.json(
      { error: "Cannot submit an attempt with no responses" },
      { status: 400 }
    );
  }

  const questionIds = attempt.responses.map((r) => r.questionId);
  const links = await prisma.questionOLQ.findMany({
    where: { questionId: { in: questionIds } },
    include: { olq: true },
  });

  const qMap: QuestionOLQMap[] = links.map((l) => ({
    questionId: l.questionId,
    olqCode: l.olq.code,
    factor: l.olq.factor,
    weight: l.weight,
  }));

  const rawResponses: RawResponse[] = attempt.responses.map((r) => ({
    questionId: r.questionId,
    value: normalizeValue(r.value),
  }));

  const { olqScores, factorScores, overallScore } = computeOspaScore(
    rawResponses,
    qMap
  );

  const narrative = generateNarrative(olqScores, factorScores, overallScore);

  const [, report] = await prisma.$transaction([
    prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { status: "SCORED", submittedAt: new Date(), scoredAt: new Date() },
    }),
    prisma.report.create({
      data: {
        attemptId,
        olqScores,
        factorScores,
        overallScore,
        narrative,
      },
    }),
  ]);

  await writeAuditLog({
    actorId: session.user.id,
    action: "ATTEMPT_SUBMITTED_AND_SCORED",
    entity: "AssessmentAttempt",
    entityId: attemptId,
    diff: { overallScore },
  });

  return NextResponse.json({ report, alreadyScored: false }, { status: 201 });
}

// Response.value is stored as Json to support multiple question types;
// scoring only operates on the numeric case. Non-numeric types (e.g. free
// text) are expected to have been pre-normalized by the module's own
// scoring adapter before reaching this stage — out of scope for v0.9.
function normalizeValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  throw new Error(
    `Response value is not numeric and no adapter is configured: ${JSON.stringify(value)}`
  );
}

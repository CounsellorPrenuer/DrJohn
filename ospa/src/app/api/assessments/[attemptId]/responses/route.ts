import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const responseSchema = z.object({
  questionId: z.string().cuid(),
  value: z.union([z.number(), z.string(), z.record(z.unknown())]),
});

// PATCH /api/assessments/[attemptId]/responses
// Upserts a single response. Called on debounce/blur from the client for autosave.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await params;

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (attempt.status !== "IN_PROGRESS") {
    return NextResponse.json(
      { error: "Attempt is no longer editable" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { questionId, value } = parsed.data;

  const response = await prisma.response.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: { attemptId, questionId, value },
    update: { value },
  });

  return NextResponse.json({ response });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

// POST /api/assessments/start
// Resumes an IN_PROGRESS attempt if one exists, otherwise creates a new one.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.assessmentAttempt.findFirst({
    where: { userId: session.user.id, status: "IN_PROGRESS" },
    include: { responses: true },
  });

  if (existing) {
    return NextResponse.json({ attempt: existing, resumed: true });
  }

  const attempt = await prisma.assessmentAttempt.create({
    data: { userId: session.user.id, status: "IN_PROGRESS" },
  });

  await writeAuditLog({
    actorId: session.user.id,
    action: "ATTEMPT_STARTED",
    entity: "AssessmentAttempt",
    entityId: attempt.id,
  });

  return NextResponse.json({ attempt, resumed: false }, { status: 201 });
}

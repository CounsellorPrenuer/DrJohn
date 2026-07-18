import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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

  // v0.9: single fixed module ("core-olq-screener"). Multi-module
  // selection is out of scope for this milestone — see ASSUMPTIONS.md.
  const module = await prisma.module.findUnique({
    where: { slug: "core-olq-screener" },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ attempt, module });
}

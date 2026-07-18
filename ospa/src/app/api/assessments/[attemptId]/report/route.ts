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
    include: { report: true },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!attempt.report) {
    return NextResponse.json({ error: "Not yet scored" }, { status: 404 });
  }

  return NextResponse.json({ report: attempt.report, isPaid: attempt.isPaid });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const feedbackSchema = z.object({
  attemptId: z.string().cuid().optional(),
  category: z.enum(["bug", "content", "scoring", "general"]),
  message: z.string().min(5).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const feedback = await prisma.feedback.create({
    data: { userId: session.user.id, ...parsed.data },
  });

  await writeAuditLog({
    actorId: session.user.id,
    action: "FEEDBACK_SUBMITTED",
    entity: "Feedback",
    entityId: feedback.id,
  });

  return NextResponse.json({ feedback }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true } } },
  });

  return NextResponse.json({ feedback });
}

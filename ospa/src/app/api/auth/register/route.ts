import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Deliberately vague to avoid account enumeration
    return NextResponse.json(
      { error: "Unable to register with the provided details" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "CANDIDATE" },
    select: { id: true, email: true, name: true },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "USER_REGISTERED",
    entity: "User",
    entityId: user.id,
    ip: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ user }, { status: 201 });
}

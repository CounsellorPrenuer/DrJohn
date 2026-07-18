import { prisma } from "./prisma";

interface AuditParams {
  actorId: string | null;
  action: string;
  entity: string;
  entityId?: string;
  diff?: Record<string, unknown>;
  ip?: string | null;
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      diff: params.diff ?? undefined,
      ip: params.ip ?? undefined,
    },
  });
}

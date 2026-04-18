import type { PrismaClient } from '@/generated/prisma/client';
import type { AuditLogEntry, AuditLogRecorder } from '@/features/audit-results/service/types';

type Deps = { db: PrismaClient };

export function makeAuditLogService({ db }: Deps): AuditLogRecorder & {
  listForEntity: (
    entityType: string,
    entityId: string,
  ) => Promise<
    Array<{
      id: string;
      entityType: string;
      entityId: string;
      action: string;
      actorId: string;
      actor: { id: string; name: string; role: string } | null;
      diff: unknown;
      createdAt: Date;
    }>
  >;
} {
  return {
    async record(entry: AuditLogEntry) {
      await db.auditLog.create({
        data: {
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          actorId: entry.actorId,
          diff: entry.diff as never,
        },
      });
    },

    async listForEntity(entityType, entityId) {
      return db.auditLog.findMany({
        where: { entityType, entityId },
        include: { actor: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      });
    },
  };
}

export type AuditLogService = ReturnType<typeof makeAuditLogService>;

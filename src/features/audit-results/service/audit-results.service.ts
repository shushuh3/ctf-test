import type { Prisma, PrismaClient } from '@/generated/prisma/client';
import type { Severity, Status } from '@/generated/prisma/enums';
import { NotFoundError, ValidationError } from '@/core/errors';
import type {
  AddCommentInput,
  ChangeSeverityInput,
  CreateAuditResultInput,
  ListQuery,
  UpdateFieldsInput,
  UpdateStatusInput,
} from '../schemas';
import type { AuditLogEntry, AuditLogRecorder } from './types';

type Deps = {
  db: PrismaClient;
  auditLog: AuditLogRecorder;
};

type Actor = { id: string };

const CLOSED_STATUSES: Status[] = ['RESOLVED', 'CONFIRMED'];

export function makeAuditResultsService({ db, auditLog }: Deps) {
  // --- helpers ---
  const diff = (before: Record<string, unknown>, after: Record<string, unknown>) => {
    const out: AuditLogEntry['diff'] = {};
    for (const key of Object.keys(after)) {
      if (before[key] !== after[key]) {
        out[key] = [before[key] ?? null, after[key] ?? null] as const;
      }
    }
    return out;
  };

  async function getByIdOrThrow(id: string) {
    const row = await db.auditResult.findUnique({
      where: { id },
      include: { system: true, assignee: true },
    });
    if (!row) throw new NotFoundError('AuditResult', id);
    return row;
  }

  // --- api ---
  return {
    async list(query: ListQuery) {
      const where: Prisma.AuditResultWhereInput = {};
      if (query.severity?.length) where.severity = { in: query.severity as Severity[] };
      if (query.status?.length) where.status = { in: query.status as Status[] };
      if (query.systemId) where.systemId = query.systemId;
      if (query.assigneeId) where.assigneeId = query.assigneeId;
      if (query.category) where.category = { contains: query.category, mode: 'insensitive' };
      if (query.foundFrom || query.foundTo) {
        where.foundAt = {};
        if (query.foundFrom) where.foundAt.gte = query.foundFrom;
        if (query.foundTo) where.foundAt.lte = query.foundTo;
      }
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const [total, items] = await Promise.all([
        db.auditResult.count({ where }),
        db.auditResult.findMany({
          where,
          orderBy: { [query.sortBy]: query.sortDir },
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
          include: { system: true, assignee: true },
        }),
      ]);

      return { items, total, page: query.page, pageSize: query.pageSize };
    },

    async getById(id: string) {
      return getByIdOrThrow(id);
    },

    async listComments(resultId: string) {
      await getByIdOrThrow(resultId);
      return db.comment.findMany({
        where: { auditResultId: resultId },
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      });
    },

    async distinctCategories() {
      const rows = await db.auditResult.findMany({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      });
      return rows.map((r) => r.category);
    },

    async create(input: CreateAuditResultInput, actor: Actor) {
      if (input.dueAt && input.dueAt < input.foundAt) {
        throw new ValidationError('dueAt cannot be before foundAt', {
          dueAt: ['Срок устранения не может быть раньше даты обнаружения'],
        });
      }
      const created = await db.auditResult.create({
        data: {
          title: input.title,
          systemId: input.systemId,
          category: input.category,
          description: input.description,
          severity: input.severity as Severity,
          assigneeId: input.assigneeId ?? null,
          foundAt: input.foundAt,
          dueAt: input.dueAt ?? null,
          riskScore: input.riskScore,
        },
      });
      await auditLog.record({
        entityType: 'AuditResult',
        entityId: created.id,
        action: 'create',
        actorId: actor.id,
        diff: {
          status: [null, created.status],
          severity: [null, created.severity],
        },
      });
      return created;
    },

    async updateStatus(id: string, input: UpdateStatusInput, actor: Actor) {
      const before = await getByIdOrThrow(id);
      if (before.status === input.status) return before;

      const nextStatus = input.status as Status;
      const shouldSetResolved =
        CLOSED_STATUSES.includes(nextStatus) && !before.resolvedAt ? new Date() : undefined;
      const shouldClearResolved = !CLOSED_STATUSES.includes(nextStatus) && before.resolvedAt;

      const updated = await db.auditResult.update({
        where: { id },
        data: {
          status: nextStatus,
          ...(shouldSetResolved ? { resolvedAt: shouldSetResolved } : {}),
          ...(shouldClearResolved ? { resolvedAt: null } : {}),
        },
      });
      await auditLog.record({
        entityType: 'AuditResult',
        entityId: id,
        action: 'status_change',
        actorId: actor.id,
        diff: { status: [before.status, updated.status] },
      });
      return updated;
    },

    async updateFields(id: string, input: UpdateFieldsInput, actor: Actor) {
      const before = await getByIdOrThrow(id);
      if (input.dueAt && input.dueAt < before.foundAt) {
        throw new ValidationError('dueAt cannot be before foundAt', {
          dueAt: ['Срок устранения не может быть раньше даты обнаружения'],
        });
      }

      const updated = await db.auditResult.update({
        where: { id },
        data: {
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.category !== undefined ? { category: input.category } : {}),
          ...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
          ...(input.riskScore !== undefined ? { riskScore: input.riskScore } : {}),
          ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId } : {}),
        },
      });

      const d = diff(
        {
          description: before.description,
          category: before.category,
          dueAt: before.dueAt?.toISOString() ?? null,
          riskScore: before.riskScore,
          assigneeId: before.assigneeId,
        },
        {
          description: updated.description,
          category: updated.category,
          dueAt: updated.dueAt?.toISOString() ?? null,
          riskScore: updated.riskScore,
          assigneeId: updated.assigneeId,
        },
      );
      if (Object.keys(d).length > 0) {
        await auditLog.record({
          entityType: 'AuditResult',
          entityId: id,
          action: 'update',
          actorId: actor.id,
          diff: d,
        });
      }
      return updated;
    },

    async changeSeverity(id: string, input: ChangeSeverityInput, actor: Actor) {
      const before = await getByIdOrThrow(id);
      if (before.severity === input.severity) return before;
      const updated = await db.auditResult.update({
        where: { id },
        data: { severity: input.severity as Severity },
      });
      await auditLog.record({
        entityType: 'AuditResult',
        entityId: id,
        action: 'severity_change',
        actorId: actor.id,
        diff: { severity: [before.severity, updated.severity] },
      });
      return updated;
    },

    async confirmFinal(id: string, actor: Actor) {
      const before = await getByIdOrThrow(id);
      if (before.status === 'CONFIRMED') return before;
      const updated = await db.auditResult.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          resolvedAt: before.resolvedAt ?? new Date(),
        },
      });
      await auditLog.record({
        entityType: 'AuditResult',
        entityId: id,
        action: 'confirm_final',
        actorId: actor.id,
        diff: { status: [before.status, updated.status] },
      });
      return updated;
    },

    async addComment(id: string, input: AddCommentInput, actor: Actor) {
      await getByIdOrThrow(id);
      const comment = await db.comment.create({
        data: {
          auditResultId: id,
          authorId: actor.id,
          content: input.content,
        },
        include: { author: true },
      });
      await auditLog.record({
        entityType: 'AuditResult',
        entityId: id,
        action: 'comment_added',
        actorId: actor.id,
        diff: { commentId: [null, comment.id] },
      });
      return comment;
    },

    async remove(id: string, actor: Actor) {
      await getByIdOrThrow(id);
      await db.auditResult.delete({ where: { id } });
      await auditLog.record({
        entityType: 'AuditResult',
        entityId: id,
        action: 'delete',
        actorId: actor.id,
        diff: {},
      });
    },
  };
}

export type AuditResultsService = ReturnType<typeof makeAuditResultsService>;

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError, ValidationError } from '@/core/errors';
import { makeAuditResultsService, type AuditResultsService } from './audit-results.service';
import type { AuditLogEntry, AuditLogRecorder } from './types';

const ACTOR = { id: 'user-actor' };

type Fixture = {
  db: DeepMockProxy<PrismaClient>;
  auditLog: AuditLogRecorder & { record: ReturnType<typeof vi.fn> };
  svc: AuditResultsService;
  recorded: () => AuditLogEntry[];
};

function build(): Fixture {
  const db = mockDeep<PrismaClient>();
  const recorded: AuditLogEntry[] = [];
  const record = vi.fn(async (entry: AuditLogEntry) => {
    recorded.push(entry);
  });
  const auditLog = { record };
  const svc = makeAuditResultsService({ db, auditLog });
  return { db, auditLog, svc, recorded: () => recorded };
}

// Минимальная фабрика "настоящей" записи для include={system, assignee}.
// Возвращаем `as never` — чтобы удовлетворить строгие Prisma-типы в mockResolvedValue(...).
function makeRow(overrides: Partial<Record<string, unknown>> = {}) {
  const foundAt = new Date('2026-01-01T00:00:00Z');
  const base = {
    id: 'r1',
    title: 'T',
    systemId: 's1',
    category: 'cat',
    description: 'd',
    severity: 'MEDIUM',
    status: 'NEW',
    assigneeId: 'u1',
    foundAt,
    dueAt: null,
    resolvedAt: null,
    riskScore: 50,
    createdAt: foundAt,
    updatedAt: foundAt,
    system: { id: 's1', name: 'Sys', module: 'mod', createdAt: foundAt },
    assignee: null,
    ...overrides,
  };
  return base as never;
}

describe('audit-results service', () => {
  let f: Fixture;
  beforeEach(() => {
    f = build();
  });

  describe('list', () => {
    it('builds where/orderBy/skip/take and returns {items,total,page,pageSize}', async () => {
      f.db.auditResult.count.mockResolvedValue(2);
      f.db.auditResult.findMany.mockResolvedValue([makeRow({ id: 'r1' }), makeRow({ id: 'r2' })]);

      const res = await f.svc.list({
        search: 'mfa',
        severity: ['HIGH', 'CRITICAL'],
        status: ['NEW'],
        systemId: 'sys-x',
        assigneeId: 'u1',
        category: 'auth',
        foundFrom: new Date('2026-01-01'),
        foundTo: new Date('2026-03-01'),
        sortBy: 'riskScore',
        sortDir: 'asc',
        page: 2,
        pageSize: 10,
      });

      expect(res.total).toBe(2);
      expect(res.items).toHaveLength(2);
      expect(res.page).toBe(2);
      expect(res.pageSize).toBe(10);

      const [call] = f.db.auditResult.findMany.mock.calls;
      expect(call?.[0]?.orderBy).toEqual({ riskScore: 'asc' });
      expect(call?.[0]?.skip).toBe(10); // (page-1)*pageSize = 10
      expect(call?.[0]?.take).toBe(10);
      expect(call?.[0]?.where).toMatchObject({
        severity: { in: ['HIGH', 'CRITICAL'] },
        status: { in: ['NEW'] },
        systemId: 'sys-x',
        assigneeId: 'u1',
      });
      expect(call?.[0]?.where?.OR).toBeDefined();
      expect(call?.[0]?.where?.foundAt).toBeDefined();
    });

    it('omits filters when not provided', async () => {
      f.db.auditResult.count.mockResolvedValue(0);
      f.db.auditResult.findMany.mockResolvedValue([]);
      await f.svc.list({
        sortBy: 'foundAt',
        sortDir: 'desc',
        page: 1,
        pageSize: 20,
      });
      const [call] = f.db.auditResult.findMany.mock.calls;
      expect(call?.[0]?.where).toEqual({});
    });
  });

  describe('getById', () => {
    it('returns row when found', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(makeRow() as never);
      const res = await f.svc.getById('r1');
      expect(res.id).toBe('r1');
    });
    it('throws NotFoundError when not found', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(null);
      await expect(f.svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('create', () => {
    it('rejects when dueAt < foundAt', async () => {
      await expect(
        f.svc.create(
          {
            title: 'x',
            systemId: 's1',
            category: 'c',
            description: 'd',
            severity: 'HIGH',
            foundAt: new Date('2026-03-01'),
            dueAt: new Date('2026-02-01'),
            riskScore: 50,
          },
          ACTOR,
        ),
      ).rejects.toBeInstanceOf(ValidationError);
      expect(f.auditLog.record).not.toHaveBeenCalled();
    });

    it('creates and records audit log', async () => {
      const created = makeRow({ id: 'new', title: 'new' });
      f.db.auditResult.create.mockResolvedValue(created as never);
      const res = await f.svc.create(
        {
          title: 'new',
          systemId: 's1',
          category: 'c',
          description: 'd',
          severity: 'HIGH',
          foundAt: new Date('2026-03-01'),
          riskScore: 10,
        },
        ACTOR,
      );
      expect(res.id).toBe('new');
      expect(f.recorded()[0]).toMatchObject({
        entityType: 'AuditResult',
        entityId: 'new',
        action: 'create',
        actorId: ACTOR.id,
      });
    });
  });

  describe('updateStatus', () => {
    it('is a no-op when new status equals current, no log', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(makeRow({ status: 'NEW' }) as never);
      await f.svc.updateStatus('r1', { status: 'NEW' }, ACTOR);
      expect(f.db.auditResult.update).not.toHaveBeenCalled();
      expect(f.auditLog.record).not.toHaveBeenCalled();
    });

    it('sets resolvedAt when moving into CLOSED status, logs diff', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(
        makeRow({ status: 'IN_PROGRESS', resolvedAt: null }) as never,
      );
      f.db.auditResult.update.mockResolvedValue(
        makeRow({ status: 'RESOLVED', resolvedAt: new Date() }) as never,
      );
      await f.svc.updateStatus('r1', { status: 'RESOLVED' }, ACTOR);
      const call = f.db.auditResult.update.mock.calls[0]?.[0];
      expect(call?.data?.status).toBe('RESOLVED');
      expect(call?.data?.resolvedAt).toBeInstanceOf(Date);
      expect(f.recorded()[0]?.action).toBe('status_change');
      expect(f.recorded()[0]?.diff).toEqual({ status: ['IN_PROGRESS', 'RESOLVED'] });
    });

    it('clears resolvedAt when moving from CLOSED to OPEN status', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(
        makeRow({ status: 'RESOLVED', resolvedAt: new Date() }) as never,
      );
      f.db.auditResult.update.mockResolvedValue(
        makeRow({ status: 'IN_PROGRESS', resolvedAt: null }) as never,
      );
      await f.svc.updateStatus('r1', { status: 'IN_PROGRESS' }, ACTOR);
      const call = f.db.auditResult.update.mock.calls[0]?.[0];
      expect(call?.data?.resolvedAt).toBeNull();
    });

    it('throws NotFoundError if record is missing', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(null);
      await expect(f.svc.updateStatus('x', { status: 'NEW' }, ACTOR)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  describe('updateFields', () => {
    it('logs only fields that actually changed', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(
        makeRow({ description: 'old', category: 'cat', riskScore: 50 }) as never,
      );
      f.db.auditResult.update.mockResolvedValue(
        makeRow({ description: 'new', category: 'cat', riskScore: 50 }) as never,
      );
      await f.svc.updateFields('r1', { description: 'new' }, ACTOR);
      expect(f.recorded()[0]?.diff).toHaveProperty('description');
      expect(f.recorded()[0]?.diff).not.toHaveProperty('category');
      expect(f.recorded()[0]?.diff).not.toHaveProperty('riskScore');
    });

    it('does not record a log when nothing effectively changed', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(
        makeRow({ description: 'same', category: 'cat' }) as never,
      );
      f.db.auditResult.update.mockResolvedValue(
        makeRow({ description: 'same', category: 'cat' }) as never,
      );
      await f.svc.updateFields('r1', { description: 'same' }, ACTOR);
      expect(f.auditLog.record).not.toHaveBeenCalled();
    });

    it('rejects when dueAt < foundAt', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(
        makeRow({ foundAt: new Date('2026-03-01') }) as never,
      );
      await expect(
        f.svc.updateFields('r1', { dueAt: new Date('2026-02-01') }, ACTOR),
      ).rejects.toBeInstanceOf(ValidationError);
      expect(f.db.auditResult.update).not.toHaveBeenCalled();
    });
  });

  describe('changeSeverity', () => {
    it('no-op when severity equals current', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(makeRow({ severity: 'HIGH' }) as never);
      await f.svc.changeSeverity('r1', { severity: 'HIGH' }, ACTOR);
      expect(f.db.auditResult.update).not.toHaveBeenCalled();
    });

    it('updates and logs severity_change', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(makeRow({ severity: 'LOW' }) as never);
      f.db.auditResult.update.mockResolvedValue(makeRow({ severity: 'CRITICAL' }) as never);
      await f.svc.changeSeverity('r1', { severity: 'CRITICAL' }, ACTOR);
      expect(f.recorded()[0]?.action).toBe('severity_change');
      expect(f.recorded()[0]?.diff).toEqual({ severity: ['LOW', 'CRITICAL'] });
    });
  });

  describe('confirmFinal', () => {
    it('sets status=CONFIRMED and resolvedAt when absent', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(
        makeRow({ status: 'RESOLVED', resolvedAt: null }) as never,
      );
      f.db.auditResult.update.mockResolvedValue(
        makeRow({ status: 'CONFIRMED', resolvedAt: new Date() }) as never,
      );
      await f.svc.confirmFinal('r1', ACTOR);
      const call = f.db.auditResult.update.mock.calls[0]?.[0];
      expect(call?.data?.status).toBe('CONFIRMED');
      expect(call?.data?.resolvedAt).toBeInstanceOf(Date);
      expect(f.recorded()[0]?.action).toBe('confirm_final');
    });

    it('is idempotent on already-confirmed record', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(makeRow({ status: 'CONFIRMED' }) as never);
      await f.svc.confirmFinal('r1', ACTOR);
      expect(f.db.auditResult.update).not.toHaveBeenCalled();
    });
  });

  describe('addComment', () => {
    it('creates comment and logs comment_added', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(makeRow() as never);
      f.db.comment.create.mockResolvedValue({ id: 'c1' } as never);
      await f.svc.addComment('r1', { content: 'hey' }, ACTOR);
      expect(f.db.comment.create).toHaveBeenCalled();
      expect(f.recorded()[0]?.action).toBe('comment_added');
    });
  });

  describe('remove', () => {
    it('deletes and logs delete', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(makeRow() as never);
      f.db.auditResult.delete.mockResolvedValue(makeRow() as never);
      await f.svc.remove('r1', ACTOR);
      expect(f.db.auditResult.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
      expect(f.recorded()[0]?.action).toBe('delete');
    });
  });

  describe('listComments / distinctCategories', () => {
    it('listComments requires existing result', async () => {
      f.db.auditResult.findUnique.mockResolvedValue(null);
      await expect(f.svc.listComments('missing')).rejects.toBeInstanceOf(NotFoundError);
    });
    it('distinctCategories returns array of strings', async () => {
      f.db.auditResult.findMany.mockResolvedValue([{ category: 'A' }, { category: 'B' }] as never);
      const res = await f.svc.distinctCategories();
      expect(res).toEqual(['A', 'B']);
    });
  });
});

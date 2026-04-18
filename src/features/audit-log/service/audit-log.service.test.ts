import { beforeEach, describe, expect, it } from 'vitest';
import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@/generated/prisma/client';
import { makeAuditLogService, type AuditLogService } from './audit-log.service';

describe('audit-log service', () => {
  let db: DeepMockProxy<PrismaClient>;
  let svc: AuditLogService;

  beforeEach(() => {
    db = mockDeep<PrismaClient>();
    svc = makeAuditLogService({ db });
  });

  it('record() persists entry with flattened fields', async () => {
    db.auditLog.create.mockResolvedValue({ id: 'l1' } as never);
    await svc.record({
      entityType: 'AuditResult',
      entityId: 'r1',
      action: 'status_change',
      actorId: 'u1',
      diff: { status: ['NEW', 'IN_PROGRESS'] },
    });
    const call = db.auditLog.create.mock.calls[0]?.[0];
    expect(call?.data?.entityType).toBe('AuditResult');
    expect(call?.data?.entityId).toBe('r1');
    expect(call?.data?.action).toBe('status_change');
    expect(call?.data?.actorId).toBe('u1');
  });

  it('listForEntity() queries by entityType+entityId and orders desc', async () => {
    db.auditLog.findMany.mockResolvedValue([] as never);
    await svc.listForEntity('AuditResult', 'r1');
    const call = db.auditLog.findMany.mock.calls[0]?.[0];
    expect(call?.where).toEqual({ entityType: 'AuditResult', entityId: 'r1' });
    expect(call?.orderBy).toEqual({ createdAt: 'desc' });
    expect(call?.include).toBeDefined();
  });
});

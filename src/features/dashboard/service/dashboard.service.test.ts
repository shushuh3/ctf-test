import { beforeEach, describe, expect, it } from 'vitest';
import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@/generated/prisma/client';
import { makeDashboardService, type DashboardService } from './dashboard.service';

// Prisma 7 generates complex conditional types for groupBy; vitest-mock-extended
// cannot infer mockResolvedValueOnce from them. We cast the mock method to the
// minimal shape needed for chaining.
type ChainableMock = {
  mockResolvedValueOnce: (v: unknown) => ChainableMock;
};

describe('dashboard service', () => {
  let db: DeepMockProxy<PrismaClient>;
  let svc: DashboardService;
  beforeEach(() => {
    db = mockDeep<PrismaClient>();
    svc = makeDashboardService({ db });
  });

  it('getStats aggregates severity/status/system counts and dynamics buckets', async () => {
    (db.auditResult.groupBy as unknown as ChainableMock)
      .mockResolvedValueOnce([
        { severity: 'HIGH', _count: { _all: 5 } },
        { severity: 'LOW', _count: { _all: 2 } },
      ])
      .mockResolvedValueOnce([
        { status: 'NEW', _count: { _all: 3 } },
        { status: 'RESOLVED', _count: { _all: 4 } },
      ])
      .mockResolvedValueOnce([
        { systemId: 's1', _count: { _all: 10 } },
        { systemId: 's2', _count: { _all: 3 } },
      ]);

    const today = new Date();
    db.auditResult.findMany
      .mockResolvedValueOnce([{ foundAt: today }, { foundAt: today }] as never)
      .mockResolvedValueOnce([{ resolvedAt: today }] as never);

    db.auditResult.count.mockResolvedValue(7);

    db.system.findMany.mockResolvedValue([
      { id: 's1', name: 'System One' },
      { id: 's2', name: 'System Two' },
    ] as never);

    const stats = await svc.getStats(7);

    expect(stats.total).toBe(7);
    expect(stats.bySeverity).toEqual([
      { severity: 'HIGH', count: 5 },
      { severity: 'LOW', count: 2 },
    ]);
    expect(stats.byStatus).toEqual([
      { status: 'NEW', count: 3 },
      { status: 'RESOLVED', count: 4 },
    ]);
    expect(stats.bySystem[0]).toEqual({ system: 'System One', count: 10 });
    expect(stats.dynamics).toHaveLength(8); // 7 days + today
    const todaysBucket = stats.dynamics.find((d) => d.date === today.toISOString().slice(0, 10));
    expect(todaysBucket).toEqual({
      date: todaysBucket?.date,
      found: 2,
      resolved: 1,
    });
  });

  it('falls back to systemId when system name is missing', async () => {
    (db.auditResult.groupBy as unknown as ChainableMock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ systemId: 'orphan', _count: { _all: 1 } }]);
    db.auditResult.findMany.mockResolvedValue([] as never);
    db.auditResult.count.mockResolvedValue(1);
    db.system.findMany.mockResolvedValue([] as never);
    const stats = await svc.getStats(1);
    expect(stats.bySystem).toEqual([{ system: 'orphan', count: 1 }]);
  });
});

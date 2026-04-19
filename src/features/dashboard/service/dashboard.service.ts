import type { PrismaClient } from '@/generated/prisma/client';
import type { Severity, Status } from '@/generated/prisma/enums';

type Deps = { db: PrismaClient };

export type DashboardStats = {
  bySeverity: Array<{ severity: Severity; count: number }>;
  byStatus: Array<{ status: Status; count: number }>;
  bySystem: Array<{ system: string; count: number }>;
  byAssignee: Array<{ assignee: string; count: number }>;
  dynamics: Array<{ date: string; found: number; resolved: number }>;
  kpi: {
    total: number;
    critical: number;
    open: number; // NEW + IN_PROGRESS
    overdue: number; // dueAt < now AND не RESOLVED/CONFIRMED
    avgRisk: number;
  };
};

const DAY_MS = 24 * 60 * 60 * 1000;
const OPEN_STATUSES = ['NEW', 'IN_PROGRESS'] as const;

export function makeDashboardService({ db }: Deps) {
  return {
    async getStats(days = 30): Promise<DashboardStats> {
      const since = new Date(Date.now() - days * DAY_MS);
      since.setUTCHours(0, 0, 0, 0);
      const now = new Date();

      const [
        sevGroups,
        statGroups,
        sysCounts,
        assigneeCounts,
        foundRows,
        resolvedRows,
        total,
        criticalCount,
        openCount,
        overdueCount,
        avgRiskAgg,
      ] = await Promise.all([
        db.auditResult.groupBy({ by: ['severity'], _count: { _all: true } }),
        db.auditResult.groupBy({ by: ['status'], _count: { _all: true } }),
        db.auditResult.groupBy({
          by: ['systemId'],
          _count: { _all: true },
          orderBy: { _count: { systemId: 'desc' } },
          take: 10,
        }),
        db.auditResult.groupBy({
          by: ['assigneeId'],
          _count: { _all: true },
          where: { assigneeId: { not: null } },
          orderBy: { _count: { assigneeId: 'desc' } },
          take: 5,
        }),
        db.auditResult.findMany({
          where: { foundAt: { gte: since } },
          select: { foundAt: true },
        }),
        db.auditResult.findMany({
          where: { resolvedAt: { gte: since } },
          select: { resolvedAt: true },
        }),
        db.auditResult.count(),
        db.auditResult.count({ where: { severity: 'CRITICAL' } }),
        db.auditResult.count({ where: { status: { in: [...OPEN_STATUSES] } } }),
        db.auditResult.count({
          where: {
            dueAt: { lt: now },
            status: { notIn: ['RESOLVED', 'CONFIRMED', 'REJECTED'] },
          },
        }),
        db.auditResult.aggregate({ _avg: { riskScore: true } }),
      ]);

      // systems + assignees names
      const systemIds = sysCounts.map((r) => r.systemId);
      const assigneeIds = assigneeCounts
        .map((r) => r.assigneeId)
        .filter((id): id is string => !!id);

      const [systems, assignees] = await Promise.all([
        db.system.findMany({
          where: { id: { in: systemIds } },
          select: { id: true, name: true },
        }),
        db.user.findMany({
          where: { id: { in: assigneeIds } },
          select: { id: true, name: true },
        }),
      ]);
      const sysName = new Map(systems.map((s) => [s.id, s.name]));
      const userName = new Map(assignees.map((u) => [u.id, u.name]));

      const bySeverity = sevGroups.map((g) => ({
        severity: g.severity as Severity,
        count: g._count._all,
      }));
      const byStatus = statGroups.map((g) => ({
        status: g.status as Status,
        count: g._count._all,
      }));
      const bySystem = sysCounts.map((g) => ({
        system: sysName.get(g.systemId) ?? g.systemId,
        count: g._count._all,
      }));
      const byAssignee = assigneeCounts.map((g) => ({
        assignee: (g.assigneeId && userName.get(g.assigneeId)) ?? 'не назначен',
        count: g._count._all,
      }));

      // dynamics
      const buckets = new Map<string, { found: number; resolved: number }>();
      for (let i = 0; i <= days; i++) {
        const d = new Date(since.getTime() + i * DAY_MS);
        const key = d.toISOString().slice(0, 10);
        buckets.set(key, { found: 0, resolved: 0 });
      }
      for (const r of foundRows) {
        const key = new Date(r.foundAt).toISOString().slice(0, 10);
        const b = buckets.get(key);
        if (b) b.found++;
      }
      for (const r of resolvedRows) {
        if (!r.resolvedAt) continue;
        const key = new Date(r.resolvedAt).toISOString().slice(0, 10);
        const b = buckets.get(key);
        if (b) b.resolved++;
      }
      const dynamics = [...buckets.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, found: v.found, resolved: v.resolved }));

      return {
        bySeverity,
        byStatus,
        bySystem,
        byAssignee,
        dynamics,
        kpi: {
          total,
          critical: criticalCount,
          open: openCount,
          overdue: overdueCount,
          avgRisk: Math.round(avgRiskAgg._avg.riskScore ?? 0),
        },
      };
    },
  };
}

export type DashboardService = ReturnType<typeof makeDashboardService>;

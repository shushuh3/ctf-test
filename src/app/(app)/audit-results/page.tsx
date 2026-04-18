import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import { ListQuerySchema } from '@/features/audit-results/schemas';
import { AuditResultsFilters } from '@/features/audit-results/ui/filters';
import { AuditResultsTable } from '@/features/audit-results/ui/results-table';
import { Pagination } from '@/features/audit-results/ui/pagination';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function flatten(raw: Record<string, string | string[] | undefined>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined) continue;
    out[k] = Array.isArray(v) ? (v[0] ?? '') : v;
  }
  return out;
}

export default async function AuditResultsPage({ searchParams }: PageProps) {
  await requireAction('auditResults.list');

  const raw = flatten(await searchParams);
  const query = ListQuerySchema.parse(raw);

  const [{ items, total, page, pageSize }, systems, assignees, categories] = await Promise.all([
    container.auditResults.list(query),
    container.db.system.findMany({ orderBy: { name: 'asc' } }),
    container.db.user.findMany({
      where: { isActive: true, role: { in: ['L1', 'L2', 'L3'] } },
      orderBy: { name: 'asc' },
    }),
    container.auditResults.distinctCategories(),
  ]);

  const baseParams = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) {
    if (v && k !== 'page') baseParams.set(k, String(v));
  }
  const buildHref = (p: number) => {
    const copy = new URLSearchParams(baseParams);
    copy.set('page', String(p));
    return `/audit-results?${copy.toString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Результаты аудитов</h1>
        <span className="text-sm text-neutral-500">Найдено: {total}</span>
      </div>

      <AuditResultsFilters
        systems={systems.map((s) => ({ id: s.id, label: s.name }))}
        assignees={assignees.map((a) => ({ id: a.id, label: a.name }))}
        categories={categories}
      />

      <AuditResultsTable rows={items} />

      <Pagination page={page} pageSize={pageSize} total={total} buildHref={buildHref} />
    </div>
  );
}

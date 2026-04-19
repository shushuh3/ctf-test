import { ChevronRight, Download } from 'lucide-react';
import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import { ListQuerySchema } from '@/features/audit-results/schemas';
import { ClickableRow } from '@/shared/design/clickable-row';
import { SeverityChip, StatusChip } from '@/shared/design/chips';
import { AuditResultsFilters } from '@/features/audit-results/ui/filters';

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

function fmtDateParts(d: Date) {
  const iso = new Date(d).toISOString();
  const date = new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  const time = iso.slice(11, 16);
  return { date, time };
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

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
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
    <div className="stack-lg">
      <div className="page-head">
        <div className="head-left">
          <h1>Результаты аудитов</h1>
          <div className="subtle">
            Найдено: {total}. Страница {page} из {totalPages}.
          </div>
        </div>
        <div className="head-actions">
          <button type="button" className="pill" disabled>
            <Download size={14} /> Экспорт
          </button>
        </div>
      </div>

      <AuditResultsFilters
        systems={systems.map((s) => ({ id: s.id, label: s.name }))}
        assignees={assignees.map((a) => ({ id: a.id, label: a.name }))}
        categories={categories}
      />

      <div className="surface">
        <table className="aud">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>Обнаружено</th>
              <th style={{ width: '34%' }}>Заголовок</th>
              <th style={{ width: '14%' }}>Система</th>
              <th>Критичность</th>
              <th>Статус</th>
              <th>Ответственный</th>
              <th className="col-right">Риск</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: 'center', color: 'var(--text-meta)', padding: 40 }}
                >
                  Ничего не найдено. Попробуйте изменить фильтры.
                </td>
              </tr>
            )}
            {items.map((r) => {
              const found = fmtDateParts(r.foundAt);
              return (
                <ClickableRow key={r.id} href={`/audit-results/${r.id}`}>
                  <td>
                    <div className="row-title">{found.date}</div>
                    <div className="row-meta">в {found.time}</div>
                  </td>
                  <td>
                    <div className="row-title">{r.title}</div>
                    <div className="row-meta">{r.category}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.system.name}</td>
                  <td>
                    <SeverityChip value={r.severity} />
                  </td>
                  <td>
                    <StatusChip value={r.status} />
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.assignee?.name ?? '—'}</td>
                  <td className="col-right">
                    <span className="num">{r.riskScore}</span>
                    <span className="row-arrow">
                      <ChevronRight size={15} />
                    </span>
                  </td>
                </ClickableRow>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row" style={{ paddingTop: 4 }}>
        <span className="label-micro">
          Страница {page} из {totalPages}
        </span>
        <span style={{ flex: 1 }} />
        <a className="pill" href={buildHref(Math.max(1, page - 1))} aria-disabled={page <= 1}>
          ← Назад
        </a>
        <a
          className="pill"
          href={buildHref(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
        >
          Вперёд →
        </a>
      </div>
    </div>
  );
}

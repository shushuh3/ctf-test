import Link from 'next/link';
import { ChevronRight, Filter } from 'lucide-react';
import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import { ListQuerySchema } from '@/features/audit-results/schemas';
import { ClickableRow } from '../_components/clickable-row';

const SEVERITY_LABEL: Record<string, string> = {
  LOW: 'Низкая',
  MEDIUM: 'Средняя',
  HIGH: 'Высокая',
  CRITICAL: 'Критическая',
};
const STATUS_LABEL: Record<string, string> = {
  NEW: 'Новый',
  IN_PROGRESS: 'В работе',
  RESOLVED: 'Решён',
  REJECTED: 'Отклонён',
  CONFIRMED: 'Подтверждён',
};

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
  const date = new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = iso.slice(11, 16);
  return { date, time };
}

export default async function PreviewListPage({ searchParams }: PageProps) {
  await requireAction('auditResults.list');
  const raw = flatten(await searchParams);
  const query = ListQuerySchema.parse({ ...raw, pageSize: '15' });
  const { items, total } = await container.auditResults.list(query);

  const critical = items.filter((r) => r.severity === 'CRITICAL').length;
  const inProgress = items.filter((r) => r.status === 'IN_PROGRESS').length;

  return (
    <>
      <nav className="crumbs" aria-label="breadcrumbs">
        <Link href="/preview/audit-results">Аналитика</Link>
        <span className="sep">/</span>
        <span className="current">Результаты аудитов</span>
      </nav>

      <div className="page-head">
        <div className="head-left">
          <h1>Результаты аудитов</h1>
          <span className="subtle">
            Показано {items.length} из {total}
          </span>
        </div>
        <div className="head-actions">
          <button type="button" className="pill">
            <Filter size={14} />
            Фильтры
          </button>
        </div>
      </div>

      <div className="summary-line">
        <span>
          Критических<strong>{critical}</strong>
        </span>
        <span>
          В работе<strong>{inProgress}</strong>
        </span>
        <span>
          Всего<strong>{total}</strong>
        </span>
      </div>

      <div className="surface">
        <table className="aud">
          <thead>
            <tr>
              <th style={{ width: '13%' }}>Обнаружено</th>
              <th style={{ width: '34%' }}>Заголовок</th>
              <th style={{ width: '13%' }}>Система</th>
              <th>Критичность</th>
              <th>Статус</th>
              <th>Ответственный</th>
              <th className="col-right">Риск</th>
            </tr>
          </thead>
          <tbody>
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
                    <span className={`sev-chip sev-${r.severity}`}>
                      <span className="d" />
                      {SEVERITY_LABEL[r.severity]}
                    </span>
                  </td>
                  <td>
                    <span className={`st-chip st-${r.status}`}>
                      <span className="d" />
                      {STATUS_LABEL[r.status]}
                    </span>
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

      <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span className="label-micro">Страница 1 из {Math.max(1, Math.ceil(total / 15))}</span>
        <span style={{ flex: 1 }} />
        <button type="button" className="pill" disabled>
          ← Назад
        </button>
        <button type="button" className="pill">
          Вперёд →
        </button>
      </div>
    </>
  );
}

import { Filter } from 'lucide-react';
import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import { ListQuerySchema } from '@/features/audit-results/schemas';

const SEVERITY_LABEL: Record<string, string> = {
  LOW: 'Низкая',
  MEDIUM: 'Средняя',
  HIGH: 'Высокая',
  CRITICAL: 'Критич.',
};
const STATUS_LABEL: Record<string, string> = {
  NEW: 'Новый',
  IN_PROGRESS: 'В работе',
  RESOLVED: 'Решён',
  REJECTED: 'Отклонён',
  CONFIRMED: 'Подтв.',
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

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Результаты аудитов</h1>
          <div className="subtle">
            Показано {items.length} из {total}. Данные — из основной БД, те же что и в&nbsp;
            <code>/audit-results</code>.
          </div>
        </div>
        <button type="button" className="pill">
          <Filter size={14} />
          Фильтры
        </button>
      </div>

      <div className="surface">
        <table className="aud">
          <thead>
            <tr>
              <th style={{ width: '14%' }}>Обнаружено</th>
              <th style={{ width: '32%' }}>Заголовок</th>
              <th style={{ width: '14%' }}>Система</th>
              <th>Критичность</th>
              <th>Статус</th>
              <th>Ответственный</th>
              <th style={{ textAlign: 'right' }}>Риск</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const found = fmtDateParts(r.foundAt);
              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{found.date}</div>
                    <div style={{ color: 'var(--text-meta)', fontSize: 12, marginTop: 2 }}>
                      в {found.time}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.title}</div>
                    <div
                      className="label-micro"
                      style={{
                        marginTop: 4,
                        textTransform: 'none',
                        letterSpacing: 0,
                        fontSize: 11,
                      }}
                    >
                      {r.category}
                    </div>
                  </td>
                  <td>{r.system.name}</td>
                  <td>
                    <span className={`dot sev-${r.severity}`} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}>
                      {SEVERITY_LABEL[r.severity]}
                    </span>
                  </td>
                  <td>
                    <span className={`dot st-${r.status}`} />
                    <span
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {r.assignee?.name ?? <span className="label-micro">auto</span>}
                  </td>
                  <td className="num" style={{ textAlign: 'right', fontSize: 15 }}>
                    {r.riskScore}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <span className="pill pill-ghost">
          <span className="label-micro">Всего</span>
          <strong className="num" style={{ marginLeft: 6 }}>
            {total}
          </strong>
        </span>
        <span className="pill pill-ghost">
          <span className="label-micro">Страница 1 из {Math.max(1, Math.ceil(total / 15))}</span>
        </span>
      </div>
    </>
  );
}

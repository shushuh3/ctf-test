import { ChevronRight, Download, Filter, Plus } from 'lucide-react';
import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import { ListQuerySchema } from '@/features/audit-results/schemas';
import { ClickableRow } from '../_components/clickable-row';

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

// Стабильный хэш-цвет для категории
const CATEGORY_COLORS = ['c-purple', 'c-blue', 'c-pink', 'c-green', 'c-navy', 'c-orange'] as const;
function colorFor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return CATEGORY_COLORS[Math.abs(h) % CATEGORY_COLORS.length];
}

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
      <div className="page-head">
        <div>
          <h1>Результаты аудитов</h1>
          <div className="subtle">
            Показано {items.length} из {total}. Клик по строке открывает карточку&nbsp;
            <code>/audit-results/:id</code>.
          </div>
        </div>

        <div className="head-actions">
          <button type="button" className="pill">
            <Download size={14} />
            Экспорт
          </button>
          <button type="button" className="pill">
            <Filter size={14} />
            Фильтры
          </button>
          <button type="button" className="pill pill-accent">
            <Plus size={14} />
            Создать
          </button>
        </div>
      </div>

      <div className="summary">
        <span className="chip c-orange">
          <span className="chip-dot" />
          Критичных: {critical}
        </span>
        <span className="chip c-blue">
          <span className="chip-dot" />В работе: {inProgress}
        </span>
        <span className="chip c-gray">
          <span className="chip-dot" />
          Всего: {total}
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
              <th style={{ textAlign: 'right' }}>Риск</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const found = fmtDateParts(r.foundAt);
              return (
                <ClickableRow key={r.id} href={`/audit-results/${r.id}`}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{found.date}</div>
                    <div style={{ color: 'var(--text-meta)', fontSize: 12.5, marginTop: 3 }}>
                      в {found.time}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--text-primary)' }}>
                      {r.title}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <span className={`chip ${colorFor(r.category)}`}>
                        <span className="chip-dot" />
                        {r.category}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{r.system.name}</td>
                  <td>
                    <span className={`sev-badge sev-${r.severity}`}>
                      <span className="dot" />
                      {SEVERITY_LABEL[r.severity]}
                    </span>
                  </td>
                  <td>
                    <span className={`st-badge st-${r.status}`}>
                      <span className="dot" />
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    {r.assignee?.name ?? <span className="label-micro">auto</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="num-big">{r.riskScore}</span>
                    <span className="row-arrow">
                      <ChevronRight size={16} />
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

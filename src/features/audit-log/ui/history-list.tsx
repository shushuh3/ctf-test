type Entry = {
  id: string;
  action: string;
  actor: { id: string; name: string; role: string } | null;
  diff: unknown;
  createdAt: Date;
};

const ACTION_LABEL: Record<string, string> = {
  create: 'Создание',
  update: 'Изменение полей',
  delete: 'Удаление',
  status_change: 'Смена статуса',
  severity_change: 'Смена критичности',
  confirm_final: 'Финальное подтверждение',
  comment_added: 'Добавлен комментарий',
  role_change: 'Смена роли',
  active_change: 'Блокировка/разблокировка',
};

const fmtDateTime = (d: Date) => new Date(d).toISOString().replace('T', ' ').slice(0, 16);

export function HistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p style={{ color: 'var(--text-meta)', fontSize: 13 }}>История пуста.</p>;
  }
  return (
    <div>
      {entries.map((e) => (
        <div key={e.id} className="hist-row">
          <div className="meta-line">
            <span className="author">{ACTION_LABEL[e.action] ?? e.action}</span> ·{' '}
            {e.actor ? (
              <>
                {e.actor.name}{' '}
                <span style={{ fontFamily: 'ui-monospace, monospace' }}>{e.actor.role}</span>
              </>
            ) : (
              '—'
            )}{' '}
            ·{' '}
            <span className="num" style={{ fontWeight: 500 }}>
              {fmtDateTime(e.createdAt)}
            </span>
          </div>
          <DiffView diff={e.diff} />
        </div>
      ))}
    </div>
  );
}

function DiffView({ diff }: { diff: unknown }) {
  if (!diff || typeof diff !== 'object') return null;
  const entries = Object.entries(diff as Record<string, unknown>);
  if (entries.length === 0) return null;
  return (
    <dl
      style={{
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11.5,
        color: 'var(--text-secondary)',
      }}
    >
      {entries.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: 8 }}>
          <dt style={{ color: 'var(--text-meta)' }}>{k}:</dt>
          <dd>
            {Array.isArray(v) && v.length === 2
              ? `${renderValue(v[0])} → ${renderValue(v[1])}`
              : JSON.stringify(v)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return '∅';
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

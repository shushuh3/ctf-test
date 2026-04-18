import { Separator } from '@/components/ui/separator';

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
};

const fmtDateTime = (d: Date) => new Date(d).toISOString().replace('T', ' ').slice(0, 16);

export function HistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-neutral-500">История пуста.</p>;
  }
  return (
    <ul className="space-y-3">
      {entries.map((e) => (
        <li key={e.id} className="space-y-1">
          <div className="text-xs text-neutral-500">
            <span className="font-medium text-neutral-800">
              {ACTION_LABEL[e.action] ?? e.action}
            </span>
            {' · '}
            {e.actor ? (
              <>
                <span className="text-neutral-700">{e.actor.name}</span>{' '}
                <span className="font-mono">{e.actor.role}</span>
              </>
            ) : (
              <span>—</span>
            )}
            {' · '}
            <span className="tabular-nums">{fmtDateTime(e.createdAt)}</span>
          </div>
          <DiffView diff={e.diff} />
          <Separator />
        </li>
      ))}
    </ul>
  );
}

function DiffView({ diff }: { diff: unknown }) {
  if (!diff || typeof diff !== 'object') return null;
  const entries = Object.entries(diff as Record<string, unknown>);
  if (entries.length === 0) return null;
  return (
    <dl className="ml-1 space-y-0.5 text-xs text-neutral-600">
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <dt className="font-mono text-neutral-500">{k}:</dt>
          <dd className="font-mono">
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

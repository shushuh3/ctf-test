'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Severity, Status } from '@/generated/prisma/enums';
import { SEVERITY_LABEL, STATUS_LABEL } from '@/shared/design/chips';

type Option = { id: string; label: string };
type Props = {
  systems: Option[];
  assignees: Option[];
  categories: string[];
};

const ANY = '';

export function AuditResultsFilters({ systems, assignees, categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = {
    search: searchParams.get('search') ?? '',
    severity: searchParams.get('severity') ?? '',
    status: searchParams.get('status') ?? '',
    systemId: searchParams.get('systemId') ?? '',
    assigneeId: searchParams.get('assigneeId') ?? '',
    category: searchParams.get('category') ?? '',
    foundFrom: searchParams.get('foundFrom') ?? '',
    foundTo: searchParams.get('foundTo') ?? '',
  };

  function apply(formData: FormData) {
    const params = new URLSearchParams();
    for (const [k, v] of formData.entries()) {
      const value = String(v);
      if (!value) continue;
      params.set(k, value);
    }
    const sortBy = searchParams.get('sortBy');
    const sortDir = searchParams.get('sortDir');
    if (sortBy) params.set('sortBy', sortBy);
    if (sortDir) params.set('sortDir', sortDir);
    startTransition(() => router.push(`/audit-results?${params.toString()}`));
  }

  function reset() {
    startTransition(() => router.push('/audit-results'));
  }

  return (
    <form action={apply} className="surface surface-padded">
      <div className="grid-3">
        <div className="field">
          <label htmlFor="search">Поиск</label>
          <input
            id="search"
            name="search"
            placeholder="название, описание"
            defaultValue={current.search}
          />
        </div>
        <div className="field">
          <label>Критичность</label>
          <select name="severity" defaultValue={current.severity || ANY}>
            <option value="">любая</option>
            {Object.values(Severity).map((s) => (
              <option key={s} value={s}>
                {SEVERITY_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Статус</label>
          <select name="status" defaultValue={current.status || ANY}>
            <option value="">любой</option>
            {Object.values(Status).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Система</label>
          <select name="systemId" defaultValue={current.systemId || ANY}>
            <option value="">любая</option>
            {systems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Ответственный</label>
          <select name="assigneeId" defaultValue={current.assigneeId || ANY}>
            <option value="">любой</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Категория</label>
          <select name="category" defaultValue={current.category || ANY}>
            <option value="">любая</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="foundFrom">Обнаружено с</label>
          <input id="foundFrom" name="foundFrom" type="date" defaultValue={current.foundFrom} />
        </div>
        <div className="field">
          <label htmlFor="foundTo">Обнаружено по</label>
          <input id="foundTo" name="foundTo" type="date" defaultValue={current.foundTo} />
        </div>
        <div className="field" style={{ justifyContent: 'flex-end' }}>
          <label style={{ visibility: 'hidden' }}>actions</label>
          <div className="row">
            <button type="submit" className="pill pill-accent" disabled={pending}>
              Применить
            </button>
            <button type="button" className="pill" onClick={reset} disabled={pending}>
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

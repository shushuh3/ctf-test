'use client';

import { ChevronDown, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { Severity, Status } from '@/generated/prisma/enums';
import { SEVERITY_LABEL, STATUS_LABEL } from '@/shared/design/chips';
import { Dropdown, type DropdownOption } from '@/shared/design/dropdown';
import { DatePicker } from '@/shared/design/date-picker';

type Option = { id: string; label: string };
type Props = {
  systems: Option[];
  assignees: Option[];
  categories: string[];
};

const severityOptions: DropdownOption[] = [
  { value: '', label: 'Любая' },
  ...Object.values(Severity).map((s) => ({ value: s, label: SEVERITY_LABEL[s] })),
];
const statusOptions: DropdownOption[] = [
  { value: '', label: 'Любой' },
  ...Object.values(Status).map((s) => ({ value: s, label: STATUS_LABEL[s] })),
];

export function AuditResultsFilters({ systems, assignees, categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const initialOpen = useMemo(() => {
    for (const k of [
      'severity',
      'status',
      'systemId',
      'assigneeId',
      'category',
      'search',
      'foundFrom',
      'foundTo',
    ]) {
      if (searchParams.get(k)) return true;
    }
    return false;
  }, [searchParams]);
  const [open, setOpen] = useState(initialOpen);

  const initial = {
    search: searchParams.get('search') ?? '',
    severity: searchParams.get('severity') ?? '',
    status: searchParams.get('status') ?? '',
    systemId: searchParams.get('systemId') ?? '',
    assigneeId: searchParams.get('assigneeId') ?? '',
    category: searchParams.get('category') ?? '',
    foundFrom: searchParams.get('foundFrom') ?? '',
    foundTo: searchParams.get('foundTo') ?? '',
  };

  const [state, setState] = useState(initial);
  const set = <K extends keyof typeof initial>(k: K, v: string) =>
    setState((p) => ({ ...p, [k]: v }));

  const activeCount = Object.values(initial).filter(Boolean).length;

  const systemOptions: DropdownOption[] = [
    { value: '', label: 'Любая' },
    ...systems.map((s) => ({ value: s.id, label: s.label })),
  ];
  const assigneeOptions: DropdownOption[] = [
    { value: '', label: 'Любой' },
    ...assignees.map((a) => ({ value: a.id, label: a.label })),
  ];
  const categoryOptions: DropdownOption[] = [
    { value: '', label: 'Любая' },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(state)) {
      if (v) params.set(k, v);
    }
    const sortBy = searchParams.get('sortBy');
    const sortDir = searchParams.get('sortDir');
    if (sortBy) params.set('sortBy', sortBy);
    if (sortDir) params.set('sortDir', sortDir);
    startTransition(() => router.push(`/audit-results?${params.toString()}`));
  }

  function reset() {
    setState({
      search: '',
      severity: '',
      status: '',
      systemId: '',
      assigneeId: '',
      category: '',
      foundFrom: '',
      foundTo: '',
    });
    startTransition(() => router.push('/audit-results'));
  }

  return (
    <div className="surface surface-clip">
      <button
        type="button"
        className="filters-toggle"
        data-open={open || undefined}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="row">
          <Filter size={14} />
          Фильтры
          {activeCount > 0 && <span className="count">{activeCount}</span>}
        </span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <form onSubmit={apply} className="filters-body">
          <div className="grid-3">
            <div className="field">
              <label htmlFor="search">Поиск</label>
              <input
                id="search"
                value={state.search}
                onChange={(e) => set('search', e.target.value)}
                placeholder="название, описание"
              />
            </div>
            <div className="field">
              <label>Критичность</label>
              <Dropdown
                value={state.severity}
                onChange={(v) => set('severity', v)}
                options={severityOptions}
                ariaLabel="Критичность"
              />
            </div>
            <div className="field">
              <label>Статус</label>
              <Dropdown
                value={state.status}
                onChange={(v) => set('status', v)}
                options={statusOptions}
                ariaLabel="Статус"
              />
            </div>
            <div className="field">
              <label>Система</label>
              <Dropdown
                value={state.systemId}
                onChange={(v) => set('systemId', v)}
                options={systemOptions}
                ariaLabel="Система"
              />
            </div>
            <div className="field">
              <label>Ответственный</label>
              <Dropdown
                value={state.assigneeId}
                onChange={(v) => set('assigneeId', v)}
                options={assigneeOptions}
                ariaLabel="Ответственный"
              />
            </div>
            <div className="field">
              <label>Категория</label>
              <Dropdown
                value={state.category}
                onChange={(v) => set('category', v)}
                options={categoryOptions}
                ariaLabel="Категория"
              />
            </div>
            <div className="field">
              <label>Обнаружено с</label>
              <DatePicker
                value={state.foundFrom}
                onChange={(v) => set('foundFrom', v)}
                ariaLabel="Обнаружено с"
              />
            </div>
            <div className="field">
              <label>Обнаружено по</label>
              <DatePicker
                value={state.foundTo}
                onChange={(v) => set('foundTo', v)}
                ariaLabel="Обнаружено по"
              />
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
      )}
    </div>
  );
}

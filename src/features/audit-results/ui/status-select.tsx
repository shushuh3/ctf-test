'use client';

import { useState, useTransition } from 'react';
import { Status } from '@/generated/prisma/enums';
import { STATUS_LABEL } from '@/shared/design/chips';
import { Dropdown, type DropdownOption } from '@/shared/design/dropdown';
import { updateStatusAction } from '@/app/(app)/audit-results/[id]/actions';

const options: DropdownOption[] = Object.values(Status).map((s) => ({
  value: s,
  label: STATUS_LABEL[s],
}));

export function StatusSelect({ id, current }: { id: string; current: Status }) {
  const [value, setValue] = useState<Status>(current);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    const fd = new FormData();
    fd.set('status', value);
    startTransition(async () => {
      const res = await updateStatusAction(id, fd);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="stack-sm">
      <div className="row">
        <div style={{ width: 200 }}>
          <Dropdown
            value={value}
            onChange={(v) => setValue(v as Status)}
            options={options}
            ariaLabel="Статус"
            disabled={pending}
          />
        </div>
        <button
          type="button"
          className="pill pill-accent"
          onClick={submit}
          disabled={pending || value === current}
        >
          {pending ? '…' : 'Сохранить'}
        </button>
      </div>
      {error && <p style={{ color: '#9c2a15', fontSize: 12 }}>{error}</p>}
    </div>
  );
}

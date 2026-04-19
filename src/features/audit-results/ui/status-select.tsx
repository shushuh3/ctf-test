'use client';

import { useState, useTransition } from 'react';
import { Status } from '@/generated/prisma/enums';
import { STATUS_LABEL } from '@/shared/design/chips';
import { updateStatusAction } from '@/app/(app)/audit-results/[id]/actions';

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
        <div className="field" style={{ width: 180 }}>
          <select
            value={value}
            onChange={(e) => setValue(e.target.value as Status)}
            disabled={pending}
          >
            {Object.values(Status).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
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

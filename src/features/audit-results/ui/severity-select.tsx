'use client';

import { useState, useTransition } from 'react';
import { Severity } from '@/generated/prisma/enums';
import { SEVERITY_LABEL } from '@/shared/design/chips';
import { changeSeverityAction } from '@/app/(app)/audit-results/[id]/actions';

export function SeveritySelect({ id, current }: { id: string; current: Severity }) {
  const [value, setValue] = useState<Severity>(current);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    const fd = new FormData();
    fd.set('severity', value);
    startTransition(async () => {
      const res = await changeSeverityAction(id, fd);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="stack-sm">
      <div className="row">
        <div className="field" style={{ width: 180 }}>
          <select
            value={value}
            onChange={(e) => setValue(e.target.value as Severity)}
            disabled={pending}
          >
            {Object.values(Severity).map((s) => (
              <option key={s} value={s}>
                {SEVERITY_LABEL[s]}
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

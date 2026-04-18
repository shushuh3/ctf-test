'use client';

import { useState, useTransition } from 'react';
import { Severity } from '@/generated/prisma/enums';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SEVERITY_LABEL } from './badges';
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={(v) => setValue(v as Severity)} disabled={pending}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Severity).map((s) => (
              <SelectItem key={s} value={s}>
                {SEVERITY_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={submit} disabled={pending || value === current} size="sm">
          {pending ? '...' : 'Сохранить'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

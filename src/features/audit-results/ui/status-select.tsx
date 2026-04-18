'use client';

import { useState, useTransition } from 'react';
import { Status } from '@/generated/prisma/enums';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { STATUS_LABEL } from './badges';
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={(v) => setValue(v as Status)} disabled={pending}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Status).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
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

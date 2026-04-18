'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { confirmFinalAction } from '@/app/(app)/audit-results/[id]/actions';

export function ConfirmButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await confirmFinalAction(id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button type="button" onClick={onClick} disabled={pending || disabled} size="sm">
        {pending ? 'Подтверждаем…' : 'Подтвердить финальное решение'}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

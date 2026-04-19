'use client';

import { useState, useTransition } from 'react';
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
    <div className="stack-sm">
      <button
        type="button"
        className="pill pill-accent"
        onClick={onClick}
        disabled={pending || disabled}
      >
        {pending ? 'Подтверждаем…' : 'Подтвердить финальное решение'}
      </button>
      {error && <p style={{ color: '#9c2a15', fontSize: 12 }}>{error}</p>}
    </div>
  );
}

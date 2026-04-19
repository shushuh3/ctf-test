'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

const PRESETS = [
  { days: 7, label: '7 дней' },
  { days: 30, label: '30 дней' },
  { days: 90, label: '90 дней' },
  { days: 180, label: '180 дней' },
] as const;

export function PeriodSwitcher({ current }: { current: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function set(days: number) {
    const p = new URLSearchParams(searchParams);
    p.set('days', String(days));
    startTransition(() => router.push(`/dashboard?${p.toString()}`));
  }

  return (
    <div className="tabs" role="tablist" aria-label="Период">
      {PRESETS.map((p) => (
        <button
          key={p.days}
          type="button"
          role="tab"
          aria-selected={current === p.days}
          data-active={current === p.days}
          className="tab"
          onClick={() => set(p.days)}
          disabled={pending}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

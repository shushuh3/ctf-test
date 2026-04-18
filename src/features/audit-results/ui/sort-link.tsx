'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type SortField = 'foundAt' | 'dueAt' | 'severity' | 'status' | 'riskScore' | 'createdAt';

export function SortLink({ field, children }: { field: SortField; children: React.ReactNode }) {
  const params = useSearchParams();
  const activeField = params.get('sortBy') ?? 'foundAt';
  const activeDir = params.get('sortDir') ?? 'desc';

  const next = new URLSearchParams(params);
  if (activeField === field) {
    next.set('sortDir', activeDir === 'asc' ? 'desc' : 'asc');
  } else {
    next.set('sortBy', field);
    next.set('sortDir', 'desc');
  }

  const arrow = activeField === field ? (activeDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <Link
      href={`/audit-results?${next.toString()}`}
      className="cursor-pointer hover:text-neutral-900"
    >
      {children}
      {arrow}
    </Link>
  );
}

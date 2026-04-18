import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Props = {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
};

export function Pagination({ page, pageSize, total, buildHref }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm text-neutral-600">
      <div>
        Всего: <span className="font-medium text-neutral-900">{total}</span>. Страница {page} из{' '}
        {totalPages}.
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" disabled={page <= 1}>
          <Link href={buildHref(prev)} aria-disabled={page <= 1}>
            ← Назад
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
          <Link href={buildHref(next)} aria-disabled={page >= totalPages}>
            Вперёд →
          </Link>
        </Button>
      </div>
    </div>
  );
}

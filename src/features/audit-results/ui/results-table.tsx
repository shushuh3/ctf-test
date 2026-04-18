import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Severity, Status } from '@/generated/prisma/enums';
import { SeverityBadge, StatusBadge } from './badges';
import { SortLink } from './sort-link';

type Row = {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  status: Status;
  assigneeId: string | null;
  foundAt: Date;
  dueAt: Date | null;
  riskScore: number;
  system: { id: string; name: string };
  assignee: { id: string; name: string } | null;
};

const fmtDate = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : '—');

export function AuditResultsTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
        Ничего не найдено. Попробуйте изменить фильтры.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[36%]">Заголовок</TableHead>
            <TableHead>Система</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>
              <SortLink field="severity">Крит.</SortLink>
            </TableHead>
            <TableHead>
              <SortLink field="status">Статус</SortLink>
            </TableHead>
            <TableHead>Ответственный</TableHead>
            <TableHead>
              <SortLink field="foundAt">Обнаружено</SortLink>
            </TableHead>
            <TableHead>
              <SortLink field="dueAt">Срок</SortLink>
            </TableHead>
            <TableHead className="text-right">
              <SortLink field="riskScore">Риск</SortLink>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                <Link href={`/audit-results/${r.id}`} className="hover:underline">
                  {r.title}
                </Link>
              </TableCell>
              <TableCell className="text-sm">{r.system.name}</TableCell>
              <TableCell className="text-sm">{r.category}</TableCell>
              <TableCell>
                <SeverityBadge value={r.severity} />
              </TableCell>
              <TableCell>
                <StatusBadge value={r.status} />
              </TableCell>
              <TableCell className="text-sm">{r.assignee?.name ?? '—'}</TableCell>
              <TableCell className="text-sm tabular-nums">{fmtDate(r.foundAt)}</TableCell>
              <TableCell className="text-sm tabular-nums">{fmtDate(r.dueAt)}</TableCell>
              <TableCell className="text-right text-sm tabular-nums">{r.riskScore}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

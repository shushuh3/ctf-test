import { Badge } from '@/components/ui/badge';
import type { Severity, Status } from '@/generated/prisma/enums';

const SEVERITY_LABEL: Record<Severity, string> = {
  LOW: 'Низкая',
  MEDIUM: 'Средняя',
  HIGH: 'Высокая',
  CRITICAL: 'Критическая',
};

const SEVERITY_TONE: Record<Severity, string> = {
  LOW: 'bg-neutral-100 text-neutral-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const STATUS_LABEL: Record<Status, string> = {
  NEW: 'Новый',
  IN_PROGRESS: 'В работе',
  RESOLVED: 'Решён',
  REJECTED: 'Отклонён',
  CONFIRMED: 'Подтверждён',
};

const STATUS_TONE: Record<Status, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-neutral-200 text-neutral-700',
  CONFIRMED: 'bg-green-200 text-green-900',
};

export function SeverityBadge({ value }: { value: Severity }) {
  return (
    <Badge variant="outline" className={SEVERITY_TONE[value]}>
      {SEVERITY_LABEL[value]}
    </Badge>
  );
}

export function StatusBadge({ value }: { value: Status }) {
  return (
    <Badge variant="outline" className={STATUS_TONE[value]}>
      {STATUS_LABEL[value]}
    </Badge>
  );
}

export { SEVERITY_LABEL, STATUS_LABEL };

import type { Severity, Status } from '@/generated/prisma/enums';

export const SEVERITY_LABEL: Record<Severity, string> = {
  LOW: 'Низкая',
  MEDIUM: 'Средняя',
  HIGH: 'Высокая',
  CRITICAL: 'Критич.',
};

export const STATUS_LABEL: Record<Status, string> = {
  NEW: 'Новый',
  IN_PROGRESS: 'В работе',
  RESOLVED: 'Решён',
  REJECTED: 'Отклонён',
  CONFIRMED: 'Подтв.',
};

export function SeverityChip({ value }: { value: Severity }) {
  return (
    <span className={`sev-chip sev-${value}`}>
      <span className="d" />
      {SEVERITY_LABEL[value]}
    </span>
  );
}

export function StatusChip({ value }: { value: Status }) {
  return (
    <span className={`st-chip st-${value}`}>
      <span className="d" />
      {STATUS_LABEL[value]}
    </span>
  );
}

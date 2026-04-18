import { z } from 'zod';

export const SlaInputSchema = z.object({
  foundAt: z.coerce.date(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  normativeDays: z.number().int().min(1).max(365),
  now: z.coerce.date().optional(),
});
export type SlaInput = z.infer<typeof SlaInputSchema>;

export type SlaStatus = 'ON_TIME' | 'AT_RISK' | 'OVERDUE';
export type SlaResult = {
  deadline: string; // ISO UTC
  overdueDays: number;
  remainingDays: number;
  status: SlaStatus;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function calcSla(input: SlaInput): SlaResult {
  const now = input.now ?? new Date();
  const deadline = new Date(input.foundAt.getTime() + input.normativeDays * DAY_MS);
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / DAY_MS);
  const overdueDays = diffDays < 0 ? -diffDays : 0;
  const remainingDays = diffDays > 0 ? diffDays : 0;
  const atRiskThreshold = Math.max(1, Math.floor(input.normativeDays * 0.25));
  let status: SlaStatus;
  if (overdueDays > 0) status = 'OVERDUE';
  else if (remainingDays <= atRiskThreshold) status = 'AT_RISK';
  else status = 'ON_TIME';
  return {
    deadline: deadline.toISOString(),
    overdueDays,
    remainingDays,
    status,
  };
}

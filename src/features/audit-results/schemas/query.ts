import { z } from 'zod';
import { Severity, Status } from '@/generated/prisma/enums';

const SeverityEnum = z.enum(Object.values(Severity) as [string, ...string[]]);
const StatusEnum = z.enum(Object.values(Status) as [string, ...string[]]);

// Multi-value фильтры приходят как comma-separated строка: ?severity=LOW,HIGH
const multiEnum = <T extends z.ZodEnum<z.util.EnumLike>>(schema: T) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.split(',').filter(Boolean) : v),
    z.array(schema).optional(),
  );

export const SORT_FIELDS = [
  'foundAt',
  'dueAt',
  'severity',
  'status',
  'riskScore',
  'createdAt',
] as const;

export const ListQuerySchema = z.object({
  search: z.string().trim().min(1).max(200).optional(),
  severity: multiEnum(SeverityEnum),
  status: multiEnum(StatusEnum),
  systemId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  category: z.string().trim().min(1).optional(),
  foundFrom: z.coerce.date().optional(),
  foundTo: z.coerce.date().optional(),
  sortBy: z.enum(SORT_FIELDS).default('foundAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListQuery = z.infer<typeof ListQuerySchema>;

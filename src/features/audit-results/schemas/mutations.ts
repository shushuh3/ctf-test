import { z } from 'zod';
import { Severity, Status } from '@/generated/prisma/enums';

const SeverityEnum = z.enum(Object.values(Severity) as [string, ...string[]]);
const StatusEnum = z.enum(Object.values(Status) as [string, ...string[]]);

export const CreateAuditResultSchema = z.object({
  title: z.string().trim().min(3).max(200),
  systemId: z.string().cuid(),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(10_000),
  severity: SeverityEnum,
  assigneeId: z.string().cuid().optional(),
  foundAt: z.coerce.date(),
  dueAt: z.coerce.date().optional(),
  riskScore: z.number().int().min(0).max(100).default(0),
});
export type CreateAuditResultInput = z.infer<typeof CreateAuditResultSchema>;

export const UpdateStatusSchema = z.object({
  status: StatusEnum,
});
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;

export const UpdateFieldsSchema = z.object({
  description: z.string().trim().min(1).max(10_000).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  dueAt: z.coerce.date().nullable().optional(),
  riskScore: z.number().int().min(0).max(100).optional(),
  assigneeId: z.string().cuid().nullable().optional(),
});
export type UpdateFieldsInput = z.infer<typeof UpdateFieldsSchema>;

export const ChangeSeveritySchema = z.object({
  severity: SeverityEnum,
});
export type ChangeSeverityInput = z.infer<typeof ChangeSeveritySchema>;

export const AddCommentSchema = z.object({
  content: z.string().trim().min(1).max(5_000),
});
export type AddCommentInput = z.infer<typeof AddCommentSchema>;

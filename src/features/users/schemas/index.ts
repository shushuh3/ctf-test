import { z } from 'zod';
import { Role } from '@/generated/prisma/enums';

const RoleEnum = z.enum(Object.values(Role) as [string, ...string[]]);

export const CreateUserSchema = z.object({
  email: z.string().email().max(200),
  name: z.string().trim().min(1).max(200),
  password: z.string().min(8).max(128),
  role: RoleEnum,
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  email: z.string().email().max(200).optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const ChangeRoleSchema = z.object({
  role: RoleEnum,
});
export type ChangeRoleInput = z.infer<typeof ChangeRoleSchema>;

export const SetActiveSchema = z.object({
  isActive: z.boolean(),
});
export type SetActiveInput = z.infer<typeof SetActiveSchema>;

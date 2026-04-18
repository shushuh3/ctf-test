'use server';

import { revalidatePath } from 'next/cache';
import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import { ChangeRoleSchema, CreateUserSchema, SetActiveSchema } from '@/features/users/schemas';

type Result = { ok: true } | { ok: false; error: string };

export async function createUserAction(formData: FormData): Promise<Result> {
  const session = await requireAction('users.manage');
  const parsed = CreateUserSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    password: formData.get('password'),
    role: formData.get('role'),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Проверьте поля — все обязательны, пароль ≥ 8 символов' };
  }
  try {
    await container.users.create(parsed.data, { id: session.user.id });
    revalidatePath('/users');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function changeRoleAction(id: string, formData: FormData): Promise<Result> {
  const session = await requireAction('users.manage');
  const parsed = ChangeRoleSchema.safeParse({ role: formData.get('role') });
  if (!parsed.success) return { ok: false, error: 'Некорректная роль' };
  try {
    await container.users.changeRole(id, parsed.data, { id: session.user.id });
    revalidatePath('/users');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function toggleActiveAction(id: string, isActive: boolean): Promise<Result> {
  const session = await requireAction('users.manage');
  const parsed = SetActiveSchema.safeParse({ isActive });
  if (!parsed.success) return { ok: false, error: 'Некорректное состояние' };
  try {
    await container.users.setActive(id, parsed.data, { id: session.user.id });
    revalidatePath('/users');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

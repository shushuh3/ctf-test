'use server';

import { revalidatePath } from 'next/cache';
import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import {
  AddCommentSchema,
  ChangeSeveritySchema,
  UpdateStatusSchema,
} from '@/features/audit-results/schemas';

type Result<T = undefined> =
  | { ok: true; value?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateStatusAction(id: string, formData: FormData): Promise<Result> {
  const session = await requireAction('auditResults.updateStatus');
  const parsed = UpdateStatusSchema.safeParse({ status: formData.get('status') });
  if (!parsed.success) {
    return { ok: false, error: 'Некорректный статус' };
  }
  try {
    await container.auditResults.updateStatus(id, parsed.data, { id: session.user.id });
    revalidatePath(`/audit-results/${id}`);
    revalidatePath('/audit-results');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function changeSeverityAction(id: string, formData: FormData): Promise<Result> {
  const session = await requireAction('auditResults.changeSeverity');
  const parsed = ChangeSeveritySchema.safeParse({ severity: formData.get('severity') });
  if (!parsed.success) return { ok: false, error: 'Некорректная критичность' };
  try {
    await container.auditResults.changeSeverity(id, parsed.data, { id: session.user.id });
    revalidatePath(`/audit-results/${id}`);
    revalidatePath('/audit-results');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function addCommentAction(id: string, formData: FormData): Promise<Result> {
  const session = await requireAction('comments.add');
  const parsed = AddCommentSchema.safeParse({ content: formData.get('content') });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Некорректный комментарий',
      fieldErrors: { content: ['Минимум 1 символ'] },
    };
  }
  try {
    await container.auditResults.addComment(id, parsed.data, { id: session.user.id });
    revalidatePath(`/audit-results/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function confirmFinalAction(id: string): Promise<Result> {
  const session = await requireAction('auditResults.confirmFinal');
  try {
    await container.auditResults.confirmFinal(id, { id: session.user.id });
    revalidatePath(`/audit-results/${id}`);
    revalidatePath('/audit-results');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

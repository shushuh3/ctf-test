'use client';

import { useRef, useState, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { addCommentAction } from '@/app/(app)/audit-results/[id]/actions';

export function CommentForm({ id }: { id: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await addCommentAction(id, formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleAction} className="space-y-2">
      <Textarea name="content" placeholder="Оставить комментарий…" rows={3} required />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Отправка…' : 'Добавить комментарий'}
        </Button>
      </div>
    </form>
  );
}

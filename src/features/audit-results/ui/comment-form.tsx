'use client';

import { useRef, useState, useTransition } from 'react';
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
    <form ref={formRef} action={handleAction} className="stack-sm">
      <div className="field">
        <textarea name="content" placeholder="Оставить комментарий…" rows={3} required />
      </div>
      {error && <p style={{ color: '#9c2a15', fontSize: 12 }}>{error}</p>}
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="pill pill-accent" disabled={pending}>
          {pending ? 'Отправка…' : 'Добавить комментарий'}
        </button>
      </div>
    </form>
  );
}

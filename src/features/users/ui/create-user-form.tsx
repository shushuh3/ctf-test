'use client';

import { useRef, useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Role } from '@/generated/prisma/enums';
import { createUserAction } from '@/app/(app)/users/actions';

export function CreateUserForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function handle(fd: FormData) {
    setMsg(null);
    start(async () => {
      const res = await createUserAction(fd);
      if (res.ok) {
        setMsg({ kind: 'ok', text: 'Пользователь создан' });
        ref.current?.reset();
      } else {
        setMsg({ kind: 'err', text: res.error });
      }
    });
  }

  return (
    <form
      ref={ref}
      action={handle}
      className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 bg-white p-4 md:grid-cols-5"
    >
      <div>
        <Label htmlFor="email" className="text-xs">
          Email
        </Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="name" className="text-xs">
          Имя
        </Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="password" className="text-xs">
          Пароль
        </Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      <div>
        <Label className="text-xs">Роль</Label>
        <Select name="role" defaultValue="L1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Role).map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Создание…' : 'Создать'}
        </Button>
      </div>
      {msg && (
        <p
          className={
            msg.kind === 'ok'
              ? 'text-xs text-emerald-700 md:col-span-5'
              : 'text-xs text-red-600 md:col-span-5'
          }
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}

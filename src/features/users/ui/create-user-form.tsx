'use client';

import { useRef, useState, useTransition } from 'react';
import { Role } from '@/generated/prisma/enums';
import { Dropdown, type DropdownOption } from '@/shared/design/dropdown';
import { createUserAction } from '@/app/(app)/users/actions';

const ROLE_OPTIONS: DropdownOption[] = Object.values(Role).map((r) => ({ value: r, label: r }));

export function CreateUserForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [role, setRole] = useState<string>('L1');

  function handle(fd: FormData) {
    setMsg(null);
    fd.set('role', role);
    start(async () => {
      const res = await createUserAction(fd);
      if (res.ok) {
        setMsg({ kind: 'ok', text: 'Пользователь создан' });
        ref.current?.reset();
        setRole('L1');
      } else {
        setMsg({ kind: 'err', text: res.error });
      }
    });
  }

  return (
    <form ref={ref} action={handle} className="grid-3">
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div className="field">
        <label htmlFor="name">Имя</label>
        <input id="name" name="name" required />
      </div>
      <div className="field">
        <label htmlFor="password">Пароль</label>
        <input id="password" name="password" type="password" minLength={8} required />
      </div>
      <div className="field">
        <label>Роль</label>
        <Dropdown
          value={role}
          onChange={setRole}
          options={ROLE_OPTIONS}
          name="role"
          ariaLabel="Роль"
        />
      </div>
      <div className="field" style={{ alignSelf: 'flex-end' }}>
        <label style={{ visibility: 'hidden' }}>.</label>
        <button type="submit" className="pill pill-accent" disabled={pending}>
          {pending ? 'Создание…' : 'Создать'}
        </button>
      </div>
      <div className="field" style={{ alignSelf: 'flex-end' }}>
        {msg && (
          <p
            style={{
              fontSize: 12,
              color: msg.kind === 'ok' ? '#3d6a2d' : '#9c2a15',
              paddingBottom: 10,
            }}
          >
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}

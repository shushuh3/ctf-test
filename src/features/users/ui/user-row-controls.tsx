'use client';

import { useState, useTransition } from 'react';
import { Role } from '@/generated/prisma/enums';
import { changeRoleAction, toggleActiveAction } from '@/app/(app)/users/actions';

export function UserRowControls({
  id,
  role,
  isActive,
  isSelf,
}: {
  id: string;
  role: Role;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState<Role>(role);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function changeRole() {
    const fd = new FormData();
    fd.set('role', selectedRole);
    setErr(null);
    start(async () => {
      const res = await changeRoleAction(id, fd);
      if (!res.ok) setErr(res.error);
    });
  }

  function toggle() {
    setErr(null);
    start(async () => {
      const res = await toggleActiveAction(id, !isActive);
      if (!res.ok) setErr(res.error);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <div className="row" style={{ gap: 6 }}>
        <div className="field" style={{ width: 100 }}>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
            disabled={pending || isSelf}
            style={{ padding: '6px 8px', fontSize: 12 }}
          >
            {Object.values(Role).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="pill"
          onClick={changeRole}
          disabled={pending || selectedRole === role || isSelf}
          style={{ padding: '6px 10px', fontSize: 12 }}
        >
          Роль
        </button>
        <button
          type="button"
          className={isActive ? 'pill' : 'pill pill-accent'}
          onClick={toggle}
          disabled={pending || isSelf}
          style={{ padding: '6px 10px', fontSize: 12 }}
        >
          {isActive ? 'Блок.' : 'Вкл.'}
        </button>
      </div>
      {isSelf && (
        <span style={{ fontSize: 10.5, color: 'var(--text-meta)' }}>нельзя редактировать себя</span>
      )}
      {err && <span style={{ fontSize: 11, color: '#9c2a15' }}>{err}</span>}
    </div>
  );
}

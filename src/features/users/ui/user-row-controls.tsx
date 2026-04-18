'use client';

import { useState, useTransition } from 'react';
import { Role } from '@/generated/prisma/enums';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Select
          value={selectedRole}
          onValueChange={(v) => setSelectedRole(v as Role)}
          disabled={pending || isSelf}
        >
          <SelectTrigger className="w-[110px]">
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
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={changeRole}
          disabled={pending || selectedRole === role || isSelf}
        >
          Роль
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isActive ? 'outline' : 'default'}
          onClick={toggle}
          disabled={pending || isSelf}
        >
          {isActive ? 'Блок.' : 'Вкл.'}
        </Button>
      </div>
      {isSelf && <span className="text-xs text-neutral-400">редактирование себя запрещено</span>}
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}

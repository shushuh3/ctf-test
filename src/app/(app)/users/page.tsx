import { redirect } from 'next/navigation';
import { container } from '@/core/container';
import { requireSession } from '@/core/rbac/require';
import { canDo } from '@/core/rbac/permissions';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateUserForm } from '@/features/users/ui/create-user-form';
import { UserRowControls } from '@/features/users/ui/user-row-controls';

const fmtDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

export default async function UsersPage() {
  const session = await requireSession();
  if (!canDo(session.user.role, 'users.read')) redirect('/audit-results');
  const users = await container.users.list();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Пользователи</h1>
        <p className="text-sm text-neutral-500">
          Управление учётными записями, ролями и активностью. Доступно только администраторам.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-neutral-600">Создать нового</h2>
        <CreateUserForm />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Активен</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.id === session.user.id;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-neutral-600">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        u.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-200 text-neutral-700'
                      }
                    >
                      {u.isActive ? 'да' : 'нет'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">{fmtDate(u.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <UserRowControls
                      id={u.id}
                      role={u.role}
                      isActive={u.isActive}
                      isSelf={isSelf}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { container } from '@/core/container';
import { requireSession } from '@/core/rbac/require';
import { canDo } from '@/core/rbac/permissions';
import { CreateUserForm } from '@/features/users/ui/create-user-form';
import { UserRowControls } from '@/features/users/ui/user-row-controls';

const fmtDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

export default async function UsersPage() {
  const session = await requireSession();
  if (!canDo(session.user.role, 'users.read')) redirect('/audit-results');
  const users = await container.users.list();

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div className="head-left">
          <h1>Пользователи</h1>
          <div className="subtle">Управление учётными записями, ролями и активностью.</div>
        </div>
      </div>

      <div className="surface surface-padded">
        <h2 className="card-title">Создать нового</h2>
        <div style={{ marginTop: 14 }}>
          <CreateUserForm />
        </div>
      </div>

      <div className="surface">
        <table className="aud">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Активен</th>
              <th>Создан</th>
              <th className="col-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === session.user.id;
              return (
                <tr key={u.id}>
                  <td className="row-title">{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span
                      className="sev-chip sev-LOW"
                      style={{ fontFamily: 'ui-monospace, monospace' }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`st-chip ${u.isActive ? 'st-RESOLVED' : 'st-REJECTED'}`}>
                      <span className="d" />
                      {u.isActive ? 'да' : 'нет'}
                    </span>
                  </td>
                  <td className="num" style={{ fontWeight: 500 }}>
                    {fmtDate(u.createdAt)}
                  </td>
                  <td className="col-right">
                    <UserRowControls
                      id={u.id}
                      role={u.role}
                      isActive={u.isActive}
                      isSelf={isSelf}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

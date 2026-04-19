import { signOut } from '@/core/auth/auth';
import type { Role } from '@/generated/prisma/enums';
import { canDo } from '@/core/rbac/permissions';
import { Logo } from './logo';
import { NavLinks } from './nav-links';

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function AppSidebar({ role, name, email }: { role: Role; name: string; email: string }) {
  const showUsers = canDo(role, 'users.manage');

  return (
    <aside className="sidebar">
      <Logo />
      <NavLinks showUsers={showUsers} />
      <div className="sidebar-spacer" />
      <div className="sidebar-user">
        <div className="avatar">{initialsOf(name)}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="user-name">{name}</div>
          <div className="user-meta">
            {role} · {email}
          </div>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
        >
          <button type="submit" className="signout-btn" aria-label="Выйти" title="Выйти">
            ⎋
          </button>
        </form>
      </div>
    </aside>
  );
}

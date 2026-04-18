import Link from 'next/link';
import { signOut } from '@/core/auth/auth';
import { requireSession } from '@/core/rbac/require';
import { canDo } from '@/core/rbac/permissions';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const { user } = session;
  const canManageUsers = canDo(user.role, 'users.manage');

  const links: Array<{ href: string; label: string }> = [
    { href: '/audit-results', label: 'Результаты' },
    { href: '/dashboard', label: 'Дашборд' },
    { href: '/calculators', label: 'Калькуляторы' },
  ];
  if (canManageUsers) links.push({ href: '/users', label: 'Пользователи' });

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/audit-results" className="text-sm font-semibold">
              CFT Audit Portal
            </Link>
            <nav className="flex items-center gap-4 text-sm text-neutral-600">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-neutral-900">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-neutral-500">
                {user.email} · <span className="font-mono">{user.role}</span>
              </div>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Выйти
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}

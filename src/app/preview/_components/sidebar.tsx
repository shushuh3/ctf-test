import Link from 'next/link';
import {
  BarChart3,
  Calculator,
  ClipboardList,
  FileText,
  History,
  Shield,
  Users,
} from 'lucide-react';
import { signOut } from '@/core/auth/auth';
import type { Role } from '@/generated/prisma/enums';
import { Logo } from './logo';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  disabled?: boolean;
};

const ANALYTICS: NavItem[] = [
  { href: '/preview/audit-results', label: 'Результаты', icon: ClipboardList },
  { href: '/preview/dashboard', label: 'Дашборд', icon: BarChart3, disabled: true },
  { href: '/preview/calculators', label: 'Калькуляторы', icon: Calculator, disabled: true },
  { href: '/preview/history', label: 'История', icon: History, disabled: true },
  { href: '/preview/reports', label: 'Отчёты', icon: FileText, disabled: true },
];

const ADMIN: NavItem[] = [
  { href: '/preview/users', label: 'Пользователи', icon: Users, disabled: true },
  { href: '/preview/policies', label: 'Политики', icon: Shield, disabled: true },
];

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function PreviewSidebar({ role, name, email }: { role: Role; name: string; email: string }) {
  return (
    <aside className="sidebar">
      <Logo />

      <div className="sidebar-section">Аналитика</div>
      {ANALYTICS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-active={item.href === '/preview/audit-results' || undefined}
          data-disabled={item.disabled || undefined}
          className="nav-item"
        >
          <item.icon size={18} />
          {item.label}
        </Link>
      ))}

      <div className="sidebar-section">Админ</div>
      {ADMIN.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-disabled={item.disabled || undefined}
          className="nav-item"
        >
          <item.icon size={18} />
          {item.label}
        </Link>
      ))}

      <div className="sidebar-spacer" />

      <div className="sidebar-user">
        <div className="avatar">{initialsOf(name)}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 13.5,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#9aa0a6',
              lineHeight: 1.3,
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {role} · {email}
          </div>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
        >
          <button type="submit" className="signout-btn" title="Выйти">
            ⎋
          </button>
        </form>
      </div>
    </aside>
  );
}

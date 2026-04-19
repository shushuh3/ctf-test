'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Calculator, ClipboardList, Users } from 'lucide-react';

const ANALYTICS = [
  { href: '/audit-results', label: 'Результаты', icon: ClipboardList },
  { href: '/dashboard', label: 'Дашборд', icon: BarChart3 },
  { href: '/calculators', label: 'Калькуляторы', icon: Calculator },
] as const;

export function NavLinks({ showUsers }: { showUsers: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <div className="sidebar-section">Аналитика</div>
      {ANALYTICS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-active={isActive(item.href) || undefined}
          className="nav-item"
        >
          <item.icon size={18} />
          {item.label}
        </Link>
      ))}

      {showUsers && (
        <>
          <div className="sidebar-section">Админ</div>
          <Link href="/users" data-active={isActive('/users') || undefined} className="nav-item">
            <Users size={18} />
            Пользователи
          </Link>
        </>
      )}
    </>
  );
}

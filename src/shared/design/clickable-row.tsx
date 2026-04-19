'use client';

import { useRouter } from 'next/navigation';

export function ClickableRow({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <tr
      className="clickable"
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(href);
      }}
      tabIndex={0}
      role="link"
    >
      {children}
    </tr>
  );
}

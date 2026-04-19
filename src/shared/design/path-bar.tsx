'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

function PathBarInner({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = value.trim();
        if (v.startsWith('/')) router.push(v);
      }}
      className="path-bar"
    >
      <span style={{ color: 'var(--text-meta)' }}>/</span>
      <input
        value={value.replace(/^\//, '')}
        onChange={(e) => setValue('/' + e.target.value.replace(/^\/+/, ''))}
        spellCheck={false}
        aria-label="Путь страницы"
      />
      <kbd>↵</kbd>
    </form>
  );
}

export function PathBar() {
  const pathname = usePathname();
  return <PathBarInner key={pathname} initial={pathname} />;
}

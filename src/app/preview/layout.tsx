import type { Metadata } from 'next';
import './preview.css';
import { requireSession } from '@/core/rbac/require';
import { PreviewSidebar } from './_components/sidebar';
import { PreviewTopbar } from './_components/topbar';
import { container } from '@/core/container';

export const metadata: Metadata = {
  title: 'CFT Audit · design preview',
};

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  // Небольшой KPI для топбара — количество открытых результатов
  const openCount = await container.db.auditResult.count({
    where: { status: { in: ['NEW', 'IN_PROGRESS'] } },
  });

  return (
    <div className="preview-root min-h-screen">
      <PreviewSidebar
        role={session.user.role}
        name={session.user.name}
        email={session.user.email}
      />
      <div className="preview-main">
        <PreviewTopbar openCount={openCount} />
        <div className="preview-content">{children}</div>
      </div>
    </div>
  );
}

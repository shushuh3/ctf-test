import type { Metadata } from 'next';
import './preview.css';
import { requireSession } from '@/core/rbac/require';
import { PreviewSidebar } from './_components/sidebar';
import { PreviewTopbar } from './_components/topbar';

export const metadata: Metadata = {
  title: 'CFT Audit · design preview',
};

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="preview-root min-h-screen">
      <PreviewSidebar
        role={session.user.role}
        name={session.user.name}
        email={session.user.email}
      />
      <div className="preview-main">
        <PreviewTopbar />
        <div className="preview-content">{children}</div>
      </div>
    </div>
  );
}

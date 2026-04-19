import { requireSession } from '@/core/rbac/require';
import { AppSidebar } from '@/shared/design/sidebar';
import { AppTopbar } from '@/shared/design/topbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return (
    <div className="app-root">
      <AppSidebar role={session.user.role} name={session.user.name} email={session.user.email} />
      <div className="app-main">
        <AppTopbar />
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}

import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import {
  DynamicsChart,
  SeverityChart,
  StatusChart,
  SystemChart,
} from '@/features/dashboard/ui/charts';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  await requireAction('dashboard.read');
  const sp = await searchParams;
  const daysRaw = Array.isArray(sp.days) ? sp.days[0] : sp.days;
  const days = Math.max(1, Math.min(365, Number(daysRaw) || 30));
  const stats = await container.dashboard.getStats(days);

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div className="head-left">
          <h1>Дашборд</h1>
          <div className="subtle">
            Последние {days} дней · всего записей в системе: {stats.total}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="surface surface-padded">
          <h2 className="card-title">По критичности</h2>
          <div style={{ marginTop: 12 }}>
            <SeverityChart data={stats.bySeverity} />
          </div>
        </div>
        <div className="surface surface-padded">
          <h2 className="card-title">По статусам</h2>
          <div style={{ marginTop: 12 }}>
            <StatusChart data={stats.byStatus} />
          </div>
        </div>
      </div>

      <div className="surface surface-padded">
        <h2 className="card-title">Нарушения по системам (топ-10)</h2>
        <div style={{ marginTop: 12 }}>
          <SystemChart data={stats.bySystem} />
        </div>
      </div>

      <div className="surface surface-padded">
        <h2 className="card-title">Динамика обнаружений и устранений ({days} дней)</h2>
        <div style={{ marginTop: 12 }}>
          <DynamicsChart data={stats.dynamics} />
        </div>
      </div>
    </div>
  );
}

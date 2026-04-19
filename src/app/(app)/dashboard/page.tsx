import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import {
  AssigneeChart,
  DynamicsChart,
  SeverityChart,
  StatusChart,
  SystemChart,
} from '@/features/dashboard/ui/charts';
import { KpiCards } from '@/features/dashboard/ui/kpi-cards';
import { PeriodSwitcher } from '@/features/dashboard/ui/period-switcher';

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
            Быстрая сводка по аудиту: текущая нагрузка, открытые и просроченные позиции.
          </div>
        </div>
        <div className="head-actions">
          <PeriodSwitcher current={days} />
        </div>
      </div>

      <KpiCards kpi={stats.kpi} />

      <div className="grid-2">
        <div className="surface surface-padded surface-hoverable">
          <h2 className="card-title">По критичности</h2>
          <div style={{ marginTop: 14 }}>
            <SeverityChart data={stats.bySeverity} />
          </div>
        </div>
        <div className="surface surface-padded surface-hoverable">
          <h2 className="card-title">По статусам</h2>
          <div style={{ marginTop: 14 }}>
            <StatusChart data={stats.byStatus} />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="surface surface-padded surface-hoverable">
          <h2 className="card-title">Нарушения по системам (топ-10)</h2>
          <div style={{ marginTop: 14 }}>
            <SystemChart data={stats.bySystem} />
          </div>
        </div>
        <div className="surface surface-padded surface-hoverable">
          <h2 className="card-title">Топ-5 ответственных</h2>
          <div style={{ marginTop: 14 }}>
            <AssigneeChart data={stats.byAssignee} />
          </div>
        </div>
      </div>

      <div className="surface surface-padded surface-hoverable">
        <h2 className="card-title">Динамика обнаружений и устранений ({days} дн.)</h2>
        <div style={{ marginTop: 14 }}>
          <DynamicsChart data={stats.dynamics} />
        </div>
      </div>
    </div>
  );
}

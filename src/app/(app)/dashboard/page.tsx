import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Дашборд</h1>
          <p className="text-sm text-neutral-500">
            Последние {days} дней · всего записей в системе: {stats.total}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">По критичности</CardTitle>
          </CardHeader>
          <CardContent>
            <SeverityChart data={stats.bySeverity} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">По статусам</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusChart data={stats.byStatus} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Нарушения по системам (топ-10)</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemChart data={stats.bySystem} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Динамика обнаружений и устранений ({days} дней)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicsChart data={stats.dynamics} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { AlertTriangle, Clock, Flame, Gauge, ShieldAlert } from 'lucide-react';

type Kpi = {
  total: number;
  critical: number;
  open: number;
  overdue: number;
  avgRisk: number;
};

export function KpiCards({ kpi }: { kpi: Kpi }) {
  const items = [
    {
      icon: ShieldAlert,
      label: 'Всего',
      value: kpi.total,
      tone: 'gray' as const,
    },
    {
      icon: Flame,
      label: 'Критических',
      value: kpi.critical,
      tone: 'red' as const,
    },
    {
      icon: Clock,
      label: 'В работе',
      value: kpi.open,
      tone: 'amber' as const,
    },
    {
      icon: AlertTriangle,
      label: 'Просрочено',
      value: kpi.overdue,
      tone: 'orange' as const,
    },
    {
      icon: Gauge,
      label: 'Средний риск',
      value: kpi.avgRisk,
      tone: 'blue' as const,
    },
  ];
  return (
    <div className="kpi-grid">
      {items.map((it) => (
        <div key={it.label} className={`kpi-card kpi-card--${it.tone} surface-hoverable`}>
          <div className="kpi-icon">
            <it.icon size={16} />
          </div>
          <div className="kpi-label">{it.label}</div>
          <div className="kpi-value num">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

'use client';

import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Severity, Status } from '@/generated/prisma/enums';

const SEVERITY_COLOR: Record<Severity, string> = {
  LOW: '#a3a3a3',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#dc2626',
};
const STATUS_COLOR: Record<Status, string> = {
  NEW: '#3b82f6',
  IN_PROGRESS: '#eab308',
  RESOLVED: '#10b981',
  REJECTED: '#6b7280',
  CONFIRMED: '#15803d',
};

const SEVERITY_LABEL: Record<Severity, string> = {
  LOW: 'Низкая',
  MEDIUM: 'Средняя',
  HIGH: 'Высокая',
  CRITICAL: 'Критич.',
};
const STATUS_LABEL: Record<Status, string> = {
  NEW: 'Новый',
  IN_PROGRESS: 'В работе',
  RESOLVED: 'Решён',
  REJECTED: 'Отклонён',
  CONFIRMED: 'Подтв.',
};

export function SeverityChart({ data }: { data: Array<{ severity: Severity; count: number }> }) {
  const rows = data.map((d) => ({
    label: SEVERITY_LABEL[d.severity],
    count: d.count,
    color: SEVERITY_COLOR[d.severity],
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" name="Кол-во">
          {rows.map((r, i) => (
            <Cell key={i} fill={r.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusChart({ data }: { data: Array<{ status: Status; count: number }> }) {
  const rows = data.map((d) => ({
    name: STATUS_LABEL[d.status],
    value: d.count,
    color: STATUS_COLOR[d.status],
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Tooltip />
        <Legend />
        <Pie data={rows} dataKey="value" nameKey="name" outerRadius={80} label>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SystemChart({ data }: { data: Array<{ system: string; count: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="system" width={140} />
        <Tooltip />
        <Bar dataKey="count" name="Нарушений" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DynamicsChart({
  data,
}: {
  data: Array<{ date: string; found: number; resolved: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="found" stroke="#f97316" name="Обнаружено" />
        <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Устранено" />
      </LineChart>
    </ResponsiveContainer>
  );
}

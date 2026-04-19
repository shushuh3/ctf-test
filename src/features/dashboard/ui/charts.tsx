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
  LOW: '#c5c2b9',
  MEDIUM: '#f59e0b',
  HIGH: '#de6a1b',
  CRITICAL: '#9c2a15',
};
const STATUS_COLOR: Record<Status, string> = {
  NEW: '#3e5673',
  IN_PROGRESS: '#de6a1b',
  RESOLVED: '#3d6a2d',
  REJECTED: '#a9a39a',
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
        <CartesianGrid strokeDasharray="3 3" stroke="#ecebe6" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip cursor={{ fill: '#fff5ec' }} />
        <Bar dataKey="count" name="Кол-во" radius={[8, 8, 0, 0]}>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#ecebe6" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="system" width={140} tick={{ fontSize: 12 }} />
        <Tooltip cursor={{ fill: '#fff5ec' }} />
        <Bar dataKey="count" name="Нарушений" fill="#de6a1b" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AssigneeChart({ data }: { data: Array<{ assignee: string; count: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ecebe6" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="assignee" width={120} tick={{ fontSize: 12 }} />
        <Tooltip cursor={{ fill: '#fff5ec' }} />
        <Bar dataKey="count" name="Назначено" fill="#de6a1b" radius={[0, 6, 6, 0]} />
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
        <CartesianGrid strokeDasharray="3 3" stroke="#ecebe6" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="found"
          stroke="#de6a1b"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#de6a1b' }}
          activeDot={{ r: 5 }}
          name="Обнаружено"
        />
        <Line
          type="monotone"
          dataKey="resolved"
          stroke="#3d6a2d"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#3d6a2d' }}
          activeDot={{ r: 5 }}
          name="Устранено"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

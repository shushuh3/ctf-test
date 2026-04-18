'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calcSla, type SlaInput, type SlaResult } from '../sla/sla';

const STATUS_LABEL: Record<SlaResult['status'], string> = {
  ON_TIME: 'В срок',
  AT_RISK: 'Под угрозой',
  OVERDUE: 'Просрочено',
};
const STATUS_TONE: Record<SlaResult['status'], string> = {
  ON_TIME: 'bg-emerald-100 text-emerald-800',
  AT_RISK: 'bg-amber-100 text-amber-800',
  OVERDUE: 'bg-red-100 text-red-800',
};

export function SlaCalculatorForm() {
  const today = new Date().toISOString().slice(0, 10);
  const [foundAt, setFoundAt] = useState(today);
  const [severity, setSeverity] = useState<SlaInput['severity']>('MEDIUM');
  const [normativeDays, setNormativeDays] = useState(14);
  const [result, setResult] = useState<SlaResult | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult(
      calcSla({
        foundAt: new Date(foundAt),
        severity,
        normativeDays,
      }),
    );
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div>
        <Label htmlFor="foundAt" className="text-xs">
          Дата обнаружения
        </Label>
        <Input
          id="foundAt"
          type="date"
          value={foundAt}
          onChange={(e) => setFoundAt(e.target.value)}
          required
        />
      </div>
      <div>
        <Label className="text-xs">Критичность</Label>
        <Select value={severity} onValueChange={(v) => setSeverity(v as SlaInput['severity'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Низкая</SelectItem>
            <SelectItem value="MEDIUM">Средняя</SelectItem>
            <SelectItem value="HIGH">Высокая</SelectItem>
            <SelectItem value="CRITICAL">Критическая</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="normativeDays" className="text-xs">
          Нормативный срок (дней)
        </Label>
        <Input
          id="normativeDays"
          type="number"
          min={1}
          max={365}
          value={normativeDays}
          onChange={(e) => setNormativeDays(Number(e.target.value))}
          required
        />
      </div>
      <div className="md:col-span-3">
        <Button type="submit">Рассчитать</Button>
      </div>
      {result && (
        <div className="space-y-2 rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm md:col-span-3">
          <Row label="Дедлайн">{new Date(result.deadline).toISOString().slice(0, 10)}</Row>
          <Row label="Просрочка (дней)">
            <span className="tabular-nums">{result.overdueDays}</span>
          </Row>
          <Row label="Осталось (дней)">
            <span className="tabular-nums">{result.remainingDays}</span>
          </Row>
          <Row label="Статус SLA">
            <Badge variant="outline" className={STATUS_TONE[result.status]}>
              {STATUS_LABEL[result.status]}
            </Badge>
          </Row>
        </div>
      )}
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-600">{label}</span>
      <span>{children}</span>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  calcCompliance,
  ComplianceInputSchema,
  type ComplianceResult,
} from '../compliance/compliance';

const LEVEL_TONE: Record<ComplianceResult['level'], string> = {
  NON_COMPLIANT: 'bg-red-100 text-red-800',
  PARTIAL: 'bg-amber-100 text-amber-800',
  COMPLIANT: 'bg-emerald-100 text-emerald-800',
  FULL: 'bg-green-200 text-green-900',
};
const LEVEL_LABEL: Record<ComplianceResult['level'], string> = {
  NON_COMPLIANT: 'Не соответствует',
  PARTIAL: 'Частичное',
  COMPLIANT: 'Соответствует',
  FULL: 'Полное соответствие',
};

export function ComplianceCalculatorForm() {
  const [passed, setPassed] = useState(0);
  const [failed, setFailed] = useState(0);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const parsed = ComplianceInputSchema.safeParse({ passed, failed });
    if (!parsed.success) {
      setErr('Сумма должна быть > 0');
      return;
    }
    setResult(calcCompliance(parsed.data));
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div>
        <Label htmlFor="passed" className="text-xs">
          Выполнено требований
        </Label>
        <Input
          id="passed"
          type="number"
          min={0}
          value={passed}
          onChange={(e) => setPassed(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="failed" className="text-xs">
          Невыполнено требований
        </Label>
        <Input
          id="failed"
          type="number"
          min={0}
          value={failed}
          onChange={(e) => setFailed(Number(e.target.value))}
        />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">Рассчитать</Button>
      </div>
      {err && <p className="text-xs text-red-600 md:col-span-2">{err}</p>}
      {result && !err && (
        <div className="space-y-2 rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Процент соответствия</span>
            <strong className="text-xl tabular-nums">{result.percentage}%</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Уровень</span>
            <Badge variant="outline" className={LEVEL_TONE[result.level]}>
              {LEVEL_LABEL[result.level]}
            </Badge>
          </div>
        </div>
      )}
    </form>
  );
}

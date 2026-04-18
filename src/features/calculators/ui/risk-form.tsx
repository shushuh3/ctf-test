'use client';

import { useState } from 'react';
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
import {
  calcRisk,
  type CompensatingControls,
  type RiskImpact,
  type RiskInput,
  type RiskProbability,
  type RiskResult,
  type Severity,
} from '../risk/risk';

const PROB_LABEL: Record<RiskProbability, string> = {
  LOW: 'Низкая',
  MEDIUM: 'Средняя',
  HIGH: 'Высокая',
  VERY_HIGH: 'Очень высокая',
};
const IMPACT_LABEL: Record<RiskImpact, string> = {
  LOW: 'Низкое',
  MEDIUM: 'Среднее',
  HIGH: 'Высокое',
  CRITICAL: 'Критическое',
};
const COMP_LABEL: Record<CompensatingControls, string> = {
  NONE: 'Отсутствуют',
  PARTIAL: 'Частичные',
  FULL: 'Полные',
};
const SEV_LABEL: Record<Severity, string> = {
  LOW: 'Низкая',
  MEDIUM: 'Средняя',
  HIGH: 'Высокая',
  CRITICAL: 'Критическая',
};

const LEVEL_TONE: Record<RiskResult['level'], string> = {
  LOW: 'bg-neutral-100 text-neutral-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export function RiskCalculatorForm() {
  const [values, setValues] = useState<RiskInput>({
    severity: 'MEDIUM',
    probability: 'MEDIUM',
    impact: 'MEDIUM',
    compensatingControls: 'NONE',
  });
  const [result, setResult] = useState<RiskResult | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult(calcRisk(values));
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field label="Критичность">
        <Select
          value={values.severity}
          onValueChange={(v) => setValues((p) => ({ ...p, severity: v as Severity }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((s) => (
              <SelectItem key={s} value={s}>
                {SEV_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Вероятность">
        <Select
          value={values.probability}
          onValueChange={(v) => setValues((p) => ({ ...p, probability: v as RiskProbability }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const).map((s) => (
              <SelectItem key={s} value={s}>
                {PROB_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Влияние">
        <Select
          value={values.impact}
          onValueChange={(v) => setValues((p) => ({ ...p, impact: v as RiskImpact }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((s) => (
              <SelectItem key={s} value={s}>
                {IMPACT_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Компенсирующие меры">
        <Select
          value={values.compensatingControls}
          onValueChange={(v) =>
            setValues((p) => ({ ...p, compensatingControls: v as CompensatingControls }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(['NONE', 'PARTIAL', 'FULL'] as const).map((s) => (
              <SelectItem key={s} value={s}>
                {COMP_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="md:col-span-2">
        <Button type="submit">Рассчитать</Button>
      </div>
      {result && (
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm md:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-neutral-600">Итоговый риск-скор</span>
            <strong className="text-xl tabular-nums">{result.riskScore}</strong>
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <span className="text-neutral-600">Уровень</span>
            <Badge variant="outline" className={LEVEL_TONE[result.level]}>
              {result.level}
            </Badge>
          </div>
        </div>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

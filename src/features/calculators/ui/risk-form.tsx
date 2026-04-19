'use client';

import { useState } from 'react';
import { Dropdown, type DropdownOption } from '@/shared/design/dropdown';
import {
  calcRisk,
  type CompensatingControls,
  type RiskImpact,
  type RiskInput,
  type RiskProbability,
  type RiskResult,
  type Severity,
} from '../risk/risk';

const SEVERITY_OPTIONS: DropdownOption[] = [
  { value: 'LOW', label: 'Низкая' },
  { value: 'MEDIUM', label: 'Средняя' },
  { value: 'HIGH', label: 'Высокая' },
  { value: 'CRITICAL', label: 'Критическая' },
];
const PROB_OPTIONS: DropdownOption[] = [
  { value: 'LOW', label: 'Низкая' },
  { value: 'MEDIUM', label: 'Средняя' },
  { value: 'HIGH', label: 'Высокая' },
  { value: 'VERY_HIGH', label: 'Очень высокая' },
];
const IMPACT_OPTIONS: DropdownOption[] = [
  { value: 'LOW', label: 'Низкое' },
  { value: 'MEDIUM', label: 'Среднее' },
  { value: 'HIGH', label: 'Высокое' },
  { value: 'CRITICAL', label: 'Критическое' },
];
const COMP_OPTIONS: DropdownOption[] = [
  { value: 'NONE', label: 'Отсутствуют' },
  { value: 'PARTIAL', label: 'Частичные' },
  { value: 'FULL', label: 'Полные' },
];

const LEVEL_CHIP: Record<RiskResult['level'], string> = {
  LOW: 'sev-LOW',
  MEDIUM: 'sev-MEDIUM',
  HIGH: 'sev-HIGH',
  CRITICAL: 'sev-CRITICAL',
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
    <form onSubmit={submit} className="grid-2">
      <div className="field">
        <label>Критичность</label>
        <Dropdown
          value={values.severity}
          onChange={(v) => setValues((p) => ({ ...p, severity: v as Severity }))}
          options={SEVERITY_OPTIONS}
          ariaLabel="Критичность"
        />
      </div>
      <div className="field">
        <label>Вероятность</label>
        <Dropdown
          value={values.probability}
          onChange={(v) => setValues((p) => ({ ...p, probability: v as RiskProbability }))}
          options={PROB_OPTIONS}
          ariaLabel="Вероятность"
        />
      </div>
      <div className="field">
        <label>Влияние</label>
        <Dropdown
          value={values.impact}
          onChange={(v) => setValues((p) => ({ ...p, impact: v as RiskImpact }))}
          options={IMPACT_OPTIONS}
          ariaLabel="Влияние"
        />
      </div>
      <div className="field">
        <label>Компенсирующие меры</label>
        <Dropdown
          value={values.compensatingControls}
          onChange={(v) =>
            setValues((p) => ({ ...p, compensatingControls: v as CompensatingControls }))
          }
          options={COMP_OPTIONS}
          ariaLabel="Компенсирующие меры"
        />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit" className="pill pill-accent">
          Рассчитать
        </button>
      </div>
      {result && (
        <div className="surface surface-padded" style={{ gridColumn: '1 / -1', marginTop: 4 }}>
          <div
            className="row"
            style={{
              justifyContent: 'space-between',
              borderBottom: '1px dashed var(--border)',
              paddingBottom: 10,
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Итоговый риск-скор</span>
            <strong style={{ fontSize: 22 }} className="num">
              {result.riskScore}
            </strong>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', paddingTop: 10 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Уровень</span>
            <span className={`sev-chip ${LEVEL_CHIP[result.level]}`}>
              <span className="d" />
              {result.level}
            </span>
          </div>
        </div>
      )}
    </form>
  );
}

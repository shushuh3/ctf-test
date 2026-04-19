'use client';

import { useState } from 'react';
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
        <select
          value={values.severity}
          onChange={(e) => setValues((p) => ({ ...p, severity: e.target.value as Severity }))}
        >
          {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((s) => (
            <option key={s} value={s}>
              {SEV_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Вероятность</label>
        <select
          value={values.probability}
          onChange={(e) =>
            setValues((p) => ({ ...p, probability: e.target.value as RiskProbability }))
          }
        >
          {(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const).map((s) => (
            <option key={s} value={s}>
              {PROB_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Влияние</label>
        <select
          value={values.impact}
          onChange={(e) => setValues((p) => ({ ...p, impact: e.target.value as RiskImpact }))}
        >
          {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((s) => (
            <option key={s} value={s}>
              {IMPACT_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Компенсирующие меры</label>
        <select
          value={values.compensatingControls}
          onChange={(e) =>
            setValues((p) => ({
              ...p,
              compensatingControls: e.target.value as CompensatingControls,
            }))
          }
        >
          {(['NONE', 'PARTIAL', 'FULL'] as const).map((s) => (
            <option key={s} value={s}>
              {COMP_LABEL[s]}
            </option>
          ))}
        </select>
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

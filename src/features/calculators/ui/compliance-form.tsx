'use client';

import { useState } from 'react';
import {
  calcCompliance,
  ComplianceInputSchema,
  type ComplianceResult,
} from '../compliance/compliance';

const LEVEL_LABEL: Record<ComplianceResult['level'], string> = {
  NON_COMPLIANT: 'Не соответствует',
  PARTIAL: 'Частичное',
  COMPLIANT: 'Соответствует',
  FULL: 'Полное соответствие',
};
const LEVEL_CHIP: Record<ComplianceResult['level'], string> = {
  NON_COMPLIANT: 'sev-CRITICAL',
  PARTIAL: 'sev-MEDIUM',
  COMPLIANT: 'st-RESOLVED',
  FULL: 'st-CONFIRMED',
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
    <form onSubmit={submit} className="grid-2">
      <div className="field">
        <label htmlFor="passed">Выполнено требований</label>
        <input
          id="passed"
          type="number"
          min={0}
          value={passed}
          onChange={(e) => setPassed(Number(e.target.value))}
        />
      </div>
      <div className="field">
        <label htmlFor="failed">Невыполнено требований</label>
        <input
          id="failed"
          type="number"
          min={0}
          value={failed}
          onChange={(e) => setFailed(Number(e.target.value))}
        />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit" className="pill pill-accent">
          Рассчитать
        </button>
      </div>
      {err && <p style={{ color: '#9c2a15', fontSize: 12, gridColumn: '1 / -1' }}>{err}</p>}
      {result && !err && (
        <div className="surface surface-padded" style={{ gridColumn: '1 / -1', marginTop: 4 }}>
          <div
            className="row"
            style={{
              justifyContent: 'space-between',
              borderBottom: '1px dashed var(--border)',
              paddingBottom: 10,
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Процент соответствия</span>
            <strong style={{ fontSize: 22 }} className="num">
              {result.percentage}%
            </strong>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', paddingTop: 10 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Уровень</span>
            <span className={`sev-chip ${LEVEL_CHIP[result.level]}`}>
              <span className="d" />
              {LEVEL_LABEL[result.level]}
            </span>
          </div>
        </div>
      )}
    </form>
  );
}

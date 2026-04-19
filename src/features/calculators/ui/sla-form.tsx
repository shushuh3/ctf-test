'use client';

import { useState } from 'react';
import { Dropdown, type DropdownOption } from '@/shared/design/dropdown';
import { calcSla, type SlaInput, type SlaResult } from '../sla/sla';

const SEVERITY_OPTIONS: DropdownOption[] = [
  { value: 'LOW', label: 'Низкая' },
  { value: 'MEDIUM', label: 'Средняя' },
  { value: 'HIGH', label: 'Высокая' },
  { value: 'CRITICAL', label: 'Критическая' },
];

const STATUS_LABEL: Record<SlaResult['status'], string> = {
  ON_TIME: 'В срок',
  AT_RISK: 'Под угрозой',
  OVERDUE: 'Просрочено',
};
const STATUS_CHIP: Record<SlaResult['status'], string> = {
  ON_TIME: 'st-RESOLVED',
  AT_RISK: 'st-IN_PROGRESS',
  OVERDUE: 'sev-CRITICAL',
};

export function SlaCalculatorForm() {
  const today = new Date().toISOString().slice(0, 10);
  const [foundAt, setFoundAt] = useState(today);
  const [severity, setSeverity] = useState<SlaInput['severity']>('MEDIUM');
  const [normativeDays, setNormativeDays] = useState(14);
  const [result, setResult] = useState<SlaResult | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult(calcSla({ foundAt: new Date(foundAt), severity, normativeDays }));
  }

  return (
    <form onSubmit={submit} className="grid-3">
      <div className="field">
        <label htmlFor="foundAt">Дата обнаружения</label>
        <input
          id="foundAt"
          type="date"
          value={foundAt}
          onChange={(e) => setFoundAt(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label>Критичность</label>
        <Dropdown
          value={severity}
          onChange={(v) => setSeverity(v as SlaInput['severity'])}
          options={SEVERITY_OPTIONS}
          ariaLabel="Критичность"
        />
      </div>
      <div className="field">
        <label htmlFor="normativeDays">Нормативный срок (дней)</label>
        <input
          id="normativeDays"
          type="number"
          min={1}
          max={365}
          value={normativeDays}
          onChange={(e) => setNormativeDays(Number(e.target.value))}
          required
        />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit" className="pill pill-accent">
          Рассчитать
        </button>
      </div>
      {result && (
        <div className="surface surface-padded" style={{ gridColumn: '1 / -1', marginTop: 4 }}>
          <Row label="Дедлайн">{new Date(result.deadline).toISOString().slice(0, 10)}</Row>
          <Row label="Просрочка (дней)">
            <span className="num">{result.overdueDays}</span>
          </Row>
          <Row label="Осталось (дней)">
            <span className="num">{result.remainingDays}</span>
          </Row>
          <Row label="Статус SLA">
            <span className={`st-chip ${STATUS_CHIP[result.status]}`}>
              <span className="d" />
              {STATUS_LABEL[result.status]}
            </span>
          </Row>
        </div>
      )}
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="attr-row">
      <span className="attr-label">{label}</span>
      <span className="attr-value">{children}</span>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { RiskCalculatorForm } from './risk-form';
import { SlaCalculatorForm } from './sla-form';
import { ComplianceCalculatorForm } from './compliance-form';

type Tab = 'risk' | 'sla' | 'compliance';

const TITLES: Record<Tab, string> = {
  risk: 'Калькулятор риска',
  sla: 'Калькулятор SLA',
  compliance: 'Калькулятор соответствия',
};

const DESCRIPTIONS: Record<Tab, string> = {
  risk: 'Оценка итогового риск-скора на основе критичности, вероятности, влияния и компенсирующих мер.',
  sla: 'Расчёт дедлайна и статуса SLA по дате обнаружения и нормативному сроку.',
  compliance:
    'Процент соответствия и уровень по количеству выполненных и невыполненных требований.',
};

export function CalculatorTabs() {
  const [tab, setTab] = useState<Tab>('risk');

  return (
    <div className="stack-lg">
      <div className="tabs" role="tablist">
        {(['risk', 'sla', 'compliance'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            data-active={tab === key}
            className="tab"
            onClick={() => setTab(key)}
          >
            {key === 'risk' && 'Риск'}
            {key === 'sla' && 'SLA'}
            {key === 'compliance' && 'Соответствие'}
          </button>
        ))}
      </div>

      <div className="surface surface-padded">
        <h2 className="card-title">{TITLES[tab]}</h2>
        <p className="subtle" style={{ marginTop: 4 }}>
          {DESCRIPTIONS[tab]}
        </p>
        <div style={{ marginTop: 18 }}>
          {tab === 'risk' && <RiskCalculatorForm />}
          {tab === 'sla' && <SlaCalculatorForm />}
          {tab === 'compliance' && <ComplianceCalculatorForm />}
        </div>
      </div>
    </div>
  );
}

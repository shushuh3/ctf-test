import { requireAction } from '@/core/rbac/require';
import { RiskCalculatorForm } from '@/features/calculators/ui/risk-form';
import { SlaCalculatorForm } from '@/features/calculators/ui/sla-form';
import { ComplianceCalculatorForm } from '@/features/calculators/ui/compliance-form';

export default async function CalculatorsPage() {
  await requireAction('calculators.use');

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div className="head-left">
          <h1>Калькуляторы</h1>
          <div className="subtle">
            Быстрая оценка риск-скора, статуса SLA и процента соответствия.
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="surface surface-padded">
          <h2 className="card-title">Калькулятор риска</h2>
          <div style={{ marginTop: 14 }}>
            <RiskCalculatorForm />
          </div>
        </div>
        <div className="surface surface-padded">
          <h2 className="card-title">Калькулятор SLA</h2>
          <div style={{ marginTop: 14 }}>
            <SlaCalculatorForm />
          </div>
        </div>
      </div>

      <div className="surface surface-padded">
        <h2 className="card-title">Калькулятор соответствия</h2>
        <div style={{ marginTop: 14 }}>
          <ComplianceCalculatorForm />
        </div>
      </div>
    </div>
  );
}

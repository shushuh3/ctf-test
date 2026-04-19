import { requireAction } from '@/core/rbac/require';
import { CalculatorTabs } from '@/features/calculators/ui/calculator-tabs';

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

      <CalculatorTabs />
    </div>
  );
}

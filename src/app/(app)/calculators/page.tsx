import { requireAction } from '@/core/rbac/require';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskCalculatorForm } from '@/features/calculators/ui/risk-form';
import { SlaCalculatorForm } from '@/features/calculators/ui/sla-form';
import { ComplianceCalculatorForm } from '@/features/calculators/ui/compliance-form';

export default async function CalculatorsPage() {
  await requireAction('calculators.use');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Калькуляторы</h1>
        <p className="text-sm text-neutral-500">
          Быстрая оценка риск-скора, статуса SLA и процента соответствия.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Калькулятор риска</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskCalculatorForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Калькулятор SLA</CardTitle>
          </CardHeader>
          <CardContent>
            <SlaCalculatorForm />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Калькулятор соответствия</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceCalculatorForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

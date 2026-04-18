import { NextResponse } from 'next/server';
import { withAuth } from '@/core/http/with-auth';
import { RiskInputSchema, calcRisk } from '../risk/risk';
import { SlaInputSchema, calcSla } from '../sla/sla';
import { ComplianceInputSchema, calcCompliance } from '../compliance/compliance';

const json = (data: unknown) => NextResponse.json(data);

export const calculatorsController = {
  risk: withAuth({ action: 'calculators.use' }, async (req) => {
    const input = RiskInputSchema.parse(await req.json());
    return json(calcRisk(input));
  }),
  sla: withAuth({ action: 'calculators.use' }, async (req) => {
    const input = SlaInputSchema.parse(await req.json());
    return json(calcSla(input));
  }),
  compliance: withAuth({ action: 'calculators.use' }, async (req) => {
    const input = ComplianceInputSchema.parse(await req.json());
    return json(calcCompliance(input));
  }),
};

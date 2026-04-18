import { z } from 'zod';

export const RiskProbability = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const;
export type RiskProbability = (typeof RiskProbability)[number];

export const RiskImpact = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type RiskImpact = (typeof RiskImpact)[number];

export const CompensatingControls = ['NONE', 'PARTIAL', 'FULL'] as const;
export type CompensatingControls = (typeof CompensatingControls)[number];

export const Severity = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type Severity = (typeof Severity)[number];

export const RiskInputSchema = z.object({
  severity: z.enum(Severity),
  probability: z.enum(RiskProbability),
  impact: z.enum(RiskImpact),
  compensatingControls: z.enum(CompensatingControls),
});
export type RiskInput = z.infer<typeof RiskInputSchema>;

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskResult = { riskScore: number; level: RiskLevel };

const SEVERITY_WEIGHT: Record<Severity, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
const PROB_WEIGHT: Record<RiskProbability, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  VERY_HIGH: 4,
};
const IMPACT_WEIGHT: Record<RiskImpact, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
const COMP_REDUCTION: Record<CompensatingControls, number> = { NONE: 0, PARTIAL: 0.3, FULL: 0.6 };

export function calcRisk(input: RiskInput): RiskResult {
  const s = SEVERITY_WEIGHT[input.severity];
  const p = PROB_WEIGHT[input.probability];
  const i = IMPACT_WEIGHT[input.impact];
  const reduction = COMP_REDUCTION[input.compensatingControls];
  // base 0..64 → normalize to 0..100
  const base = s * p * i;
  const raw = (base / 64) * 100;
  const riskScore = Math.round(raw * (1 - reduction));
  const level: RiskLevel =
    riskScore >= 75 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW';
  return { riskScore, level };
}

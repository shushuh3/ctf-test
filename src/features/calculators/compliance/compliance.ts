import { z } from 'zod';

export const ComplianceInputSchema = z
  .object({
    passed: z.number().int().min(0),
    failed: z.number().int().min(0),
  })
  .refine((v) => v.passed + v.failed > 0, {
    message: 'Сумма выполненных и невыполненных требований должна быть больше 0',
    path: ['failed'],
  });

export type ComplianceInput = z.infer<typeof ComplianceInputSchema>;
export type ComplianceLevel = 'NON_COMPLIANT' | 'PARTIAL' | 'COMPLIANT' | 'FULL';
export type ComplianceResult = {
  percentage: number;
  level: ComplianceLevel;
};

export function calcCompliance(input: ComplianceInput): ComplianceResult {
  const total = input.passed + input.failed;
  const percentage = Math.round((input.passed / total) * 1000) / 10; // 1 decimal
  let level: ComplianceLevel;
  if (percentage >= 100) level = 'FULL';
  else if (percentage >= 80) level = 'COMPLIANT';
  else if (percentage >= 50) level = 'PARTIAL';
  else level = 'NON_COMPLIANT';
  return { percentage, level };
}

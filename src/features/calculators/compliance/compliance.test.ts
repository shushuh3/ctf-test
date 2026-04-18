import { describe, expect, it } from 'vitest';
import { calcCompliance, ComplianceInputSchema } from './compliance';

describe('compliance calculator', () => {
  it('100/0 → FULL (100%)', () => {
    const r = calcCompliance({ passed: 10, failed: 0 });
    expect(r.percentage).toBe(100);
    expect(r.level).toBe('FULL');
  });

  it('0/10 → NON_COMPLIANT (0%)', () => {
    const r = calcCompliance({ passed: 0, failed: 10 });
    expect(r.percentage).toBe(0);
    expect(r.level).toBe('NON_COMPLIANT');
  });

  it('8/2 → COMPLIANT (80%)', () => {
    const r = calcCompliance({ passed: 8, failed: 2 });
    expect(r.percentage).toBe(80);
    expect(r.level).toBe('COMPLIANT');
  });

  it('5/5 → PARTIAL (50%)', () => {
    const r = calcCompliance({ passed: 5, failed: 5 });
    expect(r.percentage).toBe(50);
    expect(r.level).toBe('PARTIAL');
  });

  it('4/6 → NON_COMPLIANT (40%)', () => {
    const r = calcCompliance({ passed: 4, failed: 6 });
    expect(r.percentage).toBe(40);
    expect(r.level).toBe('NON_COMPLIANT');
  });

  it('rejects 0/0 via schema', () => {
    const r = ComplianceInputSchema.safeParse({ passed: 0, failed: 0 });
    expect(r.success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { calcSla } from './sla';

const foundAt = new Date('2026-01-01T00:00:00Z');

describe('sla calculator', () => {
  it('ON_TIME when plenty of time remains', () => {
    const res = calcSla({
      foundAt,
      severity: 'LOW',
      normativeDays: 30,
      now: new Date('2026-01-02T00:00:00Z'),
    });
    expect(res.status).toBe('ON_TIME');
    expect(res.overdueDays).toBe(0);
    expect(res.remainingDays).toBeGreaterThan(0);
    expect(res.deadline).toBe('2026-01-31T00:00:00.000Z');
  });

  it('AT_RISK when within last 25% of the window', () => {
    const res = calcSla({
      foundAt,
      severity: 'HIGH',
      normativeDays: 20,
      now: new Date('2026-01-18T00:00:00Z'), // 3 days left — within 25% of 20
    });
    expect(res.status).toBe('AT_RISK');
    expect(res.overdueDays).toBe(0);
  });

  it('OVERDUE when deadline passed', () => {
    const res = calcSla({
      foundAt,
      severity: 'CRITICAL',
      normativeDays: 5,
      now: new Date('2026-01-10T00:00:00Z'), // deadline was 01-06, now 01-10 → 4 days overdue
    });
    expect(res.status).toBe('OVERDUE');
    expect(res.overdueDays).toBe(4);
    expect(res.remainingDays).toBe(0);
  });

  it('deadline = foundAt + normativeDays in UTC', () => {
    const res = calcSla({
      foundAt: new Date('2026-04-01T10:15:00Z'),
      severity: 'MEDIUM',
      normativeDays: 14,
      now: new Date('2026-04-02T00:00:00Z'),
    });
    expect(res.deadline).toBe('2026-04-15T10:15:00.000Z');
  });
});

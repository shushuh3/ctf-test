import { describe, expect, it } from 'vitest';
import { Role } from '@/generated/prisma/enums';
import { sessionCan } from './permissions';

const mk = (role: Role) => ({ user: { id: 'u', email: 'u@x', name: 'U', role } });

describe('sessionCan', () => {
  it('returns false for null / missing user', () => {
    expect(sessionCan(null, 'auditResults.list')).toBe(false);
    expect(sessionCan(undefined, 'auditResults.list')).toBe(false);
    expect(sessionCan({ user: undefined }, 'auditResults.list')).toBe(false);
  });

  it('L1 can read, cannot manage', () => {
    expect(sessionCan(mk(Role.L1), 'auditResults.list')).toBe(true);
    expect(sessionCan(mk(Role.L1), 'auditResults.changeSeverity')).toBe(false);
    expect(sessionCan(mk(Role.L1), 'users.manage')).toBe(false);
  });

  it('L2 inherits L1 + status/comments', () => {
    expect(sessionCan(mk(Role.L2), 'auditResults.updateStatus')).toBe(true);
    expect(sessionCan(mk(Role.L2), 'comments.add')).toBe(true);
    expect(sessionCan(mk(Role.L2), 'auditResults.confirmFinal')).toBe(false);
  });

  it('L3 can change severity, confirm, create', () => {
    expect(sessionCan(mk(Role.L3), 'auditResults.changeSeverity')).toBe(true);
    expect(sessionCan(mk(Role.L3), 'auditResults.confirmFinal')).toBe(true);
    expect(sessionCan(mk(Role.L3), 'auditResults.create')).toBe(true);
    expect(sessionCan(mk(Role.L3), 'auditResults.delete')).toBe(false);
  });

  it('Admin has every permission', () => {
    expect(sessionCan(mk(Role.ADMIN), 'users.manage')).toBe(true);
    expect(sessionCan(mk(Role.ADMIN), 'auditResults.delete')).toBe(true);
  });
});

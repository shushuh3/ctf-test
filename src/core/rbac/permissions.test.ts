import { describe, expect, it } from 'vitest';
import { Role } from '@/generated/prisma/enums';
import { ACTIONS, ROLE_PERMISSIONS, canDo, type Action } from './permissions';

describe('RBAC permissions', () => {
  it('ADMIN has access to every action', () => {
    for (const action of ACTIONS) {
      expect(canDo(Role.ADMIN, action), `ADMIN should have ${action}`).toBe(true);
    }
  });

  it('L1 can only read and use calculators/dashboard', () => {
    const allowed: Action[] = [
      'auditResults.list',
      'auditResults.read',
      'comments.read',
      'dashboard.read',
      'calculators.use',
      'auditLog.read',
    ];
    for (const action of ACTIONS) {
      expect(canDo(Role.L1, action)).toBe(allowed.includes(action));
    }
  });

  it('L2 extends L1 with status updates and commenting', () => {
    expect(canDo(Role.L2, 'auditResults.list')).toBe(true); // inherited
    expect(canDo(Role.L2, 'auditResults.updateStatus')).toBe(true);
    expect(canDo(Role.L2, 'auditResults.updateFields')).toBe(true);
    expect(canDo(Role.L2, 'comments.add')).toBe(true);
    // NOT allowed for L2:
    expect(canDo(Role.L2, 'auditResults.changeSeverity')).toBe(false);
    expect(canDo(Role.L2, 'auditResults.confirmFinal')).toBe(false);
    expect(canDo(Role.L2, 'users.manage')).toBe(false);
  });

  it('L3 extends L2 with severity, final confirmation and create', () => {
    expect(canDo(Role.L3, 'auditResults.updateStatus')).toBe(true); // from L2
    expect(canDo(Role.L3, 'auditResults.changeSeverity')).toBe(true);
    expect(canDo(Role.L3, 'auditResults.confirmFinal')).toBe(true);
    expect(canDo(Role.L3, 'auditResults.create')).toBe(true);
    // NOT allowed even for L3:
    expect(canDo(Role.L3, 'auditResults.delete')).toBe(false);
    expect(canDo(Role.L3, 'users.manage')).toBe(false);
  });

  it('only ADMIN can manage users and delete audit results', () => {
    for (const role of [Role.L1, Role.L2, Role.L3]) {
      expect(canDo(role, 'users.manage')).toBe(false);
      expect(canDo(role, 'users.read')).toBe(false);
      expect(canDo(role, 'auditResults.delete')).toBe(false);
    }
    expect(canDo(Role.ADMIN, 'users.manage')).toBe(true);
    expect(canDo(Role.ADMIN, 'auditResults.delete')).toBe(true);
  });

  it('ROLE_PERMISSIONS is defined for every Role', () => {
    for (const role of Object.values(Role)) {
      expect(ROLE_PERMISSIONS[role]).toBeInstanceOf(Set);
    }
  });
});

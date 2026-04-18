import { Role } from '@/generated/prisma/enums';

// Все доменные действия перечислены явно. Любая попытка передать
// строку, не входящую в Action, будет пойматься компилятором.
export const ACTIONS = [
  // Audit results
  'auditResults.list',
  'auditResults.read',
  'auditResults.create',
  'auditResults.updateStatus',
  'auditResults.updateFields', // плановый срок, риск-скор, описание, ответственный
  'auditResults.changeSeverity',
  'auditResults.confirmFinal',
  'auditResults.delete',
  // Comments
  'comments.read',
  'comments.add',
  // Dashboard + calculators
  'dashboard.read',
  'calculators.use',
  // Users
  'users.read',
  'users.manage',
  // Audit log
  'auditLog.read',
] as const;

export type Action = (typeof ACTIONS)[number];

// Набор действий на роль. Чтение L1 ≤ L2 ≤ L3; Admin отдельно и имеет всё.
const L1_ACTIONS: Action[] = [
  'auditResults.list',
  'auditResults.read',
  'comments.read',
  'dashboard.read',
  'calculators.use',
  'auditLog.read',
];

const L2_ACTIONS: Action[] = [
  ...L1_ACTIONS,
  'auditResults.updateStatus',
  'auditResults.updateFields',
  'comments.add',
];

const L3_ACTIONS: Action[] = [
  ...L2_ACTIONS,
  'auditResults.create',
  'auditResults.changeSeverity',
  'auditResults.confirmFinal',
];

// У админа все действия.
const ADMIN_ACTIONS: Action[] = [...ACTIONS];

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Action>> = {
  [Role.L1]: new Set(L1_ACTIONS),
  [Role.L2]: new Set(L2_ACTIONS),
  [Role.L3]: new Set(L3_ACTIONS),
  [Role.ADMIN]: new Set(ADMIN_ACTIONS),
};

export function canDo(role: Role, action: Action): boolean {
  return ROLE_PERMISSIONS[role].has(action);
}

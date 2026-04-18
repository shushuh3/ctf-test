// Composition root: здесь инстанцируются сервисы и связываются между собой.
// Все transport'ы/controller'ы импортируют готовые сервисы отсюда, а не создают сами —
// это единственная точка, где знают про конкретные зависимости (PrismaClient, другие сервисы).
//
// Dependency direction:
//   app/api/*   →   features/*/transport   →   container   →   features/*/service   →   db (PrismaClient)
//
// При unit-тесте сервиса контейнер НЕ используется: тест вручную создаёт
// сервис с mockDeep<PrismaClient>() и моками зависимых сервисов.

import { db } from '@/core/db/client';
import { makeAuditResultsService } from '@/features/audit-results/service/audit-results.service';
import { noopAuditLog } from '@/features/audit-results/service/types';

// Phase 5 заменит noopAuditLog на реальный makeAuditLogService(db).
const auditLog = noopAuditLog;

export const container = {
  db,
  auditLog,
  auditResults: makeAuditResultsService({ db, auditLog }),
} as const;

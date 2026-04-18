// Composition root: здесь инстанцируются сервисы и связываются между собой.
// Все transport'ы/controller'ы импортируют готовые сервисы отсюда, а не создают сами.
//
// Dependency direction:
//   app/api/*   →   features/*/transport   →   container   →   features/*/service   →   db (PrismaClient)
//
// При unit-тесте сервиса контейнер НЕ используется: тест вручную создаёт
// сервис с mockDeep<PrismaClient>() и моками зависимых сервисов.

import { db } from '@/core/db/client';
import { makeAuditResultsService } from '@/features/audit-results/service/audit-results.service';
import { makeAuditLogService } from '@/features/audit-log/service/audit-log.service';
import { makeUsersService } from '@/features/users/service/users.service';

const auditLog = makeAuditLogService({ db });

export const container = {
  db,
  auditLog,
  auditResults: makeAuditResultsService({ db, auditLog }),
  users: makeUsersService({ db, auditLog }),
} as const;

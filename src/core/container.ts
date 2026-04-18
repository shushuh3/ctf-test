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

export const container = {
  db,
  // Сервисы добавляются здесь в фазах 4–8:
  // auditLog:      makeAuditLogService(db),
  // auditResults:  makeAuditResultsService(db, container.auditLog),
  // users:         makeUsersService(db, container.auditLog),
  // dashboard:     makeDashboardService(db),
} as const;

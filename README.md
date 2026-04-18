# CFT Audit Portal

Внутренний веб-сервис для работы с результатами аудитов информационной безопасности финансовых систем. Реализация тестового задания.

## Стек

- **Next.js 16** (App Router, TypeScript, Turbopack) — frontend + API routes
- **PostgreSQL 16** + **Prisma 7** — хранилище
- **Auth.js v5** — аутентификация и RBAC (Credentials + Prisma adapter)
- **Tailwind CSS 4** + **shadcn/ui** — UI
- **TanStack Table / Query** — таблицы и клиентский кеш
- **Recharts** — графики дашборда
- **Zod** — валидация (схемы переиспользуются в OpenAPI)
- **Pino** — логгер
- **Vitest** + **Playwright** — unit + e2e
- **k6** — нагрузочное (`tests/load/`)

## Архитектура

Feature-based, 2 слоя + Prisma как DI-зависимость. Подробности в плане (приватный файл вне репо).

```
src/
├── app/              # Next.js App Router — тонкий биндинг к transport
├── core/             # cross-cutting: auth, rbac, http, logger, openapi, container
├── features/         # transport/ + service/ + schemas/ + ui/ (на каждую фичу)
└── shared/           # переиспользуемые UI/хуки/утилиты
prisma/               # schema.prisma + migrations + seed.ts
tests/{e2e,load}/     # Playwright + k6
```

## Запуск локально

Требуется: Node ≥ 20.9, pnpm ≥ 10, Docker (для Postgres).

```bash
# 1. Копируем env
cp .env.example .env

# 2. Поднимаем Postgres
docker-compose up -d db

# 3. Ставим зависимости и генерируем Prisma Client
pnpm install
pnpm db:generate

# 4. Миграции + сиды (появятся в Phase 2)
pnpm db:deploy
pnpm db:seed

# 5. Dev-сервер
pnpm dev
# → http://localhost:3000
```

## Скрипты

| Команда              | Что делает                     |
| -------------------- | ------------------------------ |
| `pnpm dev`           | Dev-сервер Next.js (Turbopack) |
| `pnpm build`         | Production-сборка              |
| `pnpm start`         | Запуск production-сборки       |
| `pnpm lint`          | ESLint                         |
| `pnpm format`        | Prettier (write)               |
| `pnpm format:check`  | Prettier (check)               |
| `pnpm typecheck`     | `tsc --noEmit`                 |
| `pnpm test`          | Vitest (unit)                  |
| `pnpm test:coverage` | Vitest + coverage gate (≥65%)  |
| `pnpm test:e2e`      | Playwright                     |
| `pnpm db:migrate`    | `prisma migrate dev`           |
| `pnpm db:seed`       | Загрузка тестовых данных       |

## Полная Docker-сборка

```bash
docker-compose --profile app up --build
```

## CI/CD

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — lint + typecheck + format + unit-тесты + e2e
- [`.github/workflows/security.yml`](.github/workflows/security.yml) — CodeQL (SAST), Trivy + `pnpm audit` (CVE), gitleaks (secrets)

## Тестовые учётные записи

Будут в сидах (Phase 2): `admin@example.com`, `l1@example.com`, `l2@example.com`, `l3@example.com` — пароль в README после Phase 2.

## Roadmap реализации

См. план. Статус по фазам отражается в коммитах (`feat:`, `test:`, `ci:`, `docs:` по Conventional Commits).

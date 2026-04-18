# CFT Audit Portal

Внутренний веб-сервис для работы с результатами аудитов информационной безопасности финансовых систем. Реализация тестового задания.

- Роли: **Admin / Analyst L1 / L2 / L3**. Права разграничены матрицей, покрытой unit-тестами и e2e.
- Фичи: список результатов с фильтрами/сортировкой/пагинацией, карточка результата, комментарии, история изменений (audit log), дашборд с 4 графиками, 3 калькулятора (риск / SLA / соответствие), управление пользователями, Swagger UI.
- Все даты хранятся и отдаются в **UTC** (Postgres `timestamptz` + ISO 8601).

---

## Стек

| Слой                | Выбор                                                                   |
| ------------------- | ----------------------------------------------------------------------- |
| Framework           | Next.js 16 (App Router, TypeScript strict, Turbopack, standalone build) |
| БД                  | PostgreSQL 16                                                           |
| ORM                 | Prisma 7 + `@prisma/adapter-pg`                                         |
| Auth                | Auth.js v5 (Credentials + JWT session, 8h TTL)                          |
| UI                  | shadcn/ui (Radix + Tailwind 4)                                          |
| Таблица             | TanStack Table (server-driven, URL-state)                               |
| Графики             | Recharts                                                                |
| Валидация / OpenAPI | Zod + `@asteasolutions/zod-to-openapi`                                  |
| Логгер              | Pino + pino-pretty                                                      |
| Тесты               | Vitest + `vitest-mock-extended` (unit) · Playwright (e2e) · k6 (load)   |
| Линт                | ESLint + Prettier + Husky + lint-staged + commitlint                    |
| CI/CD               | GitHub Actions (lint + unit + e2e + CodeQL + Trivy + gitleaks)          |
| Контейнеры          | docker-compose (Postgres) + multi-stage Dockerfile (standalone)         |
| Package manager     | pnpm 10                                                                 |

### Архитектура — feature-based, два слоя

Каждая фича = `schemas/` + `service/` + `transport/` + `ui/`. Бизнес-логика живёт в `service`, Prisma приходит туда через DI (composition root в `src/core/container.ts`). Транспорт тонкий: `withAuth` → Zod parse → вызов сервиса → JSON-ответ или доменная ошибка → HTTP-статус.

```
src/
├── app/                 # Next.js App Router — тонкий биндинг
│   ├── api/             # JSON API (описан в OpenAPI)
│   ├── (auth)/login/
│   ├── (app)/           # защищённые HTML-страницы
│   │   ├── audit-results/(page + [id]/page)
│   │   ├── dashboard/
│   │   ├── calculators/
│   │   └── users/       # только Admin
│   └── docs/            # Swagger UI (публично)
├── core/                # cross-cutting
│   ├── auth/            # Auth.js config + handlers
│   ├── rbac/            # permissions matrix + guards
│   ├── http/            # withAuth, mapDomainError
│   ├── errors/          # DomainError + подклассы
│   ├── logger/, openapi/, db/, container.ts
├── features/
│   ├── audit-results/   # + transport, UI-список, карточка
│   ├── audit-log/       # сервис + UI истории
│   ├── users/           # admin CRUD
│   ├── calculators/     # risk / sla / compliance (чистые функции)
│   ├── dashboard/       # Recharts + агрегации
│   └── docs/            # OpenAPI регистратор
└── proxy.ts             # Next.js 16 middleware (редирект на /login)
```

---

## Запуск локально

Требуется: **Node ≥ 20.9**, **pnpm ≥ 10**, **Docker** (для Postgres), опционально **k6** (`brew install k6`).

```bash
# 1. Клонируем и заходим
git clone https://github.com/shushuh3/ctf-test.git ctf-test
cd ctf-test

# 2. env
cp .env.example .env
# при необходимости подставьте свой AUTH_SECRET (openssl rand -base64 32)

# 3. Postgres в Docker (на порту 55432, чтобы не конфликтовать с локальным PG)
docker compose up -d db

# 4. Зависимости + генерация Prisma Client + миграции + сиды
pnpm install
pnpm db:generate
pnpm prisma migrate deploy
pnpm db:seed

# 5. Dev-сервер
pnpm dev
# → http://localhost:3000
```

### Полный prod-запуск в Docker

```bash
docker compose --profile app up --build
# → приложение http://localhost:3000, БД — внутренний сервис db
```

---

## Тестовые учётные записи

Создаются сидом (`prisma/seed.ts`). Пароль у всех — **`Password123!`**.

| Email               | Роль  | Что может                                                      |
| ------------------- | ----- | -------------------------------------------------------------- |
| `admin@example.com` | ADMIN | всё + управление пользователями                                |
| `l3@example.com`    | L3    | + смена критичности, финальное подтверждение, создание записей |
| `l2@example.com`    | L2    | + смена статуса, комментарии, редактирование полей             |
| `l1@example.com`    | L1    | просмотр, фильтры, дашборд, калькуляторы                       |

Сид также создаёт 6 систем, 35 аудит-результатов с разными статусами/датами/критичностями, комментарии и начальные записи audit log (faker-seed=42, полностью воспроизводимо).

---

## Скрипты

| Команда                                                                  | Что делает                      |
| ------------------------------------------------------------------------ | ------------------------------- |
| `pnpm dev`                                                               | dev-сервер Next.js (Turbopack)  |
| `pnpm build` / `pnpm start`                                              | production-сборка / запуск      |
| `pnpm lint`                                                              | ESLint                          |
| `pnpm format` · `pnpm format:check`                                      | Prettier                        |
| `pnpm typecheck`                                                         | `tsc --noEmit`                  |
| `pnpm test` · `pnpm test:watch`                                          | Vitest                          |
| `pnpm test:coverage`                                                     | Vitest + coverage (gate ≥ 65%)  |
| `pnpm test:e2e`                                                          | Playwright (поднимает свой dev) |
| `pnpm db:migrate` · `db:deploy` · `db:generate` · `db:seed` · `db:reset` | Prisma операции                 |
| `k6 run tests/load/list.js`                                              | нагрузочный тест списка         |
| `k6 run tests/load/detail.js`                                            | нагрузочный тест детальной      |

---

## Реализованный функционал

### Результаты аудитов

- Список `/audit-results` — фильтры (severity, status, system, assignee, категория, диапазон дат, полнотекстовый поиск), сортировка по колонкам (`foundAt`, `dueAt`, `severity`, `status`, `riskScore`), пагинация. Всё состояние в URL.
- Карточка `/audit-results/:id` — полное описание, атрибуты, комментарии, **настоящая** история изменений (запись при смене статуса, критичности, редактировании, комментировании).
- RBAC-aware действия: L2 меняет статус и комментирует, L3 дополнительно меняет критичность и подтверждает финальное решение, Admin имеет полный доступ.

### Дашборд `/dashboard`

- Bar: распределение по критичности.
- Pie: распределение по статусам.
- Horizontal bar: топ-10 систем по нарушениям.
- Line: динамика обнаружений/устранений по дням за настраиваемое окно (`?days=30`).

### Калькуляторы `/calculators`

- **Risk** — severity × probability × impact × компенсирующие меры → score 0..100 + уровень.
- **SLA** — дата обнаружения + критичность + нормативный срок → deadline UTC, просрочка в днях, статус `ON_TIME / AT_RISK / OVERDUE` (порог AT_RISK — 25% окна).
- **Compliance** — passed / failed → процент соответствия + уровень `NON_COMPLIANT / PARTIAL / COMPLIANT / FULL`.

Все три — чистые функции, 100% покрытые unit-тестами, также доступны через POST `/api/calculators/{risk,sla,compliance}`.

### Пользователи `/users` (только Admin)

- CRUD: список, создание (bcrypt + проверка дублей email), смена роли, блокировка/разблокировка, удаление.
- Self-edit guard: Admin не может поменять роль или заблокировать самого себя.
- Каждая мутация пишется в audit log.

### API и OpenAPI

- 16 REST-эндпоинтов (audit-results / users / calculators / dashboard), документированы через Zod-схемы → OpenAPI 3.1.
- Spec: `GET /api/docs/openapi.json` (публичный).
- Swagger UI: `GET /docs` (публичный, UI из CDN).

---

## Тестирование

| Уровень          | Количество              | Что проверяется                                                                                       |
| ---------------- | ----------------------- | ----------------------------------------------------------------------------------------------------- |
| Unit (Vitest)    | **64 теста в 9 файлах** | сервисы, RBAC, калькуляторы, dashboard-агрегации                                                      |
| E2E (Playwright) | 4 сценария              | RBAC L1 read-only, L2 меняет статус+комментарий, Admin создаёт юзера и тот логинится, SLA-калькулятор |
| Load (k6)        | 2 скрипта               | list (50 VU, p95 < 500ms), detail (100 VU, p95 < 300ms)                                               |

### Coverage (Vitest v8)

После **Phase 10** — **94.73% statements / 93.18% functions / 94.87% lines / 83.7% branches** при пороге 65%. Коверидж считается для `features/**` + `core/rbac/**`, исключая transport-слой (тестируется через e2e), schemas (декларации) и сгенерированный Prisma Client.

### Unit-тесты без БД

Все сервис-тесты используют `mockDeep<PrismaClient>()` из `vitest-mock-extended` — реальный Postgres не нужен, тесты детерминированные (< 2 с для всего набора).

### E2E

Playwright сам поднимает `pnpm dev` (см. `playwright.config.ts`). Перед суитой `globalSetup` делает `prisma migrate deploy` + `db:seed` для предсказуемости. Пропустить seed: `SKIP_DB_RESET=1 pnpm test:e2e`.

### Нагрузка

Скрипты k6 (`tests/load/{list,detail}.js`) самостоятельно логинятся через Auth.js CSRF-flow в `setup()` и реиспользуют сессионную куку. Пороги описаны прямо в скриптах.

---

## CI/CD

Три независимых workflow в `.github/workflows/`:

- **`ci.yml`** (на каждый PR + push в main):
  1. `lint` — typecheck + ESLint + Prettier check
  2. `test` — Postgres-service + Prisma migrate + `vitest --coverage` (падает если < 65%)
  3. `e2e` — Postgres + migrate + seed + `playwright install chromium` + Playwright
     Артефакты: coverage-report всегда, playwright-report при падении.
- **`security.yml`** (PR + push + weekly cron):
  - **CodeQL** (SAST, расширенный пакет правил)
  - **pnpm audit** `--audit-level=high`
  - **Trivy fs** — CVE в зависимостях и конфигах (CRITICAL + HIGH)
  - **gitleaks** — секреты в истории
  - DAST **не** выполняется (по ТЗ).
- **`load.yml`** — ручной запуск (workflow_dispatch) с выбором скрипта, поднимает prod-сборку и гонит k6.

---

## Конвенции и качество

- **TypeScript** — `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`.
- **ESLint** — `next/core-web-vitals` + `eslint-config-next/typescript`.
- **Prettier** + `prettier-plugin-tailwindcss`.
- **Husky**: pre-commit → `lint-staged` (ESLint + Prettier на stage'ах); commit-msg → commitlint (Conventional Commits).
- **RBAC** задана явной матрицей `Role → Set<Action>`, тестируется как unit и e2e.
- **Prisma** клиент — singleton с HMR-safe обходом для dev.

---

## Скоуп — что IN / OUT

**IN (реализовано):** Авторизация + RBAC, CRUD аудит-результатов с фильтрами и сортировкой, карточка, комментарии, настоящий audit log, дашборд с 4 графиками, 3 калькулятора, полный Admin-CRUD пользователей, Swagger, unit + e2e + load тесты, CI с проверками безопасности, линтеры, docker-compose, Conventional Commits.

**OUT (сознательно не реализовано):** DAST (по ТЗ), SSO / OAuth, i18n, мобильная адаптация, pixel-perfect дизайн, push-уведомления, real-time (WebSockets).

---

## Полезные URL

|                |                                             |
| -------------- | ------------------------------------------- |
| Локальный UI   | http://localhost:3000                       |
| Логин          | http://localhost:3000/login                 |
| Список аудитов | http://localhost:3000/audit-results         |
| Дашборд        | http://localhost:3000/dashboard             |
| Калькуляторы   | http://localhost:3000/calculators           |
| Пользователи   | http://localhost:3000/users (Admin)         |
| Swagger UI     | http://localhost:3000/docs                  |
| OpenAPI JSON   | http://localhost:3000/api/docs/openapi.json |

<div align="center">

# sparrow · cft audit portal

Внутренний сервис для работы с результатами аудитов информационной безопасности финансовых систем.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=000000)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-5_beta-5B21B6?style=for-the-badge&logo=authelia&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![k6](https://img.shields.io/badge/k6-load-7D64FF?style=for-the-badge&logo=k6&logoColor=white)

</div>

---

## Про задачу

Тестовое задание от **[ЦФТ](https://www.cft.ru/)** — компании, разрабатывающей ПО для российских банков и финансовых рынков.

Суть — внутренний веб-сервис, в котором аналитики компании работают с результатами аудитов ИБ финсистем: смотрят записи, фильтруют, меняют статус, комментируют, строят аналитику и считают риск-скор / SLA / соответствие через встроенные калькуляторы. Доступ только для сотрудников, четыре роли с разным объёмом прав.

## Демо

VPS нет — проект разворачивается одной командой у себя. Вся инструкция — [ниже](#быстрый-старт). Тестовые учётки — [тут](#тестовые-учётные-записи).

## Что реализовано

- **Авторизация + RBAC** — 4 роли (ADMIN / L1 / L2 / L3), явная матрица прав в `core/rbac/permissions.ts`, покрыта unit- и e2e-тестами. Проверка на сервисе (источник правды) + UI-гейтинг кнопок.
- **Список аудитов** — URL-state, **collapsible-фильтры** по критичности/статусу/системе/ответственному/категории/диапазону дат/полнотекстовому поиску, сортировка по колонкам, пагинация, кликабельные строки.
- **Карточка аудита** — описание, атрибуты, severity/status chips, **комментарии**, **timeline истории** с diff-ом по полям, role-gated действия: смена статуса (L2+), severity и финальное подтверждение (L3+).
- **Дашборд** — 5 KPI-тайлов (всего / критических / в работе / просрочено / средний риск), переключатель периода `7/30/90/180` дней, 5 графиков (severity bar, status pie, top-10 систем, top-5 ответственных, динамика обнаружения/устранения).
- **Калькуляторы** в табах: **Риск** (severity × probability × impact × компенсирующие меры), **SLA** (deadline / overdue / status), **Соответствие** (percentage / level). Чистые функции + unit-тесты.
- **Управление пользователями** (ADMIN-only) — полный CRUD, смена ролей, блокировка, self-edit guard.
- **Swagger UI** на `/docs` — 16 endpoint'ов документированы из Zod-схем (никакого дублирования).
- **Кастомный UI** поверх минималистичного дизайна: ромбовидный login, оранжевая палитра, портал-dropdown / календарь без обрезания, Manrope везде.

## Быстрый старт

Требуется **Node ≥ 20.9**, **pnpm ≥ 10**, **Docker** (для Postgres), опционально **k6** для нагрузки.

```bash
# 1. Клонируем
git clone https://github.com/shushuh3/ctf-test.git cft-test && cd cft-test

# 2. Env
cp .env.example .env

# 3. Postgres поднимается в docker-compose (порт 55432, чтобы не конфликтовать с локальным PG)
docker compose up -d db

# 4. Зависимости, Prisma client, миграции, сиды
pnpm install
pnpm db:generate
pnpm prisma migrate deploy
pnpm db:seed

# 5. Dev-сервер с Turbopack
pnpm dev
```

Открой **<http://localhost:3000>** — при заходе редирект на `/login`.

### Полностью в Docker (prod-сборка + БД)

```bash
docker compose --profile app up --build
# → приложение на http://localhost:3000, БД на 55432
```

## Тестовые учётные записи

Создаются сидом (`prisma/seed.ts`, детерминированный faker-seed `42`). Пароль у всех один — **`Password123!`**.

| Email               | Роль      | Что может                                                      |
| ------------------- | --------- | -------------------------------------------------------------- |
| `admin@example.com` | **ADMIN** | всё + управление пользователями                                |
| `l3@example.com`    | **L3**    | + смена критичности, финальное подтверждение, создание записей |
| `l2@example.com`    | **L2**    | + смена статуса, комментарии, редактирование полей             |
| `l1@example.com`    | **L1**    | просмотр, фильтры, дашборд, калькуляторы                       |

Сид также создаёт 6 систем, 35 аудит-результатов с разными статусами/критичностями, комментарии и начальные записи audit log.

## Архитектура

Feature-based, два слоя: `transport` (тонкий route handler) → `service` (бизнес-логика с Prisma через DI). Composition root в `src/core/container.ts`.

```
src/
├── app/                 # Next.js App Router — только биндинг
│   ├── api/             # JSON API (описан в OpenAPI)
│   ├── login/           # ромбовидная login-карточка
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
│   ├── logger, openapi, db, container.ts
├── features/
│   ├── audit-results/   # transport + service + ui/ + schemas/
│   ├── audit-log/       # сервис + UI timeline
│   ├── users/           # admin CRUD
│   ├── calculators/     # risk / sla / compliance (чистые функции)
│   ├── dashboard/       # агрегации + Recharts
│   └── docs/            # OpenAPI-регистратор
├── shared/design/       # дизайн-система: Sidebar, Topbar, Logo,
│                        # Dropdown (portal), DatePicker (portal), chips, css
└── proxy.ts             # Next.js 16 middleware: редирект на /login
```

**Ключевые инварианты**:

- `service` не знает про HTTP. Все ошибки — `DomainError` (`NotFoundError`, `ForbiddenError`, …), маппятся в HTTP-статусы на transport-слое.
- `Prisma` приходит в service как параметр фабрики → unit-тесты с `mockDeep<PrismaClient>()`, БД не поднимается.
- RBAC — один источник правды: матрица `Role → Set<Action>` в `permissions.ts`, `canDo` / `requireAction` / `sessionCan` используются и на сервере, и в UI.
- Все даты хранятся и отдаются в **UTC** (`timestamptz` в Postgres + ISO 8601).

## Тестирование

| Уровень              | Количество              | Что проверяет                                                                                         |
| -------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------- |
| **Unit** (Vitest)    | **64 теста в 9 файлах** | сервисы (audit-results, users, audit-log, dashboard), RBAC-матрица, калькуляторы                      |
| **E2E** (Playwright) | 4 сценария              | L1 read-only, L2 меняет статус+комментит, Admin создаёт пользователя и тот логинится, SLA-калькулятор |
| **Load** (k6)        | 2 скрипта               | list (50 VU, p95 < 500ms), detail (100 VU, p95 < 300ms)                                               |

### Coverage

После `pnpm test:coverage` — **94.7% statements / 93.2% functions / 94.9% lines / 83.7% branches** при пороге **≥ 65%**. Target: `features/**` + `core/rbac/**`, исключая transport (покрыт e2e), schemas и Prisma-generated.

### Unit без БД

Все сервисные тесты используют `mockDeep<PrismaClient>()` из `vitest-mock-extended`. Postgres не нужен, тесты детерминированные (~2с для всего набора).

### E2E

Playwright сам поднимает `pnpm dev` (см. `playwright.config.ts`). Перед suite `globalSetup` делает `prisma migrate deploy` + `db:seed` для предсказуемости. Пропустить reset: `SKIP_DB_RESET=1 pnpm test:e2e`.

### Load

k6-скрипты (`tests/load/{list,detail}.js`) самостоятельно логинятся через Auth.js CSRF-flow и реиспользуют session cookie. Пороги описаны в самих скриптах.

```bash
brew install k6
k6 run tests/load/list.js
k6 run tests/load/detail.js
```

## CI/CD

Три независимых workflow в `.github/workflows/`:

- **`ci.yml`** (на каждый PR + push в main):
  1. `lint` — typecheck + ESLint + Prettier check
  2. `test` — Postgres service + `vitest --coverage` (падает если < 65%), upload coverage artifact
  3. `e2e` — Postgres + migrate + seed + `playwright install chromium` + Playwright, upload report на failure
- **`security.yml`** (PR + push + weekly cron):
  - **CodeQL** (SAST, расширенный пакет правил)
  - **pnpm audit** `--audit-level=high`
  - **Trivy fs** — CVE в зависимостях и конфигах (CRITICAL + HIGH)
  - **gitleaks** — секреты в истории
  - DAST — **не** выполняется (по ТЗ).
- **`load.yml`** — ручной запуск (`workflow_dispatch`) с выбором скрипта, поднимает prod-сборку и гонит k6.

## Скрипты

| Команда                                                                  | Что делает                     |
| ------------------------------------------------------------------------ | ------------------------------ |
| `pnpm dev`                                                               | Dev Next.js + Turbopack        |
| `pnpm build` / `pnpm start`                                              | Production-сборка / запуск     |
| `pnpm lint`                                                              | ESLint                         |
| `pnpm format` · `pnpm format:check`                                      | Prettier                       |
| `pnpm typecheck`                                                         | `tsc --noEmit`                 |
| `pnpm test` · `pnpm test:watch`                                          | Vitest                         |
| `pnpm test:coverage`                                                     | Vitest + coverage gate (≥ 65%) |
| `pnpm test:e2e`                                                          | Playwright                     |
| `pnpm db:migrate` · `db:deploy` · `db:generate` · `db:seed` · `db:reset` | Prisma операции                |

## API и OpenAPI

- 16 REST-эндпоинтов (`/api/audit-results`, `/api/audit-results/:id/{status,severity,confirm,comments,history}`, `/api/users/:id/{role,active}`, `/api/calculators/{risk,sla,compliance}`, `/api/dashboard/stats`)
- OpenAPI 3.1 spec — <http://localhost:3000/api/docs/openapi.json>
- **Swagger UI** — <http://localhost:3000/docs> (публично, без логина)
- Source of truth для схем — Zod (`features/*/schemas`), регистрация в `features/docs/openapi-spec.ts`

## Дизайн

- **Manrope** (Google Fonts) — основной шрифт, кириллица + latin, weight 400–800
- Оранжевый брендовый акцент `#DE6A1B` на тёплом off-white canvas `#FAFAF9`
- 4-конечная sparkle-иконка в sidebar (SVG-логотип)
- Ромбовидная `/login` с фулл-скрин-градиентом `#FFB066 → #DE6A1B → #9C3E0A`
- **Кастомные компоненты**: Dropdown (через `createPortal`, с flip-up если снизу мало места), DatePicker (русская локаль, аналогичный portal), tabs, collapsible filters
- Мягкие status/severity chips без неоновой подсветки, разные тона для каждого уровня

## Конвенции и качество

- **TypeScript strict** + `noUncheckedIndexedAccess`, `noImplicitOverride`
- **ESLint** (`next/core-web-vitals` + `@typescript-eslint`) + **Prettier** + `prettier-plugin-tailwindcss`
- **Husky** + **lint-staged** (pre-commit: eslint --fix + prettier --write + typecheck) + **commitlint** (Conventional Commits)
- **RBAC** задана явной матрицей, любое новое действие — в `ACTIONS` union type
- **Prisma** client — singleton с HMR-safe обходом

## Scope — IN / OUT

**IN (реализовано)**: Авторизация + RBAC, CRUD аудит-результатов с фильтрами и сортировкой, карточка, комментарии, настоящий audit log, дашборд с KPI + 5 графиков, 3 калькулятора, полный Admin-CRUD пользователей, Swagger, unit + e2e + load тесты, CI с проверками безопасности, линтеры, docker-compose, Conventional Commits.

**OUT (сознательно не реализовано)**: DAST (по ТЗ), SSO / OAuth, i18n, мобильная адаптация (только desktop), pixel-perfect дизайн на всех разрешениях, push-уведомления, real-time через WebSocket.

## Полезные URL

|                |                                               |
| -------------- | --------------------------------------------- |
| Локальный UI   | <http://localhost:3000>                       |
| Логин          | <http://localhost:3000/login>                 |
| Список аудитов | <http://localhost:3000/audit-results>         |
| Дашборд        | <http://localhost:3000/dashboard>             |
| Калькуляторы   | <http://localhost:3000/calculators>           |
| Пользователи   | <http://localhost:3000/users> (только Admin)  |
| Swagger UI     | <http://localhost:3000/docs>                  |
| OpenAPI JSON   | <http://localhost:3000/api/docs/openapi.json> |

---

<div align="center">

Тестовое для <b>ЦФТ</b> · построено на <b>Next.js 16</b>, <b>Prisma 7</b>, <b>Auth.js v5</b>, <b>Manrope</b><br>
<sub>18 коммитов · 64 unit · 4 e2e · 2 k6 · coverage ≥ 65%</sub>

</div>

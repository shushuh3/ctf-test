<div align="center">

# sparrow · cft audit portal

Внутренний сервис для работы с результатами аудитов безопасности финансовых систем.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=000000)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-5-5B21B6?style=for-the-badge&logo=authelia&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

<p align="center">
  <video src="docs/record.mp4" controls width="820" muted playsinline></video>
</p>

> Если видео не проигрывается прямо в README — <a href="docs/record.mp4">открыть в отдельной вкладке</a>.

## Про задачу

Тестовое от **[ЦФТ](https://www.cft.ru/)** — внутренний портал для аналитиков ИБ: список аудитов, карточка, комментарии, история, дашборд, калькуляторы (риск / SLA / соответствие), управление пользователями. Четыре роли (ADMIN / L1 / L2 / L3) с разным объёмом прав.

![Страница входа](docs/screenshots/login.png)

## Быстрый старт

```bash
git clone https://github.com/shushuh3/ctf-test.git && cd ctf-test
cp .env.example .env
docker compose up -d db
pnpm install && pnpm db:generate && pnpm prisma migrate deploy && pnpm db:seed
pnpm dev
```

Открыть **<http://localhost:3000>**. Требуется Node ≥ 20.9, pnpm ≥ 10, Docker.

## Тестовые учётки

Пароль у всех — **`Password123!`**

| Email               | Роль  | Что может                                         |
| ------------------- | ----- | ------------------------------------------------- |
| `admin@example.com` | ADMIN | всё + управление пользователями                   |
| `l3@example.com`    | L3    | смена severity, финальное подтверждение, создание |
| `l2@example.com`    | L2    | смена статуса, комментарии                        |
| `l1@example.com`    | L1    | просмотр                                          |

## Стек и реализация

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript strict**
- **Prisma 7** + **PostgreSQL 16** + **Auth.js v5** (Credentials + JWT)
- **Tailwind 4** + кастомные компоненты (Dropdown/DatePicker через portal, Manrope везде)
- Feature-based архитектура: `transport` → `service` (Prisma через DI) → composition root
- **Swagger UI** на `/docs` из Zod-схем
- **64 unit** (Vitest) + **4 e2e** (Playwright) + **k6** нагрузка, coverage **94.7%**
- **CI** (lint / typecheck / tests / e2e) + **Security** (CodeQL / Trivy / gitleaks / pnpm audit)

## Скрипты

```bash
pnpm dev          # dev + Turbopack
pnpm build        # production
pnpm test         # Vitest
pnpm test:coverage
pnpm test:e2e     # Playwright (сам поднимает dev)
pnpm db:seed      # перезалить тестовые данные
```

## Полезные URL

- **Логин** — <http://localhost:3000/login>
- **Swagger UI** — <http://localhost:3000/docs>
- **OpenAPI JSON** — <http://localhost:3000/api/docs/openapi.json>

---

<div align="center">

<sub>Тестовое для <b>ЦФТ</b> · Next.js 16 · Prisma 7 · Auth.js v5 · Manrope</sub>

</div>

import { execSync } from 'node:child_process';

// Перед прогоном e2e приводим БД в известное состояние: применяем миграции + сиды.
// Игнорируется, если установлена SKIP_DB_RESET=1 (например, для быстрой локальной итерации).
export default async function globalSetup() {
  if (process.env['SKIP_DB_RESET'] === '1') return;
  execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });
  execSync('pnpm db:seed', { stdio: 'inherit' });
}

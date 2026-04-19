import type { Page } from '@playwright/test';

export async function login(page: Page, email: string, password = 'Password123!') {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль').fill(password);
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

export async function signOut(page: Page) {
  // Кнопка выхода в sidebar-user: title="Выйти", содержимое — иконка ⎋
  await page.getByRole('button', { name: 'Выйти' }).click();
  await page.waitForURL('**/login');
}

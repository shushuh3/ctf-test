import { expect, test } from '@playwright/test';
import { login, signOut } from './helpers';

test('Admin creates an L3 user and that user can log in', async ({ page }) => {
  const email = `e2e-user-${Date.now()}@example.com`;
  const password = 'Password123!';

  await login(page, 'admin@example.com');
  await expect(page).toHaveURL(/\/audit-results/);

  await page.getByRole('link', { name: 'Пользователи' }).click();
  await expect(page).toHaveURL(/\/users/);
  await expect(page.getByRole('heading', { name: 'Пользователи' })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Имя').fill('E2E User');
  await page.getByLabel('Пароль').fill(password);

  // Выбор роли — кастомный dropdown (role=combobox с aria-label)
  await page.getByRole('combobox', { name: 'Роль' }).first().click();
  await page.getByRole('option', { name: 'L3' }).click();

  await page.getByRole('button', { name: 'Создать' }).click();
  await expect(page.getByText('Пользователь создан')).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();

  await signOut(page);
  await login(page, email, password);
  await expect(page).toHaveURL(/\/audit-results/);
  await expect(page.getByText(email)).toBeVisible();
});

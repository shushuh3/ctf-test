import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('L1 sees the list but no mutation controls', async ({ page }) => {
  await login(page, 'l1@example.com');
  await expect(page).toHaveURL(/\/audit-results/);

  await expect(page.getByRole('heading', { name: 'Результаты аудитов' })).toBeVisible();
  const rows = page.locator('tbody tr');
  await expect(rows.first()).toBeVisible();

  // Строка кликабельна целиком (role=link, onClick router.push)
  await rows.first().click();
  await expect(page).toHaveURL(/\/audit-results\/[^/]+$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // L1 не видит блок "Действия" и форму комментария
  await expect(page.getByText('Действия', { exact: true })).toHaveCount(0);
  await expect(page.getByPlaceholder('Оставить комментарий…')).toHaveCount(0);

  // В навбаре нет ссылки "Пользователи"
  await expect(page.getByRole('link', { name: 'Пользователи' })).toHaveCount(0);
});

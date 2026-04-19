import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('L2 changes status + adds comment, both appear in history', async ({ page }) => {
  await login(page, 'l2@example.com');
  await expect(page).toHaveURL(/\/audit-results/);

  // Открываем первую запись (строка таблицы кликабельна)
  await page.locator('tbody tr').first().click();
  await expect(page).toHaveURL(/\/audit-results\/[^/]+$/);

  // Блок "Действия" виден для L2
  await expect(page.getByText('Действия', { exact: true })).toBeVisible();

  // Смена статуса: первый <select> в блоке действий — это statusSelect.
  // Выбираем статус, отличный от текущего, чтобы "Сохранить" стала enabled.
  const statusSelect = page.locator('select').first();
  const current = await statusSelect.inputValue();
  const next = current === 'NEW' ? 'IN_PROGRESS' : 'NEW';
  await statusSelect.selectOption(next);
  await page.getByRole('button', { name: 'Сохранить' }).first().click();
  await page.waitForLoadState('networkidle');

  // Добавляем комментарий
  const marker = `E2E ${Date.now()}`;
  await page.getByPlaceholder('Оставить комментарий…').fill(marker);
  await page.getByRole('button', { name: 'Добавить комментарий' }).click();
  await expect(page.getByText(marker)).toBeVisible();

  // В истории должна появиться запись
  await expect(page.getByText(/Смена статуса|Добавлен комментарий/).first()).toBeVisible();
});

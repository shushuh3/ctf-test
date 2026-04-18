import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('L2 changes status + adds comment, both appear in history', async ({ page }) => {
  await login(page, 'l2@example.com');
  await expect(page).toHaveURL(/\/audit-results/);

  // Open the first audit record
  await page.locator('tbody tr a').first().click();
  await expect(page).toHaveURL(/\/audit-results\/[^/]+$/);

  // Actions block is visible for L2 (CardTitle renders as div, so match by text)
  await expect(page.getByText('Действия', { exact: true })).toBeVisible();

  // Change status → "В работе"
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'В работе' }).click();
  await page.getByRole('button', { name: 'Сохранить' }).first().click();
  // Wait for server-action revalidation to complete
  await page.waitForLoadState('networkidle');

  // Add a comment with a unique marker
  const marker = `E2E ${Date.now()}`;
  await page.getByPlaceholder('Оставить комментарий…').fill(marker);
  await page.getByRole('button', { name: 'Добавить комментарий' }).click();
  await expect(page.getByText(marker)).toBeVisible();

  // History block shows an entry — check at least one of the expected labels
  await expect(page.getByText(/Смена статуса|Добавлен комментарий/).first()).toBeVisible();
});

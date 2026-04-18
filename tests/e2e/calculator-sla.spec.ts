import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('SLA calculator returns a deadline for a known input', async ({ page }) => {
  await login(page, 'l1@example.com');
  await page.goto('/calculators');
  await expect(page.getByText('Калькулятор SLA', { exact: true })).toBeVisible();

  // Scope to SLA's form: it's the only one with a "Нормативный срок" field.
  const slaForm = page.locator('form').filter({ hasText: 'Нормативный срок' });

  await slaForm.locator('input[type="date"]').fill('2026-03-01');
  await slaForm.getByRole('button', { name: 'Рассчитать' }).click();

  // Result block appears inside that form
  await expect(slaForm.getByText('Дедлайн')).toBeVisible();
  await expect(slaForm.getByText(/В срок|Под угрозой|Просрочено/)).toBeVisible();
});

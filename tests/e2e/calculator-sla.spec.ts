import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('SLA calculator returns a deadline for a known input', async ({ page }) => {
  await login(page, 'l1@example.com');
  await page.goto('/calculators');

  await page.getByRole('tab', { name: 'SLA' }).click();
  await expect(page.getByRole('heading', { name: 'Калькулятор SLA' })).toBeVisible();

  // Дата обнаружения выбирается через кастомный DatePicker.
  // Клик по триггеру (aria-label="Дата обнаружения") → "Сегодня" из popup-портала.
  await page.getByRole('button', { name: 'Дата обнаружения' }).click();
  await page.getByRole('button', { name: 'Сегодня' }).click({ force: true });

  // SLA-форма — единственная, содержащая поле "Нормативный срок"
  const slaForm = page.locator('form').filter({ hasText: 'Нормативный срок' });
  await slaForm.getByRole('button', { name: 'Рассчитать' }).click();

  await expect(slaForm.getByText('Дедлайн')).toBeVisible();
  await expect(slaForm.getByText(/В срок|Под угрозой|Просрочено/)).toBeVisible();
});

import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';
import { createEventViaUI } from './helpers/events';

test.describe('Event management — organizer (requires running backend)', () => {
    test.beforeEach(async ({ page }) => {
        await registerViaUI(page, generateTestUser());
    });

    test('organizer can edit their event', async ({ page }) => {
        const name = `E2E Edit ${String(Date.now())}`;
        await createEventViaUI(page, { name });
        await expect(
            page.getByRole('heading', { name, level: 1 })
        ).toBeVisible();

        await page.getByRole('button', { name: /edit event/i }).click();
        await expect(
            page.getByRole('heading', { name: /edit event/i })
        ).toBeVisible();

        const newName = `${name} (edited)`;
        await page.locator('#event-name').fill(newName);
        await page.getByRole('button', { name: /save event/i }).click();

        await expect(page).toHaveURL(/event-detail-page/, { timeout: 15_000 });
        await expect(
            page.getByRole('heading', { name: newName, level: 1 })
        ).toBeVisible({ timeout: 10_000 });
    });

    test('organizer can cancel their event and it leaves My Events', async ({
        page,
    }) => {
        const name = `E2E Cancel ${String(Date.now())}`;
        await createEventViaUI(page, { name });
        await expect(
            page.getByRole('heading', { name, level: 1 })
        ).toBeVisible();

        await page.getByRole('button', { name: /cancel event/i }).click();

        await expect(page).toHaveURL(/\/my-events/, { timeout: 15_000 });
        await expect(page.getByRole('heading', { name })).toHaveCount(0);
    });
});

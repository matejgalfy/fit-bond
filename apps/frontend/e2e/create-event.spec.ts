import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';
import { mockLocationSearch, pickDateDaysAhead } from './helpers/events';

test.describe('Create event page (requires running backend)', () => {
    test.beforeEach(async ({ page }) => {
        const user = generateTestUser();
        await registerViaUI(page, user);
        await page.goto('/create-event');
        await expect(
            page.getByRole('heading', { name: /create new event/i })
        ).toBeVisible();
    });

    test('renders the form', async ({ page }) => {
        await expect(
            page.getByRole('button', { name: /publish event/i })
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /cancel/i })
        ).toBeVisible();
    });

    test('publishing an empty form shows a validation error', async ({
        page,
    }) => {
        await page.getByRole('button', { name: /publish event/i }).click();
        await expect(page.locator('p.text-primary-red').first()).toBeVisible({
            timeout: 5_000,
        });
    });

    test('cancel button returns to my-events', async ({ page }) => {
        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page).toHaveURL(/\/my-events/);
    });

    test('publishes a complete event and redirects to my-events with the new card visible', async ({
        page,
    }) => {
        await mockLocationSearch(page);

        const eventName = `E2E Event ${String(Date.now())}`;

        await page.locator('#event-name').fill(eventName);

        const sportTrigger = page.locator('#sport-type');
        await expect(sportTrigger).toBeEnabled({ timeout: 10_000 });
        await sportTrigger.click();
        const firstSport = page.getByRole('option').first();
        await firstSport.waitFor({ state: 'visible', timeout: 10_000 });
        await firstSport.click();
        await expect(sportTrigger).not.toContainText(/select a sport/i);

        await page
            .locator('#event-description')
            .fill('Created by Playwright e2e test.');

        await pickDateDaysAhead(page, 30);

        await page.getByLabel('Start hour').fill('10');
        await page.getByLabel('Start minute').fill('30');

        await page.locator('#event-location').click();
        const locationSearchInput = page.getByPlaceholder('Search address...');
        await locationSearchInput.waitFor({ state: 'visible' });
        await locationSearchInput.fill('Mock');
        const mockOption = page.getByRole('option', { name: /mock stadium/i });
        await mockOption.waitFor({ state: 'visible', timeout: 10_000 });
        await mockOption.click();

        await page.locator('#event-capacity').fill('10');

        await page.getByRole('button', { name: /publish event/i }).click();

        await expect(page).toHaveURL(/\/my-events/, { timeout: 15_000 });

        await expect(page.getByText(eventName)).toBeVisible({
            timeout: 10_000,
        });
    });
});

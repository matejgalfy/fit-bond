import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';

const MOCK_LOCATION = {
    placeId: 'mock-place-id-1',
    displayName: 'Mock Stadium, Brno',
    fullAddress: 'Mock Stadium, Brno, Czech Republic',
    formattedAddress: 'Mock Stadium, Brno',
    lat: 49.195061,
    lng: 16.606837,
};

async function mockLocationSearch(page: import('@playwright/test').Page) {
    await page.route('**/locations/search**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([MOCK_LOCATION]),
        });
    });
}

test.describe('Create event page (requires running backend)', () => {
    test.beforeEach(async ({ page }) => {
        const user = generateTestUser();
        await registerViaUI(page, user);
        await page.goto('/pages/create-event');
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
        await expect(page).toHaveURL(/\/pages\/my-events/);
    });

    test('publishes a complete event and redirects to my-events with the new card visible', async ({
        page,
    }) => {
        await mockLocationSearch(page);

        const eventName = `E2E Event ${String(Date.now())}`;

        // Basics
        await page.locator('#event-name').fill(eventName);

        // Sport — wait for the combobox to become enabled (sports finished loading),
        // open it, and pick the first available option from the popover.
        const sportTrigger = page.locator('#sport-type');
        await expect(sportTrigger).toBeEnabled({ timeout: 10_000 });
        await sportTrigger.click();
        const firstSport = page.getByRole('option').first();
        await firstSport.waitFor({ state: 'visible', timeout: 10_000 });
        await firstSport.click();
        // Confirm the popover closed and a sport is selected (button no longer shows placeholder)
        await expect(sportTrigger).not.toContainText(/select a sport/i);

        await page
            .locator('#event-description')
            .fill('Created by Playwright e2e test.');

        // Date — pick a date 30 days in the future (yyyy-mm-dd)
        const future = new Date();
        future.setDate(future.getDate() + 30);
        const isoDate = future.toISOString().slice(0, 10);
        await page.locator('#event-date').fill(isoDate);

        // Time — 10:30 AM
        await page.getByLabel('Start hour').fill('10');
        await page.getByLabel('Start minute').fill('30');
        // AM is the default; no need to click it

        // Location — open combobox, type, pick the mocked suggestion
        await page.locator('#event-location').click();
        const locationSearchInput = page.getByPlaceholder('Search address...');
        await locationSearchInput.waitFor({ state: 'visible' });
        await locationSearchInput.fill('Mock');
        const mockOption = page.getByRole('option', { name: /mock stadium/i });
        await mockOption.waitFor({ state: 'visible', timeout: 10_000 });
        await mockOption.click();

        // Capacity
        await page.locator('#event-capacity').fill('10');

        // Submit and verify redirect
        await page.getByRole('button', { name: /publish event/i }).click();

        await expect(page).toHaveURL(/\/pages\/my-events/, { timeout: 15_000 });

        // The newly created event should appear in the Organizing tab (default)
        await expect(page.getByText(eventName)).toBeVisible({
            timeout: 10_000,
        });
    });
});

import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';
import { createEventViaUI } from './helpers/events';

const SEARCH_PLACEHOLDER = 'Search sport or event name...';

test.describe('Discover events (requires running backend)', () => {
    test('search finds an event by name and opens its detail', async ({
        browser,
    }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventName = `E2E Discover ${String(Date.now())}`;
        await createEventViaUI(organizerPage, { name: eventName });

        const searcherContext = await browser.newContext();
        const searcherPage = await searcherContext.newPage();
        await registerViaUI(searcherPage, generateTestUser());
        await searcherPage.goto('/discover-page');

        await searcherPage.getByPlaceholder(SEARCH_PLACEHOLDER).fill(eventName);

        const card = searcherPage.getByRole('heading', { name: eventName });
        await expect(card).toBeVisible({ timeout: 10_000 });
        await card.click();

        await expect(searcherPage).toHaveURL(
            /event-detail-page\?.*from=discover/
        );
        await expect(
            searcherPage.getByRole('heading', { name: eventName, level: 1 })
        ).toBeVisible();
        const discoverLinks = searcherPage.getByRole('link', {
            name: /discover/i,
        });
        await expect(discoverLinks).toHaveCount(2);
        await expect(discoverLinks.nth(0)).toHaveClass(/text-primary-blue/);
        await expect(discoverLinks.nth(1)).toHaveClass(/text-primary-blue/);

        await organizerContext.close();
        await searcherContext.close();
    });

    test('search with no matches shows the empty state', async ({ page }) => {
        await registerViaUI(page, generateTestUser());
        await page.goto('/discover-page');

        await page
            .getByPlaceholder(SEARCH_PLACEHOLDER)
            .fill(`no-such-event-${String(Date.now())}`);

        await expect(
            page.getByText('No events found matching your criteria.')
        ).toBeVisible({ timeout: 10_000 });
    });
});

import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';
import { createEventViaUI, eventDetailPath } from './helpers/events';

test.describe('Profile (requires running backend)', () => {
    test('owner can edit their bio and it persists across reload', async ({
        page,
    }) => {
        await registerViaUI(page, generateTestUser());
        await page.goto('/profile-page');

        await expect(
            page.getByRole('heading', { name: 'My Profile' })
        ).toBeVisible();
        await expect(page.getByText('No bio yet.')).toBeVisible();

        await page.getByRole('button', { name: /edit profile/i }).click();
        await expect(
            page.getByRole('heading', { name: /edit profile/i })
        ).toBeVisible();

        const bio = `E2E bio ${String(Date.now())}`;
        await page.getByLabel('Bio', { exact: true }).fill(bio);
        await page.getByRole('button', { name: /^save$/i }).click();

        const bioOnCard = page.locator('p', { hasText: bio });

        await expect(bioOnCard).toBeVisible({ timeout: 10_000 });

        await page.reload();
        await expect(bioOnCard).toBeVisible({ timeout: 10_000 });
    });

    test('profile changes are visible to other users', async ({ browser }) => {
        const ownerContext = await browser.newContext();
        const ownerPage = await ownerContext.newPage();
        const owner = generateTestUser();
        await registerViaUI(ownerPage, owner);

        await ownerPage.goto('/profile-page');
        await ownerPage.getByRole('button', { name: /edit profile/i }).click();
        await expect(
            ownerPage.getByRole('heading', { name: /edit profile/i })
        ).toBeVisible();
        const bio = `Shared bio ${String(Date.now())}`;
        await ownerPage.getByLabel('Bio', { exact: true }).fill(bio);
        await ownerPage.getByRole('button', { name: /^save$/i }).click();
        await expect(ownerPage.locator('p', { hasText: bio })).toBeVisible({
            timeout: 10_000,
        });

        const eventName = `E2E Profile Link ${String(Date.now())}`;
        const eventId = await createEventViaUI(ownerPage, { name: eventName });

        const viewerContext = await browser.newContext();
        const viewerPage = await viewerContext.newPage();
        await registerViaUI(viewerPage, generateTestUser());
        await viewerPage.goto(eventDetailPath(eventId));
        await viewerPage.getByRole('link', { name: /organized by/i }).click();

        await expect(viewerPage).toHaveURL(/profile-page/);
        await expect(viewerPage.locator('p', { hasText: bio })).toBeVisible({
            timeout: 10_000,
        });

        await ownerContext.close();
        await viewerContext.close();
    });
});

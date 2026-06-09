import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';

test.describe('Authenticated navigation (requires running backend)', () => {
    test.beforeEach(async ({ page }) => {
        const user = generateTestUser();
        await registerViaUI(page, user);
    });

    test('navigates to Discover page', async ({ page }) => {
        await page
            .getByRole('link', { name: /discover/i })
            .first()
            .click();
        await expect(page).toHaveURL(/\/discover-page/);
    });

    test('navigates to My Events page', async ({ page }) => {
        await page
            .getByRole('link', { name: /my events/i })
            .first()
            .click();
        await expect(page).toHaveURL(/\/my-events/);
    });

    test('navigates to Notifications page', async ({ page }) => {
        await page
            .getByRole('link', { name: /notifications/i })
            .first()
            .click();
        await expect(page).toHaveURL(/\/notifications-page/);
    });

    test('navigates to Profile page', async ({ page }) => {
        await page
            .getByRole('link', { name: /profile/i })
            .first()
            .click();
        await expect(page).toHaveURL(/\/profile-page/);
    });
});

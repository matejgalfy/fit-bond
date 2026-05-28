import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';

test.describe('Route guards (requires running backend)', () => {
    test('unauthenticated user is redirected to login from a protected page', async ({
        page,
    }) => {
        await page.goto('/pages/my-events');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    });

    test('non-admin user is redirected away from the admin area', async ({
        page,
    }) => {
        await registerViaUI(page, generateTestUser());
        await page.goto('/admin');
        await expect(page).toHaveURL(/\/pages\/home-page/, {
            timeout: 10_000,
        });
    });
});

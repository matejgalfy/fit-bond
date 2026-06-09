import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';

test.describe('Logout (requires running backend)', () => {
    test('user can log out and protected pages then redirect to login', async ({
        page,
    }) => {
        await registerViaUI(page, generateTestUser());

        await page.goto('/profile-page');
        await page.getByRole('button', { name: /log out/i }).click();
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });

        await page.goto('/my-events');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    });
});

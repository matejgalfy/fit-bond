import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI, loginViaUI } from './helpers/auth';

test.describe('Auth flow (requires running backend on localhost:3000)', () => {
    test('user can register and is redirected to home', async ({ page }) => {
        const user = generateTestUser();
        await registerViaUI(page, user);
        await expect(page).toHaveURL(/\/home-page/);
    });

    test('registered user can log in and is redirected to home', async ({
        page,
    }) => {
        const user = generateTestUser();
        await registerViaUI(page, user);

        await page.context().clearCookies();

        await loginViaUI(page, user);
        await expect(page).toHaveURL(/\/home-page/);
    });

    test('login with wrong password shows an error', async ({ page }) => {
        const user = generateTestUser();
        await registerViaUI(page, user);
        await page.context().clearCookies();

        await page.goto('/auth/login');
        await page.getByPlaceholder('Email address').fill(user.email);
        await page
            .getByPlaceholder('Password', { exact: true })
            .fill('WrongPassword123');
        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page.getByText(/sign in failed|invalid/i)).toBeVisible({
            timeout: 10_000,
        });
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('logged-in user visiting /auth/login is redirected to home', async ({
        page,
    }) => {
        const user = generateTestUser();
        await registerViaUI(page, user);

        await page.goto('/auth/login');
        await expect(page).toHaveURL(/\/home-page/, { timeout: 10_000 });
    });
});

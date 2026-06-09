import { test, expect } from '@playwright/test';

test.describe('Smoke — public routes (no backend required for these assertions)', () => {
    test('root redirects to login when not authenticated', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    });

    test('login page renders core elements', async ({ page }) => {
        await page.goto('/auth/login');
        await expect(
            page.getByRole('heading', { name: /welcome back/i })
        ).toBeVisible();
        await expect(page.getByPlaceholder('Email address')).toBeVisible();
        await expect(
            page.getByPlaceholder('Password', { exact: true })
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /sign in/i })
        ).toBeVisible();
    });

    test('register page renders core elements', async ({ page }) => {
        await page.goto('/auth/register');
        await expect(
            page.getByRole('heading', { name: /create your account/i })
        ).toBeVisible();
        await expect(page.getByPlaceholder('Full name')).toBeVisible();
        await expect(page.getByPlaceholder('Email address')).toBeVisible();
        await expect(page.getByPlaceholder('Confirm password')).toBeVisible();
    });

    test('login page links to register page', async ({ page }) => {
        await page.goto('/auth/login');
        await page.getByRole('link', { name: /create one/i }).click();
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('register page links back to login page', async ({ page }) => {
        await page.goto('/auth/register');
        await page.getByRole('link', { name: /sign in/i }).click();
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('login form shows validation error when fields are empty', async ({
        page,
    }) => {
        await page.goto('/auth/login');
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(
            page.getByText(/please fill in all fields/i).first()
        ).toBeVisible();
    });

    test('register form shows error when passwords do not match', async ({
        page,
    }) => {
        await page.goto('/auth/register');
        await page.getByPlaceholder('Full name').fill('Test User');
        await page.getByPlaceholder('Email address').fill('test@example.com');
        await page
            .getByPlaceholder('Password', { exact: true })
            .fill('Password123');
        await page.getByPlaceholder('Confirm password').fill('Different123');
        await page.getByRole('button', { name: /create account/i }).click();
        await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('register form shows error when password is too short', async ({
        page,
    }) => {
        await page.goto('/auth/register');
        await page.getByPlaceholder('Full name').fill('Test User');
        await page.getByPlaceholder('Email address').fill('test@example.com');
        await page.getByPlaceholder('Password', { exact: true }).fill('short');
        await page.getByPlaceholder('Confirm password').fill('short');
        await page.getByRole('button', { name: /create account/i }).click();
        await expect(
            page.getByText(/password must be at least 8 characters/i)
        ).toBeVisible();
    });
});

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface TestUser {
    name: string;
    email: string;
    password: string;
}

export function generateTestUser(): TestUser {
    const stamp = `${String(Date.now())}-${String(Math.floor(Math.random() * 10_000))}`;
    return {
        name: `E2E User ${stamp}`,
        email: `e2e-${stamp}@example.com`,
        password: 'TestPassword123',
    };
}

export async function registerViaUI(page: Page, user: TestUser): Promise<void> {
    await page.goto('/auth/register');
    await page.getByPlaceholder('Full name').fill(user.name);
    await page.getByPlaceholder('Email address').fill(user.email);
    await page
        .getByPlaceholder('Password', { exact: true })
        .fill(user.password);
    await page.getByPlaceholder('Confirm password').fill(user.password);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/\/pages\/home-page/, { timeout: 15_000 });
}

export async function loginViaUI(page: Page, user: TestUser): Promise<void> {
    await page.goto('/auth/login');
    await page.getByPlaceholder('Email address').fill(user.email);
    await page
        .getByPlaceholder('Password', { exact: true })
        .fill(user.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/pages\/home-page/, { timeout: 15_000 });
}

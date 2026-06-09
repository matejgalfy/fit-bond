import { execSync } from 'node:child_process';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';
import { generateTestUser, registerViaUI, type TestUser } from './auth';

function promoteToAdmin(email: string): void {
    const backendDir = path.join(process.cwd(), '..', 'backend');
    execSync(`bun run admin:promote -- --email ${email}`, {
        cwd: backendDir,
        stdio: 'pipe',
    });
}

export async function registerAdminViaUI(page: Page): Promise<TestUser> {
    const user = generateTestUser();
    await registerViaUI(page, user);
    promoteToAdmin(user.email);
    await page.goto('/admin');
    await expect(
        page.getByRole('heading', { name: /admin dashboard/i })
    ).toBeVisible({ timeout: 10_000 });
    return user;
}

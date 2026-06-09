import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';
import { createEventViaUI, eventDetailPath } from './helpers/events';
import { registerAdminViaUI } from './helpers/admin';

test.describe('Admin reports (requires running backend)', () => {
    test('admin can open a reported event and resolve the report', async ({
        browser,
    }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventName = `E2E Admin Report ${String(Date.now())}`;
        const eventId = await createEventViaUI(organizerPage, {
            name: eventName,
        });

        const reporterContext = await browser.newContext();
        const reporterPage = await reporterContext.newPage();
        await registerViaUI(reporterPage, generateTestUser());
        await reporterPage.goto(eventDetailPath(eventId));
        const reason = `Admin e2e reason ${String(Date.now())}`;
        await reporterPage.getByRole('button', { name: /^report$/i }).click();
        await reporterPage.locator('#event-report-reason').fill(reason);
        await reporterPage
            .getByRole('button', { name: /submit report/i })
            .click();
        await expect(reporterPage.getByText('Report submitted.')).toBeVisible({
            timeout: 10_000,
        });

        const adminContext = await browser.newContext();
        const adminPage = await adminContext.newPage();
        await registerAdminViaUI(adminPage);

        const reportRow = adminPage.getByRole('row', {
            name: new RegExp(reason),
        });
        await expect(reportRow).toBeVisible({ timeout: 10_000 });
        await reportRow.click();

        await expect(adminPage.getByText('Report Detail')).toBeVisible();
        await expect(
            adminPage.getByRole('definition').filter({ hasText: reason })
        ).toBeVisible();

        const [popup] = await Promise.all([
            adminContext.waitForEvent('page'),
            adminPage.getByRole('button', { name: /open event/i }).click(),
        ]);
        await expect(popup).toHaveURL(
            new RegExp(`/admin/event-detail-page\\?.*eventId=${eventId}`),
            { timeout: 10_000 }
        );
        await popup.close();

        await adminPage.getByRole('button', { name: /^resolve$/i }).click();
        const resolution = `Resolved by e2e ${String(Date.now())}`;
        await adminPage.getByPlaceholder(/resolution note/i).fill(resolution);
        await adminPage
            .getByRole('button', { name: /confirm resolve/i })
            .click();

        await expect(adminPage.getByText(resolution)).toBeVisible({
            timeout: 10_000,
        });

        await organizerContext.close();
        await reporterContext.close();
        await adminContext.close();
    });

    test('admin can open a reported comment and resolve the report', async ({
        browser,
    }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventName = `E2E Admin Comment Report ${String(Date.now())}`;
        const eventId = await createEventViaUI(organizerPage, {
            name: eventName,
        });

        const commenterContext = await browser.newContext();
        const commenterPage = await commenterContext.newPage();
        await registerViaUI(commenterPage, generateTestUser());
        await commenterPage.goto(eventDetailPath(eventId));
        await commenterPage
            .getByRole('button', { name: /join event/i })
            .click();
        const commentText = `Admin comment report ${String(Date.now())}`;
        await commenterPage
            .getByPlaceholder('Write a comment...')
            .fill(commentText);
        await commenterPage
            .getByRole('button', { name: /post comment/i })
            .click();
        await expect(commenterPage.getByText(commentText)).toBeVisible({
            timeout: 10_000,
        });

        await organizerPage.reload();
        const commentArticle = organizerPage
            .locator('article')
            .filter({ hasText: commentText });
        await expect(commentArticle).toBeVisible({ timeout: 10_000 });
        await commentArticle.getByRole('button', { name: /^report$/i }).click();
        await expect(
            organizerPage.getByRole('heading', { name: /report comment/i })
        ).toBeVisible();
        const reason = `Admin comment e2e reason ${String(Date.now())}`;
        await organizerPage
            .getByPlaceholder(/describe what moderators should review/i)
            .fill(reason);
        await organizerPage
            .getByRole('button', { name: /submit report/i })
            .click();
        await expect(organizerPage.getByText('Report submitted.')).toBeVisible({
            timeout: 10_000,
        });

        const adminContext = await browser.newContext();
        const adminPage = await adminContext.newPage();
        await registerAdminViaUI(adminPage);

        const reportRow = adminPage.getByRole('row', {
            name: new RegExp(reason),
        });
        await expect(reportRow).toBeVisible({ timeout: 10_000 });
        await reportRow.click();

        await expect(adminPage.getByText('Report Detail')).toBeVisible();
        await expect(
            adminPage.getByRole('definition').filter({ hasText: reason })
        ).toBeVisible();

        const [popup] = await Promise.all([
            adminContext.waitForEvent('page'),
            adminPage.getByRole('button', { name: /open comment/i }).click(),
        ]);
        await expect(popup).toHaveURL(
            (url) =>
                url.pathname.includes('/admin/event-detail-page') &&
                url.searchParams.get('eventId') === eventId &&
                Boolean(url.searchParams.get('commentId')),
            { timeout: 10_000 }
        );
        await popup.close();

        await adminPage.getByRole('button', { name: /^resolve$/i }).click();
        const resolution = `Comment resolved by e2e ${String(Date.now())}`;
        await adminPage.getByPlaceholder(/resolution note/i).fill(resolution);
        await adminPage
            .getByRole('button', { name: /confirm resolve/i })
            .click();

        await expect(adminPage.getByText(resolution)).toBeVisible({
            timeout: 10_000,
        });

        await organizerContext.close();
        await commenterContext.close();
        await adminContext.close();
    });
});

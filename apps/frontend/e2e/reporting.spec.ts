import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';
import { createEventViaUI, eventDetailPath } from './helpers/events';

test.describe('Reporting (requires running backend)', () => {
    test('a user can report an event', async ({ browser }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventId = await createEventViaUI(organizerPage, {
            name: `E2E Report ${String(Date.now())}`,
        });

        const reporterContext = await browser.newContext();
        const reporterPage = await reporterContext.newPage();
        await registerViaUI(reporterPage, generateTestUser());
        await reporterPage.goto(eventDetailPath(eventId));

        await reporterPage.getByRole('button', { name: /^report$/i }).click();
        await expect(
            reporterPage.getByRole('heading', { name: /report event/i })
        ).toBeVisible();

        await reporterPage
            .locator('#event-report-reason')
            .fill('Inappropriate content (e2e test).');
        await reporterPage
            .getByRole('button', { name: /submit report/i })
            .click();

        await expect(reporterPage.getByText('Report submitted.')).toBeVisible({
            timeout: 10_000,
        });

        await organizerContext.close();
        await reporterContext.close();
    });
});

import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';
import { createEventViaUI, eventDetailPath } from './helpers/events';

test.describe('Notifications (requires running backend)', () => {
    test('organizer is notified when someone joins, and can mark all read', async ({
        browser,
    }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventName = `E2E Notify ${String(Date.now())}`;
        const eventId = await createEventViaUI(organizerPage, {
            name: eventName,
        });

        const joinerContext = await browser.newContext();
        const joinerPage = await joinerContext.newPage();
        await registerViaUI(joinerPage, generateTestUser());
        await joinerPage.goto(eventDetailPath(eventId));
        await joinerPage.getByRole('button', { name: /join event/i }).click();
        await expect(
            joinerPage.getByRole('button', { name: /leave event/i })
        ).toBeVisible();

        await organizerPage.goto('/pages/notifications-page');
        await expect(
            organizerPage.getByText('New participant joined')
        ).toBeVisible({ timeout: 10_000 });
        await expect(
            organizerPage.getByText(new RegExp(eventName))
        ).toBeVisible();

        const markAllRead = organizerPage.getByRole('button', {
            name: /mark all as read/i,
        });
        await expect(markAllRead).toBeEnabled();
        await markAllRead.click();
        await expect(markAllRead).toBeDisabled();

        await organizerContext.close();
        await joinerContext.close();
    });
});

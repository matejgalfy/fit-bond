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

        await organizerPage.goto('/notifications-page');
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

    test('clicking a notification opens the related event detail', async ({
        browser,
    }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventName = `E2E Notify Redirect ${String(Date.now())}`;
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

        await organizerPage.goto('/notifications-page');
        const notification = organizerPage.getByRole('button', {
            name: /new participant joined/i,
        });
        await expect(notification).toBeVisible({ timeout: 10_000 });
        await notification.click();

        await expect(organizerPage).toHaveURL(
            new RegExp(`/event-detail-page\\?.*eventId=${eventId}`),
            { timeout: 10_000 }
        );
        await expect(
            organizerPage.getByRole('heading', { name: eventName })
        ).toBeVisible({ timeout: 10_000 });

        await organizerContext.close();
        await joinerContext.close();
    });

    test('clicking a comment notification scrolls to that comment', async ({
        browser,
    }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventName = `E2E Comment Notify ${String(Date.now())}`;
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
        const commentText = `Comment notify redirect ${String(Date.now())}`;
        await commenterPage
            .getByPlaceholder('Write a comment...')
            .fill(commentText);
        await commenterPage
            .getByRole('button', { name: /post comment/i })
            .click();
        await expect(commenterPage.getByText(commentText)).toBeVisible({
            timeout: 10_000,
        });

        await organizerPage.goto('/notifications-page');
        const notification = organizerPage.getByRole('button', {
            name: /new comment on your event/i,
        });
        await expect(notification).toBeVisible({ timeout: 10_000 });
        await notification.click();

        await expect(organizerPage).toHaveURL(
            (url) =>
                url.pathname.includes('/event-detail-page') &&
                url.searchParams.get('eventId') === eventId &&
                Boolean(url.searchParams.get('commentId')),
            { timeout: 10_000 }
        );

        const comment = organizerPage.getByText(commentText);
        await expect(comment).toBeVisible({ timeout: 10_000 });
        await expect(comment).toBeInViewport();

        await organizerContext.close();
        await commenterContext.close();
    });
});

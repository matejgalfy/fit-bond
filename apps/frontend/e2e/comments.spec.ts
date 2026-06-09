import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';
import { createEventViaUI, eventDetailPath } from './helpers/events';

test.describe('Event comments (requires running backend)', () => {
    test('an organizer can post a comment on their event', async ({ page }) => {
        await registerViaUI(page, generateTestUser());
        const eventName = `E2E Comment ${String(Date.now())}`;
        await createEventViaUI(page, { name: eventName });

        await expect(page.getByText(/Discussion \(0\)/)).toBeVisible();

        const commentText = `Looking forward to this! ${String(Date.now())}`;
        await page.getByPlaceholder('Write a comment...').fill(commentText);
        await page.getByRole('button', { name: /post comment/i }).click();

        await expect(page.getByText(commentText)).toBeVisible({
            timeout: 10_000,
        });
        await expect(page.getByText(/Discussion \(1\)/)).toBeVisible();
    });

    test("another participant's comment is visible to the organizer", async ({
        browser,
    }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventName = `E2E Comment X ${String(Date.now())}`;
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
        await expect(
            commenterPage.getByRole('button', { name: /leave event/i })
        ).toBeVisible();

        const commentText = `Great event! ${String(Date.now())}`;
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
        await expect(organizerPage.getByText(commentText)).toBeVisible({
            timeout: 10_000,
        });
        await expect(organizerPage.getByText(/Discussion \(1\)/)).toBeVisible();

        await organizerContext.close();
        await commenterContext.close();
    });

    test("clicking a comment author opens that author's profile", async ({
        browser,
    }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventName = `E2E Comment Author ${String(Date.now())}`;
        const eventId = await createEventViaUI(organizerPage, {
            name: eventName,
        });

        const commenterContext = await browser.newContext();
        const commenterPage = await commenterContext.newPage();
        const commenter = generateTestUser();
        await registerViaUI(commenterPage, commenter);
        await commenterPage.goto(eventDetailPath(eventId));
        await commenterPage
            .getByRole('button', { name: /join event/i })
            .click();
        const commentText = `Author link test ${String(Date.now())}`;
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
        await expect(organizerPage.getByText(commentText)).toBeVisible({
            timeout: 10_000,
        });

        await organizerPage.getByRole('link', { name: commenter.name }).click();

        await expect(organizerPage).toHaveURL(/profile-page\?.*userId=/, {
            timeout: 10_000,
        });
        await expect(
            organizerPage.getByRole('heading', {
                name: new RegExp(`${commenter.name}'s Profile`),
            })
        ).toBeVisible({ timeout: 10_000 });

        await organizerContext.close();
        await commenterContext.close();
    });
});

import { test, expect } from '@playwright/test';
import { generateTestUser, registerViaUI } from './helpers/auth';
import { createEventViaUI, eventDetailPath } from './helpers/events';

test.describe('Event participation (requires running backend)', () => {
    test('a second user can join then leave an event', async ({ browser }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventName = `E2E Join ${String(Date.now())}`;
        const eventId = await createEventViaUI(organizerPage, {
            name: eventName,
        });

        const joinerContext = await browser.newContext();
        const joinerPage = await joinerContext.newPage();
        const joiner = generateTestUser();
        await registerViaUI(joinerPage, joiner);
        await joinerPage.goto(eventDetailPath(eventId));

        await expect(
            joinerPage.getByText('0 of 10 spots filled')
        ).toBeVisible();

        const joinButton = joinerPage.getByRole('button', {
            name: /join event/i,
        });
        await expect(joinButton).toBeEnabled();
        await joinButton.click();

        await expect(
            joinerPage.getByRole('button', { name: /leave event/i })
        ).toBeVisible();
        await expect(
            joinerPage.getByText('1 of 10 spots filled')
        ).toBeVisible();
        await expect(joinerPage.getByText(joiner.name)).toBeVisible();

        await joinerPage.getByRole('button', { name: /leave event/i }).click();
        await expect(
            joinerPage.getByRole('button', { name: /join event/i })
        ).toBeVisible();
        await expect(
            joinerPage.getByText('0 of 10 spots filled')
        ).toBeVisible();

        await organizerContext.close();
        await joinerContext.close();
    });

    test('a second user can mark and unmark interest', async ({ browser }) => {
        const organizerContext = await browser.newContext();
        const organizerPage = await organizerContext.newPage();
        await registerViaUI(organizerPage, generateTestUser());
        const eventName = `E2E Interest ${String(Date.now())}`;
        const eventId = await createEventViaUI(organizerPage, {
            name: eventName,
        });

        const userContext = await browser.newContext();
        const userPage = await userContext.newPage();
        await registerViaUI(userPage, generateTestUser());
        await userPage.goto(eventDetailPath(eventId));

        await expect(
            userPage.getByText('0 users marked interest')
        ).toBeVisible();

        const interestedButton = userPage.getByRole('button', {
            name: /interested/i,
        });
        await expect(interestedButton).toBeEnabled();
        await interestedButton.click();

        await expect(
            userPage.getByText('1 users marked interest')
        ).toBeVisible();

        await userPage.getByRole('button', { name: /interested/i }).click();
        await expect(
            userPage.getByText('0 users marked interest')
        ).toBeVisible();

        await organizerContext.close();
        await userContext.close();
    });
});

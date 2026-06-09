import { expect, type Page } from '@playwright/test';

export const MOCK_LOCATION = {
    placeId: 'mock-place-id-1',
    displayName: 'Mock Stadium, Brno',
    fullAddress: 'Mock Stadium, Brno, Czech Republic',
    formattedAddress: 'Mock Stadium, Brno',
    lat: 49.195061,
    lng: 16.606837,
};

export async function mockLocationSearch(page: Page): Promise<void> {
    await page.route('**/locations/search**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([MOCK_LOCATION]),
        });
    });
}

export async function pickDateDaysAhead(
    page: Page,
    daysAhead: number
): Promise<void> {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);

    const now = new Date();
    const monthsAhead =
        (target.getFullYear() - now.getFullYear()) * 12 +
        (target.getMonth() - now.getMonth());

    await page.locator('#event-date').click();
    const calendar = page.locator('[data-slot="popover-content"]');
    await calendar.waitFor({ state: 'visible' });

    for (let i = 0; i < monthsAhead; i++) {
        await calendar.getByRole('button', { name: 'Next month' }).click();
    }

    await calendar
        .locator('button:not(.text-tertiary-text)')
        .filter({ hasText: new RegExp(`^${String(target.getDate())}$`) })
        .click();
}

export interface CreateEventOptions {
    name: string;
    capacity?: number;
}

export async function createEventViaUI(
    page: Page,
    { name, capacity = 10 }: CreateEventOptions
): Promise<string> {
    await mockLocationSearch(page);

    await page.goto('/create-event');
    await expect(
        page.getByRole('heading', { name: /create new event/i })
    ).toBeVisible();

    await page.locator('#event-name').fill(name);

    const sportTrigger = page.locator('#sport-type');
    await expect(sportTrigger).toBeEnabled({ timeout: 10_000 });
    await sportTrigger.click();
    const firstSport = page.getByRole('option').first();
    await firstSport.waitFor({ state: 'visible', timeout: 10_000 });
    await firstSport.click();

    await page
        .locator('#event-description')
        .fill('Created by Playwright e2e test.');

    await pickDateDaysAhead(page, 30);

    await page.getByLabel('Start hour').fill('10');
    await page.getByLabel('Start minute').fill('30');

    await page.locator('#event-location').click();
    const locationSearchInput = page.getByPlaceholder('Search address...');
    await locationSearchInput.waitFor({ state: 'visible' });
    await locationSearchInput.fill('Mock');
    const mockOption = page.getByRole('option', { name: /mock stadium/i });
    await mockOption.waitFor({ state: 'visible', timeout: 10_000 });
    await mockOption.click();

    await page.locator('#event-capacity').fill(String(capacity));

    await page.getByRole('button', { name: /publish event/i }).click();
    await expect(page).toHaveURL(/\/my-events/, { timeout: 15_000 });

    await page.getByRole('heading', { name }).click();
    await expect(page).toHaveURL(/eventId=/, { timeout: 10_000 });

    const eventId = new URL(page.url()).searchParams.get('eventId');
    if (!eventId) {
        throw new Error(
            'Could not determine the created event id from the URL'
        );
    }
    return eventId;
}

export function eventDetailPath(eventId: string): string {
    return `/event-detail-page?eventId=${eventId}`;
}

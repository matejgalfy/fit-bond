import { t } from 'elysia';

export const baseLocationSchema = t.Object({
    id: t.String(),
    fullAddress: t.String(),
    formattedAddress: t.String(),
    lat: t.String(),
    lng: t.String(),
    deletedAt: t.Union([t.Date(), t.Null()]),
});

export const locationInputSchema = t.Object({
    placeId: t.String({ minLength: 1, maxLength: 300 }),
    fullAddress: t.String({ minLength: 1, maxLength: 500 }),
    formattedAddress: t.String({ minLength: 1, maxLength: 200 }),
    lat: t.Number({ minimum: -90, maximum: 90 }),
    lng: t.Number({ minimum: -180, maximum: 180 }),
});

export const locationSearchQuery = t.Object({
    q: t.String({ minLength: 2, maxLength: 200 }),
});

export const locationSuggestionSchema = t.Object({
    placeId: t.String(),
    displayName: t.String(),
    fullAddress: t.String(),
    formattedAddress: t.String(),
    lat: t.Number(),
    lng: t.Number(),
});

export const locationSuggestionsResponse = t.Array(locationSuggestionSchema);

export type LocationInput = typeof locationInputSchema.static;
export type LocationSearchQuery = typeof locationSearchQuery.static;
export type LocationSuggestion = typeof locationSuggestionSchema.static;

export interface GeocodeSuggestion {
    placeId: string;
    displayName: string;
    fullAddress: string;
    formattedAddress: string;
    lat: number;
    lng: number;
}

export class GeocodingError extends Error {
    constructor(
        message: string,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = 'GeocodingError';
    }
}

interface LocationIQAddress {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
}

interface LocationIQResult {
    place_id?: string | number;
    osm_id?: string | number;
    osm_type?: string;
    display_name?: string;
    lat?: string;
    lon?: string;
    address?: LocationIQAddress;
}

const LOCATIONIQ_BASE = 'https://api.locationiq.com/v1/autocomplete';

function normalizeAddress(addr: LocationIQAddress | undefined): string {
    if (!addr) return '';
    const street = [addr.house_number, addr.road ?? addr.pedestrian]
        .filter(Boolean)
        .join(' ');
    return (
        street ||
        (addr.neighbourhood ?? addr.suburb ?? addr.road ?? '')
    ).trim();
}

function normalizeCity(addr: LocationIQAddress | undefined): string {
    if (!addr) return '';
    return (
        addr.city ??
        addr.town ??
        addr.village ??
        addr.municipality ??
        ''
    ).trim();
}

function buildPlaceId(r: LocationIQResult): string | null {
    if (r.place_id !== undefined) {
        return String(r.place_id);
    }
    // Fallback: derive a stable key from osm_type+osm_id when place_id is missing
    if (r.osm_id !== undefined && r.osm_type) {
        return `osm:${r.osm_type}:${String(r.osm_id)}`;
    }
    return null;
}

export async function searchAddresses(
    query: string,
    limit = 5
): Promise<GeocodeSuggestion[]> {
    const apiKey = process.env.LOCATIONIQ_API_KEY;
    if (!apiKey) {
        throw new GeocodingError('LOCATIONIQ_API_KEY is not configured');
    }

    const url = new URL(LOCATIONIQ_BASE);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('dedupe', '1');
    url.searchParams.set('normalizecity', '1');
    url.searchParams.set('format', 'json');

    let response: Response;
    try {
        response = await fetch(url, {
            headers: { Accept: 'application/json' },
        });
    } catch (cause) {
        throw new GeocodingError('Failed to reach LocationIQ', cause);
    }

    if (response.status === 404) {
        // LocationIQ returns 404 when no results match — surface as empty list.
        return [];
    }

    if (!response.ok) {
        throw new GeocodingError(
            `LocationIQ responded with status ${String(response.status)}`
        );
    }

    let raw: unknown;
    try {
        raw = await response.json();
    } catch (cause) {
        throw new GeocodingError('LocationIQ returned invalid JSON', cause);
    }

    if (!Array.isArray(raw)) {
        return [];
    }

    const suggestions: GeocodeSuggestion[] = [];
    for (const item of raw as LocationIQResult[]) {
        const placeId = buildPlaceId(item);
        if (!placeId || !item.lat || !item.lon) continue;
        const lat = Number(item.lat);
        const lng = Number(item.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

        const city = normalizeCity(item.address);
        const country = item.address?.country ?? '';
        const street = normalizeAddress(item.address);
        const fullAddress = item.display_name ?? (street || city);
        const formattedAddress =
            city && country
                ? `${city}, ${country}`
                : city || country || fullAddress;
        const displayName = fullAddress;

        suggestions.push({
            placeId,
            displayName,
            fullAddress,
            formattedAddress,
            lat,
            lng,
        });
    }
    return suggestions;
}

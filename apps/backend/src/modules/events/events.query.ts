import {
    eq,
    and,
    or,
    ilike,
    gte,
    lte,
    not,
    exists,
    ne,
    inArray,
    sql,
    type SQL,
} from 'drizzle-orm';
import type { Database } from '../../db';
import {
    events,
    user,
    locations,
    sports,
    eventParticipants,
    eventInterested,
} from '../../db/schema';
import type { EventFilters } from './events.types';

// Correlated counts reused by every event-list selection.
export const currentParticipantsCount = sql<number>`(
    SELECT COUNT(*)::int FROM ${eventParticipants}
    WHERE ${eventParticipants.eventId} = ${events.id}
)`.as('current_participants');

export const currentInterestedCount = sql<number>`(
    SELECT COUNT(*)::int FROM ${eventInterested}
    WHERE ${eventInterested.eventId} = ${events.id}
)`.as('current_interested');

// Columns shared by the public list and the admin list views. Admin extends
// this with cancellationReason/deletedAt and organizer.banned.
export const baseEventSelection = {
    id: events.id,
    name: events.name,
    description: events.description,
    skillLevel: events.skillLevel,
    startTime: events.startTime,
    duration: events.duration,
    capacity: events.capacity,
    isPublic: events.isPublic,
    coverImageUrl: events.coverImageUrl,
    cancelledAt: events.cancelledAt,
    createdAt: events.createdAt,
    currentParticipants: currentParticipantsCount,
    currentInterested: currentInterestedCount,
    organizer: {
        id: user.id,
        name: user.name,
        image: user.image,
    },
    location: {
        id: locations.id,
        formattedAddress: locations.formatted_address,
    },
    sport: {
        id: sports.id,
        name: sports.name,
        iconUrl: sports.iconUrl,
    },
};

// Subset of filters that drive the conditions/join logic common to the public
// and admin event listings. Both EventFilters and AdminEventFilters satisfy it.
export type SharedEventFilters = Pick<
    EventFilters,
    | 'sportIds'
    | 'lat'
    | 'lng'
    | 'radius'
    | 'skillLevel'
    | 'search'
    | 'fromDate'
    | 'toDate'
    | 'city'
    | 'date'
    | 'userId'
    | 'userRelation'
    | 'excludeUserInteractions'
>;

/**
 * Builds the WHERE conditions common to both the public and admin event
 * listings. Callers prepend their own visibility conditions (soft-delete,
 * cancellation, public/private) before passing the result to `and(...)`.
 */
export function buildSharedEventConditions(
    db: Database,
    filters: SharedEventFilters
): SQL[] {
    const conditions: SQL[] = [];

    if (filters.sportIds && filters.sportIds.length > 0) {
        conditions.push(inArray(events.sportId, filters.sportIds));
    }

    // Haversine in WHERE forces a full scan — no spatial index can be
    // used. Acceptable while the events table is small; if it grows,
    // switch to PostGIS or pre-filter by a bounding box on lat/lng.
    if (
        filters.lat !== undefined &&
        filters.lng !== undefined &&
        filters.radius !== undefined
    ) {
        const distance = sql<number>`(
            6371 * acos(
                cos(radians(${filters.lat})) * cos(radians(${locations.lat})) *
                cos(radians(${locations.lng}) - radians(${filters.lng})) +
                sin(radians(${filters.lat})) * sin(radians(${locations.lat}))
            )
        )`;
        conditions.push(lte(distance, filters.radius));
    }

    if (filters.skillLevel) {
        conditions.push(eq(events.skillLevel, filters.skillLevel));
    }
    if (filters.search) {
        const searchCondition = or(
            ilike(events.name, `%${filters.search}%`),
            ilike(sports.name, `%${filters.search}%`)
        );
        if (searchCondition) {
            conditions.push(searchCondition);
        }
    }
    if (filters.fromDate) {
        conditions.push(gte(events.startTime, new Date(filters.fromDate)));
    }
    if (filters.toDate) {
        conditions.push(lte(events.startTime, new Date(filters.toDate)));
    }
    if (filters.city) {
        conditions.push(
            ilike(locations.formatted_address, `%${filters.city}%`)
        );
    }
    if (filters.date) {
        conditions.push(eq(sql`${events.startTime}::date`, filters.date));
    }

    // Events organized by the given user.
    if (filters.userId && filters.userRelation === 'organized') {
        conditions.push(eq(events.organizerId, filters.userId));
    }

    // Exclude events the user already interacts with (discovery feed).
    if (filters.userId && filters.excludeUserInteractions) {
        const userId = filters.userId;
        conditions.push(ne(events.organizerId, userId));
        conditions.push(
            not(
                exists(
                    db
                        .select()
                        .from(eventParticipants)
                        .where(
                            and(
                                eq(eventParticipants.eventId, events.id),
                                eq(eventParticipants.userId, userId)
                            )
                        )
                )
            )
        );
        conditions.push(
            not(
                exists(
                    db
                        .select()
                        .from(eventInterested)
                        .where(
                            and(
                                eq(eventInterested.eventId, events.id),
                                eq(eventInterested.userId, userId)
                            )
                        )
                )
            )
        );
    }

    return conditions;
}

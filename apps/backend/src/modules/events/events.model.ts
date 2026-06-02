import { eq, and, isNull, desc, count, sql } from 'drizzle-orm';
import type { Database } from '../../db';
import { firstOrNull, firstOrThrow } from '../../utils/query';
import { DEFAULT_PAGE_SIZE, DEFAULT_OFFSET } from '../../utils/pagination';
import {
    events,
    user,
    locations,
    sports,
    eventParticipants,
    eventInterested,
} from '../../db/schema';
import type {
    EventFilters,
    CreateEventInput,
    UpdateEventInput,
} from './events.types';
import { baseEventSelection, buildSharedEventConditions } from './events.query';

export const eventsModel = {
    async findAll(db: Database, filters: EventFilters) {
        const conditions = [isNull(events.deletedAt)];

        if (filters.excludeUserInteractions) {
            conditions.push(isNull(events.cancelledAt));
        }
        if (filters.isPublic !== undefined) {
            conditions.push(eq(events.isPublic, filters.isPublic));
        }
        conditions.push(...buildSharedEventConditions(db, filters));

        const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
        const offset = filters.offset ?? DEFAULT_OFFSET;

        let query = db
            .select(baseEventSelection)
            .from(events)
            .innerJoin(user, eq(events.organizerId, user.id))
            .innerJoin(locations, eq(events.locationId, locations.id))
            .innerJoin(sports, eq(events.sportId, sports.id));

        // Add conditional joins for joined/interested relations
        if (filters.userId && filters.userRelation === 'joined') {
            query = query.innerJoin(
                eventParticipants,
                and(
                    eq(eventParticipants.eventId, events.id),
                    eq(eventParticipants.userId, filters.userId)
                )
            );
        } else if (filters.userId && filters.userRelation === 'interested') {
            query = query.innerJoin(
                eventInterested,
                and(
                    eq(eventInterested.eventId, events.id),
                    eq(eventInterested.userId, filters.userId)
                )
            );
        }

        return query
            .where(and(...conditions))
            .orderBy(desc(events.startTime))
            .limit(limit)
            .offset(offset);
    },

    async findById(db: Database, id: string) {
        const results = await db
            .select({
                id: events.id,
                organizerId: events.organizerId,
                name: events.name,
                description: events.description,
                skillLevel: events.skillLevel,
                startTime: events.startTime,
                duration: events.duration,
                capacity: events.capacity,
                isPublic: events.isPublic,
                coverImageUrl: events.coverImageUrl,
                cancelledAt: events.cancelledAt,
                cancellationReason: events.cancellationReason,
                createdAt: events.createdAt,
                updatedAt: events.updatedAt,
                currentParticipants: sql<number>`(
                    SELECT COUNT(*)::int FROM ${eventParticipants}
                    WHERE ${eventParticipants.eventId} = ${events.id}
                )`.as('current_participants'),
                currentInterested: sql<number>`(
                    SELECT COUNT(*)::int FROM ${eventInterested}
                    WHERE ${eventInterested.eventId} = ${events.id}
                )`.as('current_interested'),
                organizer: {
                    id: user.id,
                    name: user.name,
                    image: user.image,
                },
                location: {
                    id: locations.id,
                    fullAddress: locations.full_address,
                    formattedAddress: locations.formatted_address,
                    lat: locations.lat,
                    lng: locations.lng,
                },
                sport: {
                    id: sports.id,
                    name: sports.name,
                    iconUrl: sports.iconUrl,
                },
            })
            .from(events)
            .innerJoin(user, eq(events.organizerId, user.id))
            .innerJoin(locations, eq(events.locationId, locations.id))
            .innerJoin(sports, eq(events.sportId, sports.id))
            .where(and(eq(events.id, id), isNull(events.deletedAt)));

        return firstOrNull(results);
    },

    async findRawById(db: Database, id: string) {
        const results = await db
            .select()
            .from(events)
            .where(and(eq(events.id, id), isNull(events.deletedAt)));

        return firstOrNull(results);
    },

    async create(
        db: Database,
        organizerId: string,
        locationId: string,
        input: CreateEventInput
    ) {
        const results = await db
            .insert(events)
            .values({
                organizerId,
                locationId,
                sportId: input.sportId,
                name: input.name,
                description: input.description,
                skillLevel: input.skillLevel,
                startTime: new Date(input.startTime),
                duration: input.duration,
                capacity: input.capacity,
                isPublic: input.isPublic ?? true,
                coverImageUrl: input.coverImageUrl,
            })
            .returning();

        return firstOrThrow(results, 'Failed to create event');
    },

    async update(
        db: Database,
        id: string,
        input: UpdateEventInput,
        locationId?: string
    ) {
        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined)
            updateData.description = input.description;
        if (input.skillLevel !== undefined)
            updateData.skillLevel = input.skillLevel;
        if (input.startTime !== undefined)
            updateData.startTime = new Date(input.startTime);
        if (input.duration !== undefined) updateData.duration = input.duration;
        if (input.capacity !== undefined) updateData.capacity = input.capacity;
        if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;
        if (input.coverImageUrl !== undefined)
            updateData.coverImageUrl = input.coverImageUrl;
        if (locationId !== undefined) updateData.locationId = locationId;

        const results = await db
            .update(events)
            .set(updateData)
            .where(and(eq(events.id, id), isNull(events.deletedAt)))
            .returning();

        return firstOrNull(results);
    },

    async cancel(db: Database, id: string, reason?: string) {
        const results = await db
            .update(events)
            .set({
                cancelledAt: new Date(),
                cancellationReason: reason,
                updatedAt: new Date(),
            })
            .where(and(eq(events.id, id), isNull(events.deletedAt)))
            .returning();

        return firstOrNull(results);
    },

    async softDelete(db: Database, id: string) {
        const results = await db
            .update(events)
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where(and(eq(events.id, id), isNull(events.deletedAt)))
            .returning();

        return firstOrNull(results);
    },

    async getStatsByUserId(db: Database, userId: string) {
        // Count organized events
        const organizedResult = await db
            .select({ count: count() })
            .from(events)
            .where(
                and(eq(events.organizerId, userId), isNull(events.deletedAt))
            );

        // Count joined events
        const joinedResult = await db
            .select({ count: count() })
            .from(eventParticipants)
            .innerJoin(
                events,
                and(
                    eq(eventParticipants.eventId, events.id),
                    isNull(events.deletedAt)
                )
            )
            .where(eq(eventParticipants.userId, userId));

        // Count interested events
        const interestedResult = await db
            .select({ count: count() })
            .from(eventInterested)
            .innerJoin(
                events,
                and(
                    eq(eventInterested.eventId, events.id),
                    isNull(events.deletedAt)
                )
            )
            .where(eq(eventInterested.userId, userId));

        return {
            organized: organizedResult[0]?.count ?? 0,
            joined: joinedResult[0]?.count ?? 0,
            interested: interestedResult[0]?.count ?? 0,
        };
    },
};

export type EventsModel = typeof eventsModel;

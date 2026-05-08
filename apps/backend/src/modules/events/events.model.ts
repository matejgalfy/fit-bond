import {
    eq,
    and,
    or,
    ilike,
    gte,
    lte,
    isNull,
    desc,
    count,
    not,
    exists,
    ne,
    sql,
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
import type {
    EventFilters,
    CreateEventInput,
    UpdateEventInput,
} from './events.types';

export const eventsModel = {
    async findAll(db: Database, filters: EventFilters) {
        const conditions = [isNull(events.deletedAt)];

        if (filters.excludeUserInteractions) {
            conditions.push(isNull(events.cancelledAt));
        }
        if (filters.sportId) {
            conditions.push(eq(events.sportId, filters.sportId));
        }
        if (filters.skillLevel) {
            conditions.push(eq(events.skillLevel, filters.skillLevel));
        }
        if (filters.isPublic !== undefined) {
            conditions.push(eq(events.isPublic, filters.isPublic));
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

        // User relation filtering
        if (filters.userId && filters.userRelation === 'organized') {
            conditions.push(eq(events.organizerId, filters.userId));
        }

        // Exclude events with user interactions (for discovery)
        if (filters.userId && filters.excludeUserInteractions) {
            // Exclude events organized by user
            conditions.push(ne(events.organizerId, filters.userId));

            // Exclude events user has joined
            conditions.push(
                not(
                    exists(
                        db
                            .select()
                            .from(eventParticipants)
                            .where(
                                and(
                                    eq(eventParticipants.eventId, events.id),
                                    eq(eventParticipants.userId, filters.userId)
                                )
                            )
                    )
                )
            );

            // Exclude events user is interested in
            conditions.push(
                not(
                    exists(
                        db
                            .select()
                            .from(eventInterested)
                            .where(
                                and(
                                    eq(eventInterested.eventId, events.id),
                                    eq(eventInterested.userId, filters.userId)
                                )
                            )
                    )
                )
            );
        }

        const limit = filters.limit ?? 20;
        const offset = filters.offset ?? 0;

        let query = db
            .select({
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
                    formattedAddress: locations.formatted_address,
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

        if (results.length === 0) return null;
        return results[0];
    },

    async findRawById(db: Database, id: string) {
        const results = await db
            .select()
            .from(events)
            .where(and(eq(events.id, id), isNull(events.deletedAt)));

        if (results.length === 0) return null;
        return results[0];
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

        if (results.length === 0) {
            throw new Error('Failed to create event');
        }
        return results[0];
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

        if (results.length === 0) return null;
        return results[0];
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

        if (results.length === 0) return null;
        return results[0];
    },

    async softDelete(db: Database, id: string) {
        const results = await db
            .update(events)
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where(and(eq(events.id, id), isNull(events.deletedAt)))
            .returning();

        if (results.length === 0) return null;
        return results[0];
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

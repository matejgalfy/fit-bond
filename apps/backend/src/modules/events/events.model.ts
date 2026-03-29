import { eq, and, ilike, gte, lte, isNull, desc } from 'drizzle-orm';
import type { Database } from '../../db';
import { events, users, locations, sports } from '../../db/schema';
import type {
    EventFilters,
    CreateEventInput,
    UpdateEventInput,
} from './events.types';

export const eventsModel = {
    async findAll(db: Database, filters: EventFilters) {
        const conditions = [isNull(events.deletedAt)];

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
            conditions.push(ilike(events.name, `%${filters.search}%`));
        }
        if (filters.fromDate) {
            conditions.push(gte(events.startTime, new Date(filters.fromDate)));
        }
        if (filters.toDate) {
            conditions.push(lte(events.startTime, new Date(filters.toDate)));
        }
        if (filters.city) {
            conditions.push(ilike(locations.city, `%${filters.city}%`));
        }

        const limit = filters.limit ?? 20;
        const offset = filters.offset ?? 0;

        return db
            .select({
                id: events.id,
                name: events.name,
                description: events.description,
                skillLevel: events.skillLevel,
                startTime: events.startTime,
                duration: events.duration,
                capacity: events.capacity,
                currentParticipants: events.currentParticipants,
                isPublic: events.isPublic,
                coverImageUrl: events.coverImageUrl,
                cancelledAt: events.cancelledAt,
                createdAt: events.createdAt,
                organizer: {
                    id: users.id,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    profilePictureUrl: users.profilePictureUrl,
                },
                location: {
                    id: locations.id,
                    city: locations.city,
                    country: locations.country,
                },
                sport: {
                    id: sports.id,
                    name: sports.name,
                    iconUrl: sports.iconUrl,
                },
            })
            .from(events)
            .innerJoin(users, eq(events.organizerId, users.id))
            .innerJoin(locations, eq(events.locationId, locations.id))
            .innerJoin(sports, eq(events.sportId, sports.id))
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
                currentParticipants: events.currentParticipants,
                isPublic: events.isPublic,
                coverImageUrl: events.coverImageUrl,
                cancelledAt: events.cancelledAt,
                cancellationReason: events.cancellationReason,
                createdAt: events.createdAt,
                updatedAt: events.updatedAt,
                organizer: {
                    id: users.id,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    profilePictureUrl: users.profilePictureUrl,
                },
                location: {
                    id: locations.id,
                    address: locations.address,
                    city: locations.city,
                    country: locations.country,
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
            .innerJoin(users, eq(events.organizerId, users.id))
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

    async create(db: Database, organizerId: string, input: CreateEventInput) {
        const results = await db
            .insert(events)
            .values({
                organizerId,
                locationId: input.locationId,
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

    async update(db: Database, id: string, input: UpdateEventInput) {
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
};

export type EventsModel = typeof eventsModel;

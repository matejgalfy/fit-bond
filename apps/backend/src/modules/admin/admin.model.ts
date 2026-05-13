import {
    eq,
    and,
    or,
    ilike,
    gte,
    lte,
    isNull,
    isNotNull,
    desc,
    not,
    exists,
    ne,
    inArray,
    sql,
} from 'drizzle-orm';
import type { Database } from '../../db';
import {
    user,
    events,
    locations,
    sports,
    eventParticipants,
    eventInterested,
} from '../../db/schema';
import type {
    AdminUserFilters,
    AdminEventFilters,
    UpdateUserAdminInput,
} from './admin.types';

export const adminModel = {
    async searchUsers(db: Database, filters: AdminUserFilters) {
        const conditions = [];

        if (!filters.includeDeleted) {
            conditions.push(isNull(user.deletedAt));
        }
        if (filters.search) {
            const term = `%${filters.search}%`;
            const searchCondition = or(
                ilike(user.name, term),
                ilike(user.email, term)
            );
            if (searchCondition) {
                conditions.push(searchCondition);
            }
        }
        if (filters.role) {
            conditions.push(eq(user.role, filters.role));
        }
        if (filters.banned === true) {
            conditions.push(isNotNull(user.bannedReason));
        } else if (filters.banned === false) {
            conditions.push(isNull(user.bannedReason));
        }

        const limit = filters.limit ?? 20;
        const offset = filters.offset ?? 0;

        return db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                bio: user.bio,
                role: user.role,
                bannedReason: user.bannedReason,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                deletedAt: user.deletedAt,
            })
            .from(user)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(user.createdAt))
            .limit(limit)
            .offset(offset);
    },

    async findUserById(db: Database, id: string) {
        const results = await db.select().from(user).where(eq(user.id, id));
        if (results.length === 0) return null;
        return results[0];
    },

    async setBannedReason(
        db: Database,
        id: string,
        bannedReason: string | null
    ) {
        const results = await db
            .update(user)
            .set({ bannedReason, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();
        if (results.length === 0) return null;
        return results[0];
    },

    async updateUser(db: Database, id: string, input: UpdateUserAdminInput) {
        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        };
        if (input.name !== undefined) updateData.name = input.name;
        if (input.bio !== undefined) updateData.bio = input.bio;
        if (input.image !== undefined) updateData.image = input.image;
        if (input.role !== undefined) updateData.role = input.role;

        const results = await db
            .update(user)
            .set(updateData)
            .where(eq(user.id, id))
            .returning();
        if (results.length === 0) return null;
        return results[0];
    },

    async softDeleteUser(db: Database, id: string) {
        const results = await db
            .update(user)
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where(and(eq(user.id, id), isNull(user.deletedAt)))
            .returning();
        if (results.length === 0) return null;
        return results[0];
    },

    async searchEvents(db: Database, filters: AdminEventFilters) {
        const conditions = [];

        if (!filters.includeDeleted) {
            conditions.push(isNull(events.deletedAt));
        }
        if (!filters.includeCancelled) {
            conditions.push(isNull(events.cancelledAt));
        }
        if (!filters.includePrivate) {
            conditions.push(eq(events.isPublic, true));
        }
        if (filters.sportIds && filters.sportIds.length > 0) {
            conditions.push(inArray(events.sportId, filters.sportIds));
        }
        if (filters.skillLevel) {
            conditions.push(eq(events.skillLevel, filters.skillLevel));
        }
        if (filters.search) {
            const term = `%${filters.search}%`;
            const searchCondition = or(
                ilike(events.name, term),
                ilike(sports.name, term)
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
        if (filters.userId && filters.userRelation === 'organized') {
            conditions.push(eq(events.organizerId, filters.userId));
        }
        if (filters.userId && filters.excludeUserInteractions) {
            conditions.push(ne(events.organizerId, filters.userId));
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
                cancellationReason: events.cancellationReason,
                createdAt: events.createdAt,
                deletedAt: events.deletedAt,
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
                    bannedReason: user.bannedReason,
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
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(events.startTime))
            .limit(limit)
            .offset(offset);
    },
};

export type AdminModel = typeof adminModel;

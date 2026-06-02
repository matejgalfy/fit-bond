import { eq, and, or, ilike, isNull, desc } from 'drizzle-orm';
import { DEFAULT_PAGE_SIZE, DEFAULT_OFFSET } from '../../utils/pagination';
import type { Database } from '../../db';
import { firstOrNull } from '../../utils/query';
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
import {
    baseEventSelection,
    buildSharedEventConditions,
} from '../events/events.query';

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
            conditions.push(eq(user.banned, true));
        } else if (filters.banned === false) {
            const notBanned = or(isNull(user.banned), eq(user.banned, false));
            if (notBanned) {
                conditions.push(notBanned);
            }
        }

        const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
        const offset = filters.offset ?? DEFAULT_OFFSET;

        return db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                bio: user.bio,
                role: user.role,
                banned: user.banned,
                banReason: user.banReason,
                banExpires: user.banExpires,
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
        return firstOrNull(results);
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
        return firstOrNull(results);
    },

    async softDeleteUser(db: Database, id: string) {
        const results = await db
            .update(user)
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where(and(eq(user.id, id), isNull(user.deletedAt)))
            .returning();
        return firstOrNull(results);
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
        conditions.push(...buildSharedEventConditions(db, filters));

        const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
        const offset = filters.offset ?? DEFAULT_OFFSET;

        let query = db
            .select({
                ...baseEventSelection,
                cancellationReason: events.cancellationReason,
                deletedAt: events.deletedAt,
                organizer: {
                    ...baseEventSelection.organizer,
                    banned: user.banned,
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

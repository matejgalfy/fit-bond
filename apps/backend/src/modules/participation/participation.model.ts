import { and, eq, count, isNull } from 'drizzle-orm';
import type { Database } from '../../db';
import { user, eventParticipants, eventInterested } from '../../db/schema';

export const participationModel = {
    async findParticipants(db: Database, eventId: string) {
        return db
            .select({
                id: user.id,
                name: user.name,
                image: user.image,
            })
            .from(eventParticipants)
            .innerJoin(user, eq(eventParticipants.userId, user.id))
            .where(
                and(
                    eq(eventParticipants.eventId, eventId),
                    isNull(user.deletedAt)
                )
            );
    },

    async findInterested(db: Database, eventId: string) {
        return db
            .select({
                id: user.id,
                name: user.name,
                image: user.image,
            })
            .from(eventInterested)
            .innerJoin(user, eq(eventInterested.userId, user.id))
            .where(
                and(
                    eq(eventInterested.eventId, eventId),
                    isNull(user.deletedAt)
                )
            );
    },

    async isParticipant(db: Database, eventId: string, userId: string) {
        const rows = await db
            .select({ userId: eventParticipants.userId })
            .from(eventParticipants)
            .where(
                and(
                    eq(eventParticipants.eventId, eventId),
                    eq(eventParticipants.userId, userId)
                )
            )
            .limit(1);
        return rows.length > 0;
    },

    async isInterested(db: Database, eventId: string, userId: string) {
        const rows = await db
            .select({ userId: eventInterested.userId })
            .from(eventInterested)
            .where(
                and(
                    eq(eventInterested.eventId, eventId),
                    eq(eventInterested.userId, userId)
                )
            )
            .limit(1);
        return rows.length > 0;
    },

    async countParticipants(db: Database, eventId: string) {
        const result = await db
            .select({ count: count() })
            .from(eventParticipants)
            .where(eq(eventParticipants.eventId, eventId));
        return result[0]?.count ?? 0;
    },

    async addParticipant(db: Database, eventId: string, userId: string) {
        await db.transaction(async (tx) => {
            await tx
                .insert(eventParticipants)
                .values({ eventId, userId })
                .onConflictDoNothing();
            // Joined and interested are mutually exclusive.
            await tx
                .delete(eventInterested)
                .where(
                    and(
                        eq(eventInterested.eventId, eventId),
                        eq(eventInterested.userId, userId)
                    )
                );
        });
    },

    async removeParticipant(db: Database, eventId: string, userId: string) {
        await db
            .delete(eventParticipants)
            .where(
                and(
                    eq(eventParticipants.eventId, eventId),
                    eq(eventParticipants.userId, userId)
                )
            );
    },

    async addInterested(db: Database, eventId: string, userId: string) {
        await db
            .insert(eventInterested)
            .values({ eventId, userId })
            .onConflictDoNothing();
    },

    async removeInterested(db: Database, eventId: string, userId: string) {
        await db
            .delete(eventInterested)
            .where(
                and(
                    eq(eventInterested.eventId, eventId),
                    eq(eventInterested.userId, userId)
                )
            );
    },
};

export type ParticipationModel = typeof participationModel;

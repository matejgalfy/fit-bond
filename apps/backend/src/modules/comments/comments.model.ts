import { eq, and, isNull, asc } from 'drizzle-orm';
import type { Database } from '../../db';
import {
    comments,
    events,
    user,
    eventParticipants,
    eventInterested,
} from '../../db/schema';
import type {
    CommentFilters,
    CreateCommentInput,
    UpdateCommentInput,
} from './comments.types';

export const commentsModel = {
    async findAll(db: Database, filters: CommentFilters) {
        const conditions = [
            isNull(comments.deletedAt),
            eq(comments.eventId, filters.eventId),
        ];

        if (filters.parentCommentId) {
            conditions.push(
                eq(comments.parentCommentId, filters.parentCommentId)
            );
        }

        const limit = filters.limit ?? 50;
        const offset = filters.offset ?? 0;

        return db
            .select({
                id: comments.id,
                eventId: comments.eventId,
                userId: comments.userId,
                parentCommentId: comments.parentCommentId,
                content: comments.content,
                createdAt: comments.createdAt,
                updatedAt: comments.updatedAt,
                author: {
                    id: user.id,
                    name: user.name,
                    profilePictureUrl: user.profilePictureUrl,
                },
            })
            .from(comments)
            .innerJoin(user, eq(comments.userId, user.id))
            .where(and(...conditions))
            .orderBy(asc(comments.createdAt))
            .limit(limit)
            .offset(offset);
    },

    async findById(db: Database, id: string) {
        const results = await db
            .select({
                id: comments.id,
                eventId: comments.eventId,
                userId: comments.userId,
                parentCommentId: comments.parentCommentId,
                content: comments.content,
                createdAt: comments.createdAt,
                updatedAt: comments.updatedAt,
                author: {
                    id: user.id,
                    name: user.name,
                    profilePictureUrl: user.profilePictureUrl,
                },
            })
            .from(comments)
            .innerJoin(user, eq(comments.userId, user.id))
            .where(and(eq(comments.id, id), isNull(comments.deletedAt)));

        if (results.length === 0) return null;
        return results[0];
    },

    async findRawById(db: Database, id: string) {
        const results = await db
            .select()
            .from(comments)
            .where(and(eq(comments.id, id), isNull(comments.deletedAt)));

        if (results.length === 0) return null;
        return results[0];
    },

    async isUserEligibleToComment(
        db: Database,
        eventId: string,
        userId: string
    ): Promise<boolean> {
        const organizerResult = await db
            .select({ id: events.id })
            .from(events)
            .where(
                and(
                    eq(events.id, eventId),
                    eq(events.organizerId, userId),
                    isNull(events.deletedAt)
                )
            )
            .limit(1);
        if (organizerResult.length > 0) return true;

        const participantResult = await db
            .select({ userId: eventParticipants.userId })
            .from(eventParticipants)
            .where(
                and(
                    eq(eventParticipants.eventId, eventId),
                    eq(eventParticipants.userId, userId)
                )
            )
            .limit(1);
        if (participantResult.length > 0) return true;

        const interestedResult = await db
            .select({ userId: eventInterested.userId })
            .from(eventInterested)
            .where(
                and(
                    eq(eventInterested.eventId, eventId),
                    eq(eventInterested.userId, userId)
                )
            )
            .limit(1);
        if (interestedResult.length > 0) return true;

        return false;
    },

    async create(
        db: Database,
        userId: string,
        eventId: string,
        input: CreateCommentInput
    ) {
        const results = await db
            .insert(comments)
            .values({
                userId,
                eventId,
                parentCommentId: input.parentCommentId,
                content: input.content,
            })
            .returning();

        if (results.length === 0) {
            throw new Error('Failed to create comment');
        }
        return results[0];
    },

    async update(db: Database, id: string, input: UpdateCommentInput) {
        const results = await db
            .update(comments)
            .set({
                content: input.content,
                updatedAt: new Date(),
            })
            .where(and(eq(comments.id, id), isNull(comments.deletedAt)))
            .returning();

        if (results.length === 0) return null;
        return results[0];
    },

    async softDelete(
        db: Database,
        id: string,
        deletedBy: string,
        reason?: string
    ) {
        const results = await db
            .update(comments)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date(),
                deletedBy,
                deletionReason: reason,
            })
            .where(and(eq(comments.id, id), isNull(comments.deletedAt)))
            .returning();

        if (results.length === 0) return null;
        return results[0];
    },
};

export type CommentsModel = typeof commentsModel;

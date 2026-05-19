import { test, expect, describe, beforeEach, vi } from 'vitest';
import { createCommentsService } from './comments.service';
import { ServiceError } from '../../utils/errors';
import type { CommentsModel } from './comments.model';
import type { EventsModel } from '../events/events.model';
import type { EventType } from '../events/events.types';
import type { UsersModel } from '../users/users.model';
import type { NotificationsService } from '../notifications/notifications.service';
import type { Database } from '../../db';
import type {
    CommentType,
    CreateCommentInput,
    UpdateCommentInput,
} from './comments.types';

function makeMockComment(overrides: Partial<CommentType> = {}): CommentType {
    return {
        id: 'comment-1',
        eventId: 'event-1',
        userId: 'user-1',
        parentCommentId: null,
        content: 'Great event!',
        deletedBy: null,
        deletionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...overrides,
    };
}

function makeMockModel() {
    return {
        findAll: vi.fn(() => Promise.resolve([] as unknown[])),
        findById: vi.fn(() =>
            Promise.resolve(null as Record<string, unknown> | null)
        ),
        findRawById: vi.fn(() => Promise.resolve(null as CommentType | null)),
        isUserEligibleToComment: vi.fn(() => Promise.resolve(true)),
        create: vi.fn(() => Promise.resolve(makeMockComment())),
        update: vi.fn(() =>
            Promise.resolve(makeMockComment() as CommentType | null)
        ),
        softDelete: vi.fn(() =>
            Promise.resolve(makeMockComment() as CommentType | null)
        ),
    };
}

function makeMockEvent(overrides: Partial<EventType> = {}): EventType {
    return {
        id: 'event-1',
        organizerId: 'organizer-1',
        locationId: 'loc-1',
        sportId: 'sport-1',
        name: 'Morning Run',
        description: 'A casual morning run',
        skillLevel: 'beginner',
        startTime: new Date(Date.now() + 86400000),
        duration: 60,
        capacity: 10,
        isPublic: true,
        coverImageUrl: null,
        cancelledAt: null,
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...overrides,
    };
}

function makeMockEventsModel() {
    return {
        findRawById: vi.fn(() => Promise.resolve(null as EventType | null)),
    };
}

function makeMockUsersModel() {
    return {
        getUserNameById: vi.fn(() =>
            Promise.resolve({ id: 'user-1', name: 'Jana K.' } as {
                id: string;
                name: string;
            } | null)
        ),
    };
}

function makeMockNotifications() {
    return {
        create: vi.fn(() => Promise.resolve(null)),
    };
}

const fakeDb = {} as unknown as Database;

describe('CommentsService', () => {
    let mockModel: ReturnType<typeof makeMockModel>;
    let mockEventsModel: ReturnType<typeof makeMockEventsModel>;
    let mockUsersModel: ReturnType<typeof makeMockUsersModel>;
    let mockNotifications: ReturnType<typeof makeMockNotifications>;
    let service: ReturnType<typeof createCommentsService>;

    beforeEach(() => {
        mockModel = makeMockModel();
        mockEventsModel = makeMockEventsModel();
        mockUsersModel = makeMockUsersModel();
        mockNotifications = makeMockNotifications();
        service = createCommentsService({
            model: mockModel as unknown as CommentsModel,
            eventsModel: mockEventsModel as unknown as Pick<
                EventsModel,
                'findRawById'
            >,
            usersModel: mockUsersModel as unknown as Pick<
                UsersModel,
                'getUserNameById'
            >,
            notifications: mockNotifications as unknown as Pick<
                NotificationsService,
                'create'
            >,
        });
    });

    describe('list', () => {
        test('delegates to model.findAll with filters', async () => {
            const filters = { eventId: 'event-1', limit: 10 };
            await service.list(fakeDb, filters);
            expect(mockModel.findAll).toHaveBeenCalledWith(fakeDb, filters);
        });

        test('returns results from model', async () => {
            const items = [{ id: 'c1' }, { id: 'c2' }];
            mockModel.findAll.mockResolvedValueOnce(items);
            const result = await service.list(fakeDb, { eventId: 'event-1' });
            expect(result).toHaveLength(2);
        });
    });

    describe('getById', () => {
        test('returns comment when found', async () => {
            const comment = { id: 'comment-1', content: 'hi' };
            mockModel.findById.mockResolvedValueOnce(comment);
            const result = await service.getById(fakeDb, 'comment-1');
            expect(result).toHaveProperty('id', 'comment-1');
        });

        test('throws NOT_FOUND when comment does not exist', async () => {
            mockModel.findById.mockResolvedValueOnce(null);
            expect.assertions(3);
            try {
                await service.getById(fakeDb, 'missing');
            } catch (e) {
                expect(e).toBeInstanceOf(ServiceError);
                expect((e as ServiceError).code).toBe('NOT_FOUND');
                expect((e as ServiceError).statusCode).toBe(404);
            }
        });
    });

    describe('create', () => {
        const validInput: CreateCommentInput = { content: 'Nice!' };

        test('creates comment when user is eligible', async () => {
            mockModel.isUserEligibleToComment.mockResolvedValueOnce(true);
            const created = makeMockComment();
            mockModel.create.mockResolvedValueOnce(created);

            const result = await service.create(
                fakeDb,
                'user-1',
                'event-1',
                validInput
            );
            expect(result).toEqual(created);
            expect(mockModel.create).toHaveBeenCalledWith(
                fakeDb,
                'user-1',
                'event-1',
                validInput
            );
        });

        test('throws FORBIDDEN when user is not eligible', async () => {
            mockModel.isUserEligibleToComment.mockResolvedValueOnce(false);
            expect.assertions(2);
            try {
                await service.create(fakeDb, 'user-1', 'event-1', validInput);
            } catch (e) {
                expect((e as ServiceError).code).toBe('FORBIDDEN');
                expect((e as ServiceError).statusCode).toBe(403);
            }
        });

        test('creates reply when parent exists in same event', async () => {
            mockModel.isUserEligibleToComment.mockResolvedValueOnce(true);
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockComment({ id: 'parent-1', eventId: 'event-1' })
            );
            const created = makeMockComment({ parentCommentId: 'parent-1' });
            mockModel.create.mockResolvedValueOnce(created);

            const result = await service.create(fakeDb, 'user-1', 'event-1', {
                content: 'reply',
                parentCommentId: 'parent-1',
            });
            expect(result).toEqual(created);
        });

        test('throws BAD_REQUEST when parent comment not found', async () => {
            mockModel.isUserEligibleToComment.mockResolvedValueOnce(true);
            mockModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(2);
            try {
                await service.create(fakeDb, 'user-1', 'event-1', {
                    content: 'reply',
                    parentCommentId: 'missing-parent',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
                expect((e as ServiceError).message).toContain(
                    'Parent comment not found'
                );
            }
        });

        test('throws BAD_REQUEST when parent belongs to a different event', async () => {
            mockModel.isUserEligibleToComment.mockResolvedValueOnce(true);
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockComment({ id: 'parent-1', eventId: 'other-event' })
            );
            expect.assertions(2);
            try {
                await service.create(fakeDb, 'user-1', 'event-1', {
                    content: 'reply',
                    parentCommentId: 'parent-1',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
                expect((e as ServiceError).message).toContain('same event');
            }
        });

        test('notifies the organizer when a different user comments', async () => {
            mockModel.isUserEligibleToComment.mockResolvedValueOnce(true);
            mockEventsModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'organizer-1' })
            );

            await service.create(fakeDb, 'user-1', 'event-1', validInput);

            expect(mockNotifications.create).toHaveBeenCalledWith(fakeDb, {
                userId: 'organizer-1',
                type: 'comment',
                title: 'New comment on your event',
                message: 'Jana K. commented on Morning Run.',
                eventId: 'event-1',
                relatedUserId: 'user-1',
            });
        });

        test('does not notify when the organizer comments on their own event', async () => {
            mockModel.isUserEligibleToComment.mockResolvedValueOnce(true);
            mockEventsModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );

            await service.create(fakeDb, 'user-1', 'event-1', validInput);

            expect(mockNotifications.create).not.toHaveBeenCalled();
        });

        test('comment still succeeds when notification creation fails', async () => {
            mockModel.isUserEligibleToComment.mockResolvedValueOnce(true);
            mockEventsModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'organizer-1' })
            );
            mockNotifications.create.mockRejectedValueOnce(
                new Error('db down')
            );
            const created = makeMockComment();
            mockModel.create.mockResolvedValueOnce(created);

            const result = await service.create(
                fakeDb,
                'user-1',
                'event-1',
                validInput
            );
            expect(result).toEqual(created);
        });
    });

    describe('update', () => {
        const updateInput: UpdateCommentInput = { content: 'edited' };

        test('updates comment when user is author', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockComment({ userId: 'user-1' })
            );
            const updated = makeMockComment({ content: 'edited' });
            mockModel.update.mockResolvedValueOnce(updated);

            const result = await service.update(
                fakeDb,
                'comment-1',
                'user-1',
                updateInput
            );
            expect(result).toEqual(updated);
        });

        test('throws NOT_FOUND when comment does not exist', async () => {
            mockModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.update(fakeDb, 'missing', 'user-1', updateInput);
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws FORBIDDEN when user is not author', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockComment({ userId: 'other-user' })
            );
            expect.assertions(2);
            try {
                await service.update(
                    fakeDb,
                    'comment-1',
                    'user-1',
                    updateInput
                );
            } catch (e) {
                expect((e as ServiceError).code).toBe('FORBIDDEN');
                expect((e as ServiceError).statusCode).toBe(403);
            }
        });
    });

    describe('delete', () => {
        test('soft-deletes comment when actor is author', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockComment({ userId: 'user-1' })
            );
            await service.delete(fakeDb, 'comment-1', {
                id: 'user-1',
                role: 'user',
            });
            expect(mockModel.softDelete).toHaveBeenCalledWith(
                fakeDb,
                'comment-1',
                'user-1',
                undefined
            );
        });

        test('soft-deletes comment when actor is admin and records reason', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockComment({ userId: 'other-user' })
            );
            await service.delete(
                fakeDb,
                'comment-1',
                { id: 'admin-1', role: 'admin' },
                'Inappropriate content'
            );
            expect(mockModel.softDelete).toHaveBeenCalledWith(
                fakeDb,
                'comment-1',
                'admin-1',
                'Inappropriate content'
            );
        });

        test('throws NOT_FOUND when comment does not exist', async () => {
            mockModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.delete(fakeDb, 'missing', {
                    id: 'user-1',
                    role: 'user',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws FORBIDDEN when actor is neither author nor admin', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockComment({ userId: 'other-user' })
            );
            expect.assertions(1);
            try {
                await service.delete(fakeDb, 'comment-1', {
                    id: 'user-1',
                    role: 'user',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('FORBIDDEN');
            }
        });
    });
});

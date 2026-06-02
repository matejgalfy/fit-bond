import { test, expect, describe, beforeEach, vi } from 'vitest';
import { createAdminService } from './admin.service';
import { ServiceError } from '../../utils/errors';
import type { AdminModel } from './admin.model';
import type { Database } from '../../db';
import type { UserType } from './admin.types';

function makeFakeDb(): Database {
    return {} as unknown as Database;
}

function makeMockUser(overrides: Partial<UserType> = {}): UserType {
    return {
        id: 'user-1',
        name: 'Alice',
        bio: null,
        image: null,
        preferredLocation: null,
        locationRadius: null,
        role: 'user',
        email: 'alice@example.com',
        emailVerified: true,
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...overrides,
    };
}

function makeMockModel() {
    return {
        searchUsers: vi.fn(() => Promise.resolve([] as unknown[])),
        findUserById: vi.fn(() => Promise.resolve(null as UserType | null)),
        updateUser: vi.fn(() =>
            Promise.resolve(makeMockUser() as UserType | null)
        ),
        softDeleteUser: vi.fn(() =>
            Promise.resolve(makeMockUser() as UserType | null)
        ),
        searchEvents: vi.fn(() => Promise.resolve([] as unknown[])),
    };
}

const fakeDb = makeFakeDb();

describe('AdminService', () => {
    let mockModel: ReturnType<typeof makeMockModel>;
    let service: ReturnType<typeof createAdminService>;

    beforeEach(() => {
        mockModel = makeMockModel();
        service = createAdminService({
            model: mockModel as unknown as AdminModel,
        });
    });

    describe('listUsers', () => {
        test('delegates to model.searchUsers with filters', async () => {
            const filters = { search: 'alice', limit: 10 };
            await service.listUsers(fakeDb, filters);
            expect(mockModel.searchUsers).toHaveBeenCalledWith(fakeDb, filters);
        });

        test('returns results from model', async () => {
            mockModel.searchUsers.mockResolvedValueOnce([
                { id: 'user-1' },
                { id: 'user-2' },
            ]);
            const result = await service.listUsers(fakeDb, {});
            expect(result).toHaveLength(2);
        });
    });

    describe('getUser', () => {
        test('returns user when found', async () => {
            const u = makeMockUser({ id: 'user-1' });
            mockModel.findUserById.mockResolvedValueOnce(u);
            const result = await service.getUser(fakeDb, 'user-1');
            expect(result).toEqual(u);
        });

        test('throws NOT_FOUND when user does not exist', async () => {
            mockModel.findUserById.mockResolvedValueOnce(null);
            expect.assertions(2);
            try {
                await service.getUser(fakeDb, 'missing');
            } catch (e) {
                expect(e).toBeInstanceOf(ServiceError);
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });
    });

    describe('updateUser', () => {
        test('updates user when found', async () => {
            mockModel.findUserById.mockResolvedValueOnce(makeMockUser());
            const updated = makeMockUser({ name: 'Bob', role: 'admin' });
            mockModel.updateUser.mockResolvedValueOnce(updated);

            const result = await service.updateUser(fakeDb, 'user-1', {
                name: 'Bob',
                role: 'admin',
            });
            expect(result).toEqual(updated);
            expect(mockModel.updateUser).toHaveBeenCalledWith(
                fakeDb,
                'user-1',
                { name: 'Bob', role: 'admin' }
            );
        });

        test('throws NOT_FOUND when user does not exist', async () => {
            mockModel.findUserById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.updateUser(fakeDb, 'missing', { name: 'Bob' });
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });
    });

    describe('deleteUser', () => {
        test('soft-deletes a user', async () => {
            mockModel.findUserById.mockResolvedValueOnce(makeMockUser());
            const deleted = makeMockUser({ deletedAt: new Date() });
            mockModel.softDeleteUser.mockResolvedValueOnce(deleted);

            const result = await service.deleteUser(
                fakeDb,
                'user-1',
                'admin-1'
            );
            expect(result).toEqual({ success: true });
            expect(mockModel.softDeleteUser).toHaveBeenCalledWith(
                fakeDb,
                'user-1'
            );
        });

        test('throws BAD_REQUEST when admin tries to delete themself', async () => {
            expect.assertions(2);
            try {
                await service.deleteUser(fakeDb, 'admin-1', 'admin-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
                expect(mockModel.findUserById).not.toHaveBeenCalled();
            }
        });

        test('throws NOT_FOUND when user does not exist', async () => {
            mockModel.findUserById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.deleteUser(fakeDb, 'missing', 'admin-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws CONFLICT when user is already deleted', async () => {
            mockModel.findUserById.mockResolvedValueOnce(
                makeMockUser({ deletedAt: new Date() })
            );
            expect.assertions(2);
            try {
                await service.deleteUser(fakeDb, 'user-1', 'admin-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
                expect(mockModel.softDeleteUser).not.toHaveBeenCalled();
            }
        });
    });

    describe('listEvents', () => {
        test('delegates to model.searchEvents with filters', async () => {
            const filters = { includeCancelled: true, includeDeleted: true };
            await service.listEvents(fakeDb, filters);
            expect(mockModel.searchEvents).toHaveBeenCalledWith(
                fakeDb,
                filters
            );
        });

        test('throws BAD_REQUEST when userRelation provided without userId', async () => {
            expect.assertions(1);
            try {
                await service.listEvents(fakeDb, {
                    userRelation: 'organized',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
            }
        });

        test('throws BAD_REQUEST when excludeUserInteractions provided without userId', async () => {
            expect.assertions(1);
            try {
                await service.listEvents(fakeDb, {
                    excludeUserInteractions: true,
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
            }
        });

        test('throws BAD_REQUEST when userRelation and excludeUserInteractions are both provided', async () => {
            expect.assertions(1);
            try {
                await service.listEvents(fakeDb, {
                    userId: 'user-1',
                    userRelation: 'organized',
                    excludeUserInteractions: true,
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
            }
        });
    });
});

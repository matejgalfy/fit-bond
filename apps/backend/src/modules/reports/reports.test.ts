import { test, expect, describe, beforeEach, vi } from 'vitest';
import { createReportsService } from './reports.service';
import { ServiceError } from '../../utils/errors';
import type { ReportsModel } from './reports.model';
import type { Database } from '../../db';
import type { ReportEntity } from './reports.types';

function makeFakeDb(): Database {
    return {} as unknown as Database;
}

function makeMockReport(overrides: Partial<ReportEntity> = {}): ReportEntity {
    return {
        id: 'report-1',
        reporterId: 'user-1',
        reportType: 'event',
        targetId: 'event-1',
        reason: 'spam',
        status: 'pending',
        resolvedBy: null,
        resolution: null,
        createdAt: new Date(),
        deletedAt: null,
        ...overrides,
    };
}

type AdminReportRow = ReportEntity & {
    reporterName: string | null;
    targetLabel: string | null;
};

function makeMockAdminReport(
    overrides: Partial<AdminReportRow> = {}
): AdminReportRow {
    return {
        ...makeMockReport(),
        reporterName: 'Reporter Name',
        targetLabel: 'Target Label',
        ...overrides,
    };
}

function makeMockModel() {
    return {
        create: vi.fn(() => Promise.resolve(makeMockReport())),
        findById: vi.fn(() => Promise.resolve(null as ReportEntity | null)),
        findByIdForAdmin: vi.fn(() =>
            Promise.resolve(null as AdminReportRow | null)
        ),
        findPendingDuplicate: vi.fn(() =>
            Promise.resolve(null as ReportEntity | null)
        ),
        findManyByReporter: vi.fn(() => Promise.resolve([] as ReportEntity[])),
        findManyForAdmin: vi.fn(() => Promise.resolve([] as AdminReportRow[])),
        updateStatus: vi.fn(() =>
            Promise.resolve(makeMockReport() as ReportEntity | null)
        ),
    };
}

function makeMockEventsModel() {
    return {
        findRawById: vi.fn(() =>
            Promise.resolve({
                id: 'event-1',
                organizerId: 'user-2',
            } as unknown as never)
        ),
    };
}

function makeMockCommentsModel() {
    return {
        findRawById: vi.fn(() =>
            Promise.resolve({
                id: 'comment-1',
                userId: 'user-2',
            } as unknown as never)
        ),
    };
}

function makeMockAdminModel() {
    return {
        findUserById: vi.fn(() =>
            Promise.resolve({ id: 'user-2' } as unknown as never)
        ),
    };
}

const fakeDb = makeFakeDb();

describe('ReportsService', () => {
    let mockModel: ReturnType<typeof makeMockModel>;
    let mockEvents: ReturnType<typeof makeMockEventsModel>;
    let mockComments: ReturnType<typeof makeMockCommentsModel>;
    let mockAdmin: ReturnType<typeof makeMockAdminModel>;
    let service: ReturnType<typeof createReportsService>;

    beforeEach(() => {
        mockModel = makeMockModel();
        mockEvents = makeMockEventsModel();
        mockComments = makeMockCommentsModel();
        mockAdmin = makeMockAdminModel();
        service = createReportsService({
            model: mockModel as unknown as ReportsModel,
            eventsModel: mockEvents,
            commentsModel: mockComments,
            adminModel: mockAdmin,
        });
    });

    describe('create', () => {
        test('creates an event report when target exists', async () => {
            const created = makeMockReport();
            mockModel.create.mockResolvedValueOnce(created);
            const result = await service.create(fakeDb, 'user-1', {
                reportType: 'event',
                targetId: 'event-1',
                reason: 'spam',
            });
            expect(result).toEqual(created);
            expect(mockEvents.findRawById).toHaveBeenCalledWith(
                fakeDb,
                'event-1'
            );
            expect(mockModel.create).toHaveBeenCalled();
        });

        test('creates a comment report when target exists', async () => {
            await service.create(fakeDb, 'user-1', {
                reportType: 'comment',
                targetId: 'comment-1',
                reason: 'rude',
            });
            expect(mockComments.findRawById).toHaveBeenCalledWith(
                fakeDb,
                'comment-1'
            );
        });

        test('creates a user report when target exists', async () => {
            await service.create(fakeDb, 'user-1', {
                reportType: 'user',
                targetId: 'user-2',
                reason: 'harassment',
            });
            expect(mockAdmin.findUserById).toHaveBeenCalledWith(
                fakeDb,
                'user-2'
            );
        });

        test('throws NOT_FOUND when reported event does not exist', async () => {
            mockEvents.findRawById.mockResolvedValueOnce(
                null as unknown as never
            );
            expect.assertions(2);
            try {
                await service.create(fakeDb, 'user-1', {
                    reportType: 'event',
                    targetId: 'missing',
                    reason: 'x',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
                expect(mockModel.create).not.toHaveBeenCalled();
            }
        });

        test('throws NOT_FOUND when reported comment does not exist', async () => {
            mockComments.findRawById.mockResolvedValueOnce(
                null as unknown as never
            );
            expect.assertions(1);
            try {
                await service.create(fakeDb, 'user-1', {
                    reportType: 'comment',
                    targetId: 'missing',
                    reason: 'x',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws NOT_FOUND when reported user does not exist', async () => {
            mockAdmin.findUserById.mockResolvedValueOnce(
                null as unknown as never
            );
            expect.assertions(1);
            try {
                await service.create(fakeDb, 'user-1', {
                    reportType: 'user',
                    targetId: 'missing',
                    reason: 'x',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws BAD_REQUEST when reporting yourself', async () => {
            expect.assertions(2);
            try {
                await service.create(fakeDb, 'user-1', {
                    reportType: 'user',
                    targetId: 'user-1',
                    reason: 'x',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
                expect(mockAdmin.findUserById).not.toHaveBeenCalled();
            }
        });

        test('throws BAD_REQUEST when reporting own event', async () => {
            mockEvents.findRawById.mockResolvedValueOnce({
                id: 'event-1',
                organizerId: 'user-1',
            } as unknown as never);
            expect.assertions(2);
            try {
                await service.create(fakeDb, 'user-1', {
                    reportType: 'event',
                    targetId: 'event-1',
                    reason: 'x',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
                expect(mockModel.create).not.toHaveBeenCalled();
            }
        });

        test('throws BAD_REQUEST when reporting own comment', async () => {
            mockComments.findRawById.mockResolvedValueOnce({
                id: 'comment-1',
                userId: 'user-1',
            } as unknown as never);
            expect.assertions(2);
            try {
                await service.create(fakeDb, 'user-1', {
                    reportType: 'comment',
                    targetId: 'comment-1',
                    reason: 'x',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
                expect(mockModel.create).not.toHaveBeenCalled();
            }
        });

        test('throws CONFLICT when a pending duplicate exists', async () => {
            mockModel.findPendingDuplicate.mockResolvedValueOnce(
                makeMockReport()
            );
            expect.assertions(2);
            try {
                await service.create(fakeDb, 'user-1', {
                    reportType: 'event',
                    targetId: 'event-1',
                    reason: 'spam again',
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
                expect(mockModel.create).not.toHaveBeenCalled();
            }
        });
    });

    describe('getById', () => {
        test('returns report when found', async () => {
            const r = makeMockReport();
            mockModel.findById.mockResolvedValueOnce(r);
            const result = await service.getById(fakeDb, 'report-1');
            expect(result).toEqual(r);
        });

        test('throws NOT_FOUND when report does not exist', async () => {
            mockModel.findById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.getById(fakeDb, 'missing');
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });
    });

    describe('listMine', () => {
        test('delegates to model.findManyByReporter', async () => {
            await service.listMine(fakeDb, 'user-1', { status: 'pending' });
            expect(mockModel.findManyByReporter).toHaveBeenCalledWith(
                fakeDb,
                'user-1',
                { status: 'pending' }
            );
        });
    });

    describe('listForAdmin', () => {
        test('delegates to model.findManyForAdmin', async () => {
            await service.listForAdmin(fakeDb, { reportType: 'event' });
            expect(mockModel.findManyForAdmin).toHaveBeenCalledWith(fakeDb, {
                reportType: 'event',
            });
        });

        test('returns enriched rows with reporterName and targetLabel', async () => {
            const enriched = makeMockAdminReport({
                reporterName: 'Alice',
                targetLabel: 'Tennis Tournament',
            });
            mockModel.findManyForAdmin.mockResolvedValueOnce([enriched]);
            const result = await service.listForAdmin(fakeDb, {});
            expect(result).toEqual([enriched]);
        });
    });

    describe('getByIdForAdmin', () => {
        test('returns enriched report when found', async () => {
            const enriched = makeMockAdminReport({
                reporterName: 'Alice',
                targetLabel: 'Tennis Tournament',
            });
            mockModel.findByIdForAdmin.mockResolvedValueOnce(enriched);
            const result = await service.getByIdForAdmin(fakeDb, 'report-1');
            expect(result).toEqual(enriched);
        });

        test('returns null target label when target was deleted', async () => {
            const enriched = makeMockAdminReport({ targetLabel: null });
            mockModel.findByIdForAdmin.mockResolvedValueOnce(enriched);
            const result = await service.getByIdForAdmin(fakeDb, 'report-1');
            expect(result.targetLabel).toBeNull();
        });

        test('throws NOT_FOUND when report does not exist', async () => {
            mockModel.findByIdForAdmin.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.getByIdForAdmin(fakeDb, 'missing');
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });
    });

    describe('resolve', () => {
        test('resolves a pending report', async () => {
            mockModel.findById.mockResolvedValueOnce(makeMockReport());
            const resolved = makeMockReport({
                status: 'resolved',
                resolvedBy: 'admin-1',
                resolution: 'removed',
            });
            mockModel.updateStatus.mockResolvedValueOnce(resolved);

            const result = await service.resolve(
                fakeDb,
                'report-1',
                'admin-1',
                'removed'
            );
            expect(result).toEqual(resolved);
            expect(mockModel.updateStatus).toHaveBeenCalledWith(
                fakeDb,
                'report-1',
                'resolved',
                'admin-1',
                'removed'
            );
        });

        test('throws NOT_FOUND when report does not exist', async () => {
            mockModel.findById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.resolve(fakeDb, 'missing', 'admin-1', 'r');
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws CONFLICT when report is already resolved', async () => {
            mockModel.findById.mockResolvedValueOnce(
                makeMockReport({ status: 'resolved' })
            );
            expect.assertions(2);
            try {
                await service.resolve(fakeDb, 'report-1', 'admin-1', 'r');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
                expect(mockModel.updateStatus).not.toHaveBeenCalled();
            }
        });

        test('throws CONFLICT when report is already rejected', async () => {
            mockModel.findById.mockResolvedValueOnce(
                makeMockReport({ status: 'rejected' })
            );
            expect.assertions(1);
            try {
                await service.resolve(fakeDb, 'report-1', 'admin-1', 'r');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });
    });

    describe('reject', () => {
        test('rejects a pending report', async () => {
            mockModel.findById.mockResolvedValueOnce(makeMockReport());
            const rejected = makeMockReport({
                status: 'rejected',
                resolvedBy: 'admin-1',
                resolution: 'no violation',
            });
            mockModel.updateStatus.mockResolvedValueOnce(rejected);

            const result = await service.reject(
                fakeDb,
                'report-1',
                'admin-1',
                'no violation'
            );
            expect(result).toEqual(rejected);
            expect(mockModel.updateStatus).toHaveBeenCalledWith(
                fakeDb,
                'report-1',
                'rejected',
                'admin-1',
                'no violation'
            );
        });

        test('accepts a null resolution when rejecting', async () => {
            mockModel.findById.mockResolvedValueOnce(makeMockReport());
            await service.reject(fakeDb, 'report-1', 'admin-1', null);
            expect(mockModel.updateStatus).toHaveBeenCalledWith(
                fakeDb,
                'report-1',
                'rejected',
                'admin-1',
                null
            );
        });

        test('throws NOT_FOUND when report does not exist', async () => {
            mockModel.findById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.reject(fakeDb, 'missing', 'admin-1', null);
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws CONFLICT when report is no longer pending', async () => {
            mockModel.findById.mockResolvedValueOnce(
                makeMockReport({ status: 'resolved' })
            );
            expect.assertions(1);
            try {
                await service.reject(fakeDb, 'report-1', 'admin-1', null);
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });
    });
});

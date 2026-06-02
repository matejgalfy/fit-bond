import { ServiceError } from './errors';

export function validateUserRelationFilters(filters: {
    userId?: string;
    userRelation?: unknown;
    excludeUserInteractions?: boolean;
}) {
    if (filters.userRelation && !filters.userId) {
        throw ServiceError.badRequest(
            'userId is required when filtering by userRelation'
        );
    }
    if (filters.excludeUserInteractions && !filters.userId) {
        throw ServiceError.badRequest(
            'userId is required when excludeUserInteractions is true'
        );
    }
    if (filters.userRelation && filters.excludeUserInteractions) {
        throw ServiceError.badRequest(
            'userRelation and excludeUserInteractions cannot be used together'
        );
    }
}

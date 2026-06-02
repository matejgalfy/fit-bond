import type { Database } from '../../db';
import type { SportsModel } from './sports.model';
import { sportsModel as defaultModel } from './sports.model';
import type { CreateSportInput } from './sports.types';
import { ServiceError } from '../../utils/errors';

export interface SportsServiceDeps {
    model?: SportsModel;
}

export function createSportsService({
    model = defaultModel,
}: SportsServiceDeps = {}) {
    return {
        async list(db: Database) {
            return model.findAll(db);
        },

        async getById(db: Database, id: string) {
            const sport = await model.findById(db, id);
            if (!sport) {
                throw ServiceError.notFound('Sport not found');
            }
            return sport;
        },

        async create(db: Database, input: CreateSportInput) {
            const existing = await model.findByName(db, input.name);
            if (existing) {
                throw ServiceError.conflict(
                    'Sport with this name already exists'
                );
            }
            return model.create(db, input);
        },

        async delete(db: Database, id: string) {
            const existing = await model.findById(db, id);
            if (!existing) {
                throw ServiceError.notFound('Sport not found');
            }
            await model.softDelete(db, id);
            return { success: true };
        },
    };
}

export type SportsService = ReturnType<typeof createSportsService>;

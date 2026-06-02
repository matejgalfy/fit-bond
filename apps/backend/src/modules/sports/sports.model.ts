import { eq, and, isNull, asc } from 'drizzle-orm';
import type { Database } from '../../db';
import { firstOrNull, firstOrThrow } from '../../utils/query';
import { sports } from '../../db/schema';
import type { CreateSportInput } from './sports.types';

export const sportsModel = {
    async findAll(db: Database) {
        return db
            .select({
                id: sports.id,
                name: sports.name,
                iconUrl: sports.iconUrl,
                description: sports.description,
            })
            .from(sports)
            .where(isNull(sports.deletedAt))
            .orderBy(asc(sports.name));
    },

    async findById(db: Database, id: string) {
        const results = await db
            .select({
                id: sports.id,
                name: sports.name,
                iconUrl: sports.iconUrl,
                description: sports.description,
            })
            .from(sports)
            .where(and(eq(sports.id, id), isNull(sports.deletedAt)));

        return firstOrNull(results);
    },

    async findByName(db: Database, name: string) {
        const results = await db
            .select()
            .from(sports)
            .where(and(eq(sports.name, name), isNull(sports.deletedAt)));

        return firstOrNull(results);
    },

    async create(db: Database, input: CreateSportInput) {
        const results = await db
            .insert(sports)
            .values({
                name: input.name,
                iconUrl: input.iconUrl ?? null,
                description: input.description ?? null,
            })
            .returning();

        return firstOrThrow(results, 'Failed to create sport');
    },

    async softDelete(db: Database, id: string) {
        const results = await db
            .update(sports)
            .set({ deletedAt: new Date() })
            .where(and(eq(sports.id, id), isNull(sports.deletedAt)))
            .returning();

        return firstOrNull(results);
    },
};

export type SportsModel = typeof sportsModel;

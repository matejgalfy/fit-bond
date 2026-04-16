import { db } from '../../db';
import { usersService } from './users.service';
import type { UpdateFullProfileInput } from './users.schema';

export const usersController = {
    async getPublicProfile(userId: string) {
        return usersService.getPublicProfile(db, userId);
    },

    async updateFullProfile(userId: string, data: UpdateFullProfileInput) {
        return usersService.updateFullProfile(db, userId, data);
    },

    async findUserByName(name: string) {
        return usersService.findUserByName(db, name);
    },
};

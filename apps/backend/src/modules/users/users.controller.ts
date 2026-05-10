import { db } from '../../db';
import { usersService } from './users.service';
import type { UpdateFullProfileInput } from './users.types';

export const usersController = {
    async getUserProfile(userId: string) {
        return usersService.getUserProfile(db, userId);
    },

    async updateFullProfile(userId: string, data: UpdateFullProfileInput) {
        return usersService.updateFullProfile(db, userId, data);
    },

    async findUserByName(name: string) {
        return usersService.findUserByName(db, name);
    },

    async getUsersByEventId(eventId: string) {
        return usersService.getUsersByEventId(db, eventId);
    },
};

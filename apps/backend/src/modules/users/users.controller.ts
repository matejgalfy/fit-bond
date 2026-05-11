import { db } from '../../db';
import { usersService } from './users.service';
import type { UpdateProfileInput } from './users.types';

export const usersController = {
    async getUserProfile(userId: string) {
        return usersService.getUserProfile(db, userId);
    },

    async updateFullProfile(userId: string, data: UpdateProfileInput) {
        return usersService.updateProfile(db, userId, data);
    },

    async getUsersByEventId(eventId: string) {
        return usersService.getUsersByEventId(db, eventId);
    },
};

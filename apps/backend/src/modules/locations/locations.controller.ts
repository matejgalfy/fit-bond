import { locationsService } from './locations.service';

export const locationsController = {
    async search(q: string) {
        return locationsService.search(q);
    },
};

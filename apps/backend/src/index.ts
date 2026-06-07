import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { staticPlugin } from '@elysiajs/static';
import { authLayer } from './auth_middleware';
import { eventBus } from './lib/eventBus';
import { openapiConfig } from './openapi.config';

import { createSportsService } from './modules/sports/sports.service';
import { createLocationsService } from './modules/locations/locations.service';
import { createNotificationsService } from './modules/notifications/notifications.service';
import { createAdminService } from './modules/admin/admin.service';
import { createUsersService } from './modules/users/users.service';
import { createEventsService } from './modules/events/events.service';
import { createParticipationService } from './modules/participation/participation.service';
import { createCommentsService } from './modules/comments/comments.service';
import { createReportsService } from './modules/reports/reports.service';

import { registerNotificationsSubscribers } from './modules/notifications/notifications.subscribers';
import { registerEmailSubscribers } from './modules/email/email.subscribers';

import { createSportsRoutes } from './modules/sports/sports.routes';
import { createLocationsRoutes } from './modules/locations/locations.routes';
import { createNotificationsRoutes } from './modules/notifications/notifications.routes';
import { createAdminRoutes } from './modules/admin/admin.routes';
import { createUsersRoutes } from './modules/users/users.routes';
import { createEventsRoutes } from './modules/events/events.routes';
import { createParticipationRoutes } from './modules/participation/participation.routes';
import { createCommentsRoutes } from './modules/comments/comments.routes';
import {
    createReportsRoutes,
    createReportsAdminRoutes,
} from './modules/reports/reports.routes';
import { uploadRoutes } from './modules/upload/upload.routes';

// --- Composition root: build services with explicit dependencies ---
const sportsService = createSportsService();
const locationsService = createLocationsService();
const notificationsService = createNotificationsService();
const adminService = createAdminService();
const usersService = createUsersService({ locationsService });
const eventsService = createEventsService({ locationsService, bus: eventBus });
const participationService = createParticipationService({
    eventsService,
    bus: eventBus,
});
const commentsService = createCommentsService({
    eventsService,
    bus: eventBus,
});
const reportsService = createReportsService({
    eventsService,
    commentsService,
    usersService,
});

// --- Wire domain-event subscribers ---
registerNotificationsSubscribers({
    bus: eventBus,
    notificationsService,
    usersService,
});
registerEmailSubscribers({ bus: eventBus, usersService });

const port = Number(process.env.PORT) || 3000;

// Routes stay at the root so the Eden treaty client keeps its `api.events`
// shape.
export const app = new Elysia()
    .use(authLayer)
    .use(
        cors({
            credentials: true,
        })
    )
    .use(openapi(openapiConfig))
    // `alwaysStatic` defaults to true under NODE_ENV=production, which snapshots
    // the uploads dir at boot and 404s anything uploaded afterward. Force the
    // dynamic wildcard handler so runtime uploads are served from disk per request.
    .use(
        staticPlugin({
            assets: 'uploads',
            prefix: '/uploads',
            alwaysStatic: false,
        })
    )
    .get('/health', () => ({ ok: true }))
    .use(uploadRoutes)
    .use(createEventsRoutes(eventsService))
    .use(createParticipationRoutes(participationService))
    .use(createSportsRoutes(sportsService))
    .use(createUsersRoutes(usersService))
    .use(createCommentsRoutes(commentsService))
    .use(createNotificationsRoutes(notificationsService))
    .use(createLocationsRoutes(locationsService))
    .use(createAdminRoutes(adminService))
    .use(createReportsRoutes(reportsService))
    .use(createReportsAdminRoutes(reportsService))
    .listen({ port, hostname: '0.0.0.0' });

console.log(`Server running on http://localhost:${String(port)}`);
console.log(
    `API documentation available at http://localhost:${String(port)}/openapi`
);
export type Backend = typeof app;

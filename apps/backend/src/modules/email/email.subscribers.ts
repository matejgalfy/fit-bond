import type { EventBus } from '../../lib/eventBus';
import type { UsersService } from '../users/users.service';
import {
    emailService as defaultEmailService,
    type EmailService,
} from './email.service';

export interface EmailSubscriberDeps {
    bus: Pick<EventBus, 'on'>;
    usersService: Pick<UsersService, 'getUsersByEventId'>;
    emailService?: Pick<
        EmailService,
        'eventCancelledEmail' | 'sendWelcomeEmail'
    >;
}

export function registerEmailSubscribers({
    bus,
    usersService,
    emailService = defaultEmailService,
}: EmailSubscriberDeps) {
    bus.on('event.cancelled', async (db, p) => {
        const participants = await usersService.getUsersByEventId(
            db,
            p.eventId
        );
        await Promise.all(
            participants.map((u) =>
                emailService.eventCancelledEmail(u.email, p.eventName)
            )
        );
    });

    bus.on('user.registered', async (_db, p) => {
        await emailService.sendWelcomeEmail(p.email, p.name);
    });
}

import {
    pgTable,
    uuid,
    text,
    integer,
    timestamp,
    boolean,
    pgEnum,
    AnyPgColumn,
    decimal,
    primaryKey,
    index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const skillLevelEnum = pgEnum('skill_level', [
    'beginner',
    'intermediate',
    'advanced',
]);

// Discuss notification types TODO
export const notificationTypeEnum = pgEnum('notification_type', [
    'event_update',
    'event_cancelled',
    'participant_joined',
    'comment',
    'interest',
]);
export const reportTypeEnum = pgEnum('report_type', [
    'user',
    'event',
    'comment',
]);
export const reportStatusEnum = pgEnum('report_status', [
    'pending',
    'resolved',
    'rejected',
]);

// Tables

export const user = pgTable('user', {
    id: text('id').primaryKey(), // Use text for compatibility with better-auth's default ID generation
    name: text('name').notNull(),
    bio: text('bio'),
    image: text('image'),
    preferredLocation: text('preferred_location').references(
        () => locations.id
    ),
    locationRadius: integer('location_radius'),
    role: userRoleEnum('role').default('user').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    bannedReason: text('banned_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    deletedAt: timestamp('deleted_at'),
});

export const session = pgTable(
    'session',
    {
        id: text('id').primaryKey(),
        expiresAt: timestamp('expires_at').notNull(),
        token: text('token').notNull().unique(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
    },
    (table) => [index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
    'account',
    {
        id: text('id').primaryKey(),
        accountId: text('account_id').notNull(),
        providerId: text('provider_id').notNull(),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        idToken: text('id_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at'),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
        scope: text('scope'),
        password: text('password'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = pgTable(
    'verification',
    {
        id: text('id').primaryKey(),
        identifier: text('identifier').notNull(),
        value: text('value').notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const sports = pgTable('sports', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    iconUrl: text('icon'),
    description: text('description'),
    deletedAt: timestamp('deleted_at'),
});

export const locations = pgTable('locations', {
    id: text('id').primaryKey(),
    full_address: text('full_address').notNull(),
    formatted_address: text('formatted_address').notNull(),
    lat: decimal('lat', { precision: 8, scale: 6 }).notNull(),
    lng: decimal('lng', { precision: 9, scale: 6 }).notNull(),
    deletedAt: timestamp('deleted_at'),
});

export const userPreferredSports = pgTable(
    'user_preferred_sports',
    {
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        sportId: uuid('sport_id')
            .notNull()
            .references(() => sports.id, { onDelete: 'cascade' }),
    },
    (table) => [primaryKey({ columns: [table.userId, table.sportId] })]
);

export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: text('organizer_id')
        .notNull()
        .references(() => user.id),
    locationId: text('location_id')
        .notNull()
        .references(() => locations.id),
    sportId: uuid('sport_id')
        .notNull()
        .references(() => sports.id),
    name: text('name').notNull(),
    description: text('description'),
    skillLevel: skillLevelEnum('skill_level').notNull(),
    startTime: timestamp('start_time').notNull(),
    duration: integer('duration').notNull(),
    capacity: integer('capacity').notNull(),
    isPublic: boolean('is_public').default(true).notNull(),
    coverImageUrl: text('cover_image_url'),
    cancelledAt: timestamp('cancelled_at'),
    cancellationReason: text('cancellation_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

export const eventParticipants = pgTable(
    'event_participants',
    {
        eventId: uuid('event_id')
            .notNull()
            .references(() => events.id),
        userId: text('user_id')
            .notNull()
            .references(() => user.id),
    },
    (table) => [primaryKey({ columns: [table.userId, table.eventId] })]
);

export const eventInterested = pgTable(
    'event_interested',
    {
        eventId: uuid('event_id')
            .notNull()
            .references(() => events.id),
        userId: text('user_id')
            .notNull()
            .references(() => user.id),
    },
    (table) => [primaryKey({ columns: [table.userId, table.eventId] })]
);

export const comments = pgTable('comments', () => ({
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
        .notNull()
        .references(() => events.id),
    userId: text('user_id')
        .notNull()
        .references(() => user.id),
    parentCommentId: uuid('parent_comment_id').references(
        (): AnyPgColumn => comments.id
    ),
    content: text('content').notNull(),
    deletedBy: text('deleted_by'),
    deletionReason: text('deletion_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}));

export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id),
    type: notificationTypeEnum('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    eventId: uuid('event_id').references(() => events.id),
    relatedUserId: text('related_user_id').references(() => user.id),
    isRead: boolean('is_read').default(false).notNull(),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

export const reports = pgTable('reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    reporterId: text('reporter_id')
        .notNull()
        .references(() => user.id),
    reportType: reportTypeEnum('report_type').notNull(),
    targetId: text('target_id').notNull(),
    reason: text('reason').notNull(),
    status: reportStatusEnum('status').default('pending').notNull(),
    resolvedBy: text('resolved_by').references(() => user.id),
    resolution: text('resolution'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// Relations
export const usersRelations = relations(user, ({ one, many }) => ({
    // --- Better Auth Relations ---
    sessions: many(session),
    accounts: many(account),

    // --- FitBond Application Relations ---
    preferredSports: many(userPreferredSports),
    preferredLocation: one(locations, {
        fields: [user.preferredLocation],
        references: [locations.id],
    }),
    organizedEvents: many(events, { relationName: 'organizer' }),
    participatingEvents: many(eventParticipants),
    interestedEvents: many(eventInterested),
    comments: many(comments),
    receivedNotifications: many(notifications, { relationName: 'user' }),
    mentionedNotifications: many(notifications, {
        relationName: 'notificationsRelatedUser',
    }),
    submittedReports: many(reports, { relationName: 'reporter' }),
    resolvedReports: many(reports, { relationName: 'resolver' }),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
    events: many(events),
}));

export const sportsRelations = relations(sports, ({ many }) => ({
    userPreferences: many(userPreferredSports),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
    organizer: one(user, {
        fields: [events.organizerId],
        references: [user.id],
        relationName: 'organizer',
    }),
    location: one(locations, {
        fields: [events.locationId],
        references: [locations.id],
    }),
    sport: one(sports, {
        fields: [events.sportId],
        references: [sports.id],
    }),
    participants: many(eventParticipants),
    interestedUsers: many(eventInterested),
    comments: many(comments),
    notifications: many(notifications),
}));

export const userPreferredSportsRelations = relations(
    userPreferredSports,
    ({ one }) => ({
        user: one(user, {
            fields: [userPreferredSports.userId],
            references: [user.id],
        }),
        sport: one(sports, {
            fields: [userPreferredSports.sportId],
            references: [sports.id],
        }),
    })
);

export const eventParticipantsRelations = relations(
    eventParticipants,
    ({ one }) => ({
        event: one(events, {
            fields: [eventParticipants.eventId],
            references: [events.id],
        }),
        user: one(user, {
            fields: [eventParticipants.userId],
            references: [user.id],
        }),
    })
);

export const eventInterestedRelations = relations(
    eventInterested,
    ({ one }) => ({
        event: one(events, {
            fields: [eventInterested.eventId],
            references: [events.id],
        }),
        user: one(user, {
            fields: [eventInterested.userId],
            references: [user.id],
        }),
    })
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
    event: one(events, { fields: [comments.eventId], references: [events.id] }),
    user: one(user, { fields: [comments.userId], references: [user.id] }),
    parentComment: one(comments, {
        fields: [comments.parentCommentId],
        references: [comments.id],
        relationName: 'replies',
    }),
    replies: many(comments, { relationName: 'replies' }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(user, {
        fields: [notifications.userId],
        references: [user.id],
        relationName: 'user',
    }),
    event: one(events, {
        fields: [notifications.eventId],
        references: [events.id],
    }),
    relatedUser: one(user, {
        fields: [notifications.relatedUserId],
        references: [user.id],
        relationName: 'notificationsRelatedUser',
    }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
    reporter: one(user, {
        fields: [reports.reporterId],
        references: [user.id],
        relationName: 'reporter',
    }),
    resolver: one(user, {
        fields: [reports.resolvedBy],
        references: [user.id],
        relationName: 'resolver',
    }),
}));

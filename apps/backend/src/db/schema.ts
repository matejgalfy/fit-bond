import { pgTable, uuid, text, integer, timestamp, unique, boolean, real, pgEnum, AnyPgColumn } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'intermediate', 'advanced'])

// Discuss notification types TODO
export const notificationTypeEnum = pgEnum('notification_type', ['event_update', 'participant_joined', 'comment', 'interest'])
export const reportTypeEnum = pgEnum('report_type', ['user', 'event', 'comment'])
export const reportStatusEnum = pgEnum('report_status', ['pending', 'resolved', 'rejected'])

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  oauthProvider: text('oauth_provider'),
  oauthId: text('oauth_id').unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  profilePictureUrl: text('profile_picture_url'),
  bio: text('bio'),
  role: userRoleEnum('role').default('user').notNull(),
  isBanned: boolean('is_banned').default(false).notNull(),
  bannedUntil: timestamp('banned_until'),
  bannedReason: text('banned_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
})

export const sports = pgTable('sports', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  iconUrl: text('icon'),
  description: text('description'),
  deletedAt: timestamp('deleted_at'),
})

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  deletedAt: timestamp('deleted_at'),
})

export const userPreferredSports = pgTable('user_preferred_sports', {
  userId: uuid('user_id').notNull().references(() => users.id),
  sportId: uuid('sport_id').notNull().references(() => sports.id),
}, (table) => [
    unique().on(table.userId, table.sportId),
])

export const userLocations = pgTable('user_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  radius: integer('radius').notNull(),
  label: text('label'),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizerId: uuid('organizer_id').notNull().references(() => users.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  sportId: uuid('sport_id').notNull().references(() => sports.id),
  name: text('name').notNull(),
  description: text('description'),
  skillLevel: skillLevelEnum('skill_level').notNull(),
  startTime: timestamp('start_time').notNull(),
  duration: integer('duration').notNull(),
  capacity: integer('capacity').notNull(),
  currentParticipants: integer('current_participants').default(0).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  coverImageUrl: text('cover_image_url'),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
})

export const eventParticipants = pgTable('event_participants', {
  eventId: uuid('event_id').notNull().references(() => events.id),
  userId: uuid('user_id').notNull().references(() => users.id),
}, (table) => [
  unique().on(table.eventId, table.userId),
])

export const eventInterested = pgTable('event_interested', {
  eventId: uuid('event_id').notNull().references(() => events.id),
  userId: uuid('user_id').notNull().references(() => users.id),
}, (table) => ({
  pk: unique().on(table.eventId, table.userId),
}))

export const comments = pgTable('comments', () => ({
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  parentCommentId: uuid('parent_comment_id').references((): AnyPgColumn => comments.id),
  content: text('content').notNull(),
  deletedBy: text('deleted_by'),
  deletionReason: text('deletion_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}))

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  eventId: uuid('event_id').references(() => events.id),
  relatedUserId: uuid('related_user_id').references(() => users.id),
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id').notNull().references(() => users.id),
  reportType: reportTypeEnum('report_type').notNull(),
  targetId: uuid('target_id').notNull(),
  reason: text('reason').notNull(),
  status: reportStatusEnum('status').default('pending').notNull(),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  preferredSports: many(userPreferredSports),
  locations: many(userLocations),
  organizedEvents: many(events, { relationName: 'organizer' }),
  participatingEvents: many(eventParticipants),
  interestedEvents: many(eventInterested),
  comments: many(comments),
  notifications: many(notifications),
  submittedReports: many(reports, { relationName: 'reporter' }),
  resolvedReports: many(reports, { relationName: 'resolver' }),
}))

export const sportsRelations = relations(sports, ({ many }) => ({
  userPreferences: many(userPreferredSports),
}))

export const locationsRelations = relations(locations, ({ many }) => ({
  userLocations: many(userLocations),
  events: many(events),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, { fields: [events.organizerId], references: [users.id], relationName: 'organizer' }),
  location: one(locations, { fields: [events.locationId], references: [locations.id] }),
  participants: many(eventParticipants),
  interestedUsers: many(eventInterested),
  comments: many(comments),
  notifications: many(notifications),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  event: one(events, { fields: [comments.eventId], references: [events.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  parentComment: one(comments, { fields: [comments.parentCommentId], references: [comments.id], relationName: 'replies' }),
  replies: many(comments, { relationName: 'replies' }),
}))
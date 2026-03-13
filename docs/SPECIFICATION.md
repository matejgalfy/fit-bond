# FitBond Platform - Detailed System Specification

**Version:** 1.0  
**Date:** March 13, 2026  
**Scope:** Sport Event Planner & Creator Platform  
**Tech Stack:** React + TypeScript (Frontend), Elysia + Bun (Backend), SQLite (Database)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [User Roles & Actors](#user-roles--actors)
4. [Core Features](#core-features)
5. [Authentication & Authorization](#authentication--authorization)
6. [Data Models](#data-models)
7. [API Specification](#api-specification)
8. [Frontend Architecture](#frontend-architecture)
9. [Backend Architecture](#backend-architecture)
10. [Security & Compliance](#security--compliance)
11. [Performance & Scalability](#performance--scalability)
12. [Error Handling](#error-handling)
13. [Testing Strategy](#testing-strategy)
14. [Deployment](#deployment)
15. [Future Enhancements](#future-enhancements)

---

## Executive Summary

FitBond Platform is a global, free-to-use web application that connects sports enthusiasts and fitness-minded individuals. The platform enables users to discover, create, and participate in sports events tailored to their interests, locations, and skill levels. Users can browse public events, create private invite-only events, interact through comments, and receive timely reminders of upcoming activities. Administrators oversee community safety through moderation and enforcement.

**Key Benefits:**
- Discover local and global sports activities
- Create and manage events with flexible participant limits
- Connect with like-minded athletes and fitness enthusiasts
- Personalized event recommendations based on preferences
- Safe community environment with moderation tools

---

## System Overview

### 1.1 Platform Purpose

FitBond serves as a centralized hub for organizing and discovering sports events worldwide. Whether organizing a casual weekend football match or a professional training session, users have complete control over event parameters including sport type, skill level, time, location, and participant capacity.

### 1.2 User Base

- **Registered Users:** Can participate in events, create events, and interact with community
- **Guest Users:** Can browse public events but must register to participate
- **Administrators:** Manage platform integrity through moderation and user management

### 1.3 Geographic Scope

Worldwide support with no geographic restrictions.

### 1.4 Access Model

- **Web Application:** Responsive design for desktop, tablet, and mobile devices
- **No App Required:** Browser-based access via modern web browsers

---

## User Roles & Actors

### 2.1 User (Standard Account)

**Capabilities:**
- User account management (registration, login, logout, profile editing)
- Event discovery and search/filtering
- Event participation (join/leave)
- Event creation (public and private)
- Event management (edit, delete own events)
- Social interaction (comments, interest indicators)
- Preference management (location, sports, notifications)
- Reporting system (report inappropriate posts/profiles)
- Receive notifications and event reminders

**Constraints:**
- Cannot moderate other users' content
- Cannot ban users
- Cannot delete or edit events they don't own
- Cannot view private events they're not invited to

### 2.2 Administrator

**Capabilities:**
- All user capabilities plus:
- Ban/suspend users from platform
- Moderate posts (edit, delete comments and event descriptions)
- Edit user profiles (if needed for violations)
- View all events (including private ones when investigating)
- Review incident reports
- Manage platform-wide policies

**Constraints:**
- Should follow moderation policies and guidelines
- Actions logged for audit purposes

---

## Core Features

### 3.1 Authentication & Account Management

#### 3.1.1 User Registration
- **Method:** OAuth 2.0 (Google and GitHub supported)
- **Process:**
  1. User clicks "Sign Up" button
  2. Redirected to OAuth provider (Google/GitHub)
  3. User authorizes FitBond access
  4. OAuth provider returns user info (email, name, profile picture)
  5. Backend creates user account with OAuth credentials
  6. User redirected to onboarding flow
- **Data Captured:** Email, name, profile picture URL, OAuth provider, OAuth ID
- **Session Management:** JWT tokens with refresh tokens (24-hour expiration)

#### 3.1.2 Login
- OAuth-based login
- Automatic session restoration using refresh tokens
- Session timeout and forced logout after 30 days of inactivity

#### 3.1.3 Logout
- Clear JWT tokens from client
- Invalidate refresh token on server
- Redirect to home page

#### 3.1.4 Profile Management
- **View Profile:**
  - Own profile dashboard
  - Public profile view for other users (name, bio, join date, sports interests)
  
- **Edit Profile:**
  - Update bio/description
  - Update profile picture (optional upload)
  - Update sports interests
  - Update preferred locations
  - Privacy settings

### 3.2 Event Discovery & Search

#### 3.2.1 Browse Events
- List all public events
- Default sorting: soonest events first
- Paginated results (20 per page)
- Event cards display: sport type, date/time, location, organizer, participant count

#### 3.2.2 Search & Filter Events
**Search Criteria:**
- Sport type (multi-select)
- Date range (from/to)
- Location (radius search: user's location or search address + radius in km)
- Skill level (beginner, intermediate, advanced)
- Participant availability (has spots available)

**Advanced Filters:**
- Recurring/One-time events
- Free/Paid distinction (for future use)
- Organizer reputation (future: ratings)

#### 3.2.3 Event Details View
- Full event description
- Participant list (showing attendees)
- Participant count and capacity
- Event rules/requirements
- Comments section
- Organizer contact/profile
- Join/Leave buttons
- Cancel event option (for organizer)

### 3.3 Event Creation & Management

#### 3.3.1 Create Public Event
**Required Fields:**
- Event name
- Sport type
- Description
- Date and time (start time, duration in hours)
- Location (address or coordinates + map display)
- Skill level (beginner, intermediate, advanced)
- Participant capacity (number, no cap option available)
- Contact details (email or phone for participants)

**Optional Fields:**
- Event cover image/photo
- Event rules/requirements
- Equipment needed
- Fees/cost information (for future payments)
- Recurring event setup (daily, weekly, monthly)

**Visibility:**
- Public by default
- Searchable and discoverable by all users
- Appears in event feeds

#### 3.3.2 Create Private Event
**Same Fields as Public + Privacy:**
- Marked as private/invite-only
- Not searchable or visible in discovery
- Organizer must manually invite participants
- Invitation sent via URL or direct invite

#### 3.3.3 Event Management (by Organizer)

**Edit Event:**
- Modify any event details before event occurs
- Changes logged with edit history
- Participants notified of significant changes (time/location/cancellation)

**Delete Event:**
- Can delete before event occurs
- Participants notified of cancellation
- Event removed from all user calendars

**Manage Participants:**
- View participant list
- For private events: manually invite, accept join requests
- Remove participants (if needed)
- Set organizer notes about participants

### 3.4 Skill Level Management

#### 3.4.1 Skill Level Definition
- **Beginner:** Introductory level, no prior experience required
- **Intermediate:** Some experience, basic competency expected
- **Advanced:** High skill level, serious competitors

#### 3.4.2 Organizer Controls
- Set minimum skill level for event
- Display skill level requirements clearly
- Block join attempts from below-skill users (optional enforcement)

#### 3.4.3 User Skill Level
- Users can set their skill level for each sport in profile
- Used to filter events
- Self-reported (for MVP; future: skill validation)

### 3.5 Participant Interaction

#### 3.5.1 Join Event
- Click "Join Event" button
- For public events: instant join (if capacity available)
- For private events: send join request to organizer
- Confirmation message and event added to user's calendar

#### 3.5.2 Interest Indicator
- "Interested" button separate from "Join"
- Allows users to express interest without committing
- Organizer sees interested users
- User can convert interest to join later

#### 3.5.3 Comments
**Features:**
- Users can comment on events
- Comments displayed chronologically
- Edit own comments
- Delete own comments
- Reply to comments (nested comments, 1 level deep)
- Profanity filter (basic)

**Permissions:**
- Organizer can delete inappropriate comments
- Admins can moderate comments

### 3.6 User Preferences

#### 3.6.1 Preferred Locations
- Add multiple preferred cities/regions
- Receive location-based event recommendations
- Set location radius preference (5km - 100km)

#### 3.6.2 Preferred Sports
- Select multiple sports of interest
- Primary and secondary sports
- Used for event recommendations
- Can be updated anytime

#### 3.6.3 Notification Preferences
- In-app notifications enabled/disabled
- Email notifications enabled/disabled
- Reminder frequency:
  - 1 day before event
  - 1 hour before event
  - Customizable reminder times

### 3.7 Notifications & Reminders

#### 3.7.1 In-App Notifications
**Types:**
- Event reminder (scheduled)
- Event joined confirmation
- Participant joined your event (for organizers)
- Comment on your event
- Join request for private event
- Event cancelled/rescheduled

**Delivery:**
- Badge counter on notification icon
- Notification panel with list
- Mark as read/unread
- Delete notifications

#### 3.7.2 Email Notifications
- Opt-in/opt-out by notification type
- Scheduled delivery (daily digest or immediate)
- Plain text and HTML versions
- Unsubscribe link in every email

#### 3.7.3 Event Reminders
**Scheduled Reminders:**
- 7 days before event (optional)
- 1 day before event (default)
- 1 hour before event (push-to-email)
- Customizable reminder times in preferences

### 3.8 Reporting & Moderation

#### 3.8.1 Report Post
**Report Types:**
- Inappropriate content
- Spam
- Harassment
- Dangerous activity
- Misinformation

**Process:**
1. User clicks "Report" on event/comment
2. Selects reason for report
3. Optionally adds description
4. Submission confirmation
5. Admin reviews report

#### 3.8.2 Report Profile
**Report Types:**
- Fake profile
- Harassment/aggressive behavior
- Sharing private information
- Scamming/fraud attempt

**Process:**
- Same as post reporting
- Flags user account for review
- Admin can suspend/ban account

#### 3.8.3 Admin Moderation
**Actions Available:**
- View flagged content
- View report history
- Edit/delete inappropriate content
- Send warning to user
- Suspend user (7-30 days)
- Permanently ban user
- Restore deleted content

**Audit Trail:**
- All moderation actions logged
- Date, admin ID, reason, content snapshot
- Appeal process placeholder (future)

---

## Authentication & Authorization

### 4.1 OAuth 2.0 Integration

#### 4.1.1 Google OAuth
- **Client ID:** Stored in environment variables
- **Redirect URI:** `https://domain.com/oauth/google/callback`
- **Scopes:** `openid`, `email`, `profile`

#### 4.1.2 GitHub OAuth
- **Client ID:** Stored in environment variables
- **Redirect URI:** `https://domain.com/oauth/github/callback`
- **Scopes:** `user:email`, `read:user`

### 4.2 JWT Token Management

**Access Token:**
- Expires after 24 hours
- Contains: user ID, email, role
- Sent in Authorization header: `Bearer <token>`

**Refresh Token:**
- Expires after 30 days
- Securely stored in HTTPOnly cookies
- Used to obtain new access tokens
- Single-use or rotating refresh tokens recommended

**Token Validation:**
- All API endpoints except public routes verify JWT
- Invalid/expired tokens return 401 Unauthorized

### 4.3 Authorization Levels

**Public Routes (No Auth Required):**
- GET /api/events (public events browse)
- GET /api/events/:id (public event details)
- GET /api/sports (list of sports)
- POST /oauth/google/callback
- POST /oauth/github/callback
- GET /api/health

**Authenticated Routes (User Auth Required):**
- POST /api/events (create event)
- POST /api/events/:id/join
- POST /api/events/:id/comment
- PUT /api/profile
- GET /api/user/events
- POST /api/notifications/read

**Admin Routes (Admin Role Required):**
- DELETE /api/reports/:id (handle report)
- PUT /api/users/:id/ban
- DELETE /api/comments/:id (moderation)
- PUT /api/events/:id (moderate event)

---

## Data Models

### 5.1 User Model

```typescript
interface User {
  id: string; // UUID
  oauthProvider: 'google' | 'github';
  oauthId: string;
  email: string;
  name: string;
  profilePictureUrl?: string; // Optional custom picture
  bio?: string;
  joinDate: Date;
  lastLogin: Date;
  role: 'user' | 'admin';
  isBanned: boolean;
  bannedUntil?: Date; // Null if permanent ban
  bannedReason?: string;
  preferredLocations: Location[];
  preferredSports: Sport[];
  notificationPreferences: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Event Model

```typescript
interface Event {
  id: string; // UUID
  organizerId: string; // Foreign key to User
  name: string;
  description: string;
  sportType: Sport;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  startTime: Date;
  duration: number; // in hours
  location: {
    address: string;
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  capacity: number | null; // null = unlimited
  currentParticipants: number;
  isPublic: boolean;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: Date;
  rules?: string;
  requirements?: string;
  equipmentNeeded?: string[];
  coverImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  participants: string[]; // User IDs
  interestedUsers: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}
```

### 5.3 Comment Model

```typescript
interface Comment {
  id: string; // UUID
  eventId: string; // Foreign key to Event
  userId: string; // Foreign key to User
  content: string;
  parentCommentId?: string; // For nested comments (optional)
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedBy?: 'user' | 'organizer' | 'admin';
  deletionReason?: string;
}
```

### 5.4 Sport Model

```typescript
interface Sport {
  id: string; // UUID
  name: string; // e.g., "Football", "Tennis", "Yoga"
  category: string; // e.g., "Team Sport", "Individual", "Fitness"
  icon?: string; // Icon URL or identifier
  description: string;
}
```

### 5.5 Notification Model

```typescript
interface Notification {
  id: string; // UUID
  userId: string; // Foreign key to User
  type: 'reminder' | 'event_update' | 'comment' | 'join_request' | 'other';
  title: string;
  message: string;
  eventId?: string; // If related to event
  relatedUserId?: string; // If related to user action
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}
```

### 5.6 Report Model

```typescript
interface Report {
  id: string; // UUID
  reporterId: string; // User who reported
  reportType: 'post' | 'profile';
  targetId: string; // Event ID or User ID being reported
  reason: 'inappropriate' | 'spam' | 'harassment' | 'dangerous' | 'fraud' | 'other';
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  resolvedAt?: Date;
  resolvedBy?: string; // Admin ID
  resolution?: string; // Action taken
  createdAt: Date;
}
```

### 5.7 Location Model

```typescript
interface Location {
  id: string; // UUID
  userId: string; // Foreign key to User
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  radius: number; // in km
  label: string; // e.g., "Home", "Work"
  isPrimary: boolean;
}
```

### 5.8 NotificationPreferences Model

```typescript
interface NotificationPreferences {
  inAppReminders: boolean;
  emailReminders: boolean;
  reminderTimes: number[]; // hours before event [24, 1]; // 24 hours and 1 hour
  emailDigest: 'immediate' | 'daily' | 'weekly' | 'none';
  eventUpdatesNotification: boolean;
  commentNotifications: boolean;
}
```

---

## API Specification

### 6.1 Authentication Endpoints

#### 6.1.1 Google OAuth Callback
```
POST /oauth/google/callback
Content-Type: application/json

Request Body:
{
  "code": "string", // Authorization code from Google
  "redirectUri": "string"
}

Response (Success - 200):
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "profilePictureUrl": "string"
  }
}

Response (Error - 400):
{
  "error": "string",
  "message": "string"
}
```

#### 6.1.2 GitHub OAuth Callback
```
POST /oauth/github/callback
Content-Type: application/json

Request Body:
{
  "code": "string",
  "redirectUri": "string"
}

Response: (Same as Google)
```

#### 6.1.3 Refresh Token
```
POST /auth/refresh
Content-Type: application/json
Cookie: refreshToken=string

Response (Success - 200):
{
  "accessToken": "string",
  "refreshToken": "string"
}

Response (Error - 401):
{
  "error": "Invalid or expired refresh token"
}
```

#### 6.1.4 Logout
```
POST /auth/logout
Authorization: Bearer <accessToken>

Response (Success - 200):
{
  "message": "Logged out successfully"
}
```

### 6.2 User Endpoints

#### 6.2.1 Get User Profile
```
GET /api/users/:userId
Authorization: Bearer <accessToken> (Optional for public profile)

Response (Success - 200):
{
  "id": "string",
  "name": "string",
  "email": "string", // Only own profile
  "profilePictureUrl": "string",
  "bio": "string",
  "joinDate": "ISO-8601 date",
  "preferredSports": ["Football", "Tennis"],
  "eventsOrganized": 5,
  "eventsParticipated": 12
}
```

#### 6.2.2 Update User Profile
```
PUT /api/users/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "name": "string", // Optional
  "bio": "string", // Optional
  "preferredSports": ["string"], // Optional
  "preferredLocations": [{
    "address": "string",
    "city": "string",
    "country": "string",
    "latitude": number,
    "longitude": number,
    "radius": number,
    "label": "string",
    "isPrimary": boolean
  }], // Optional
  "notificationPreferences": {...} // Optional
}

Response (Success - 200):
{
  "id": "string",
  "name": "string",
  "bio": "string",
  "preferredSports": ["string"],
  "updatedAt": "ISO-8601 date"
}
```

#### 6.2.3 Upload Profile Picture
```
POST /api/users/profile-picture
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Request:
{
  "file": <image file>
}

Response (Success - 200):
{
  "profilePictureUrl": "string"
}
```

### 6.3 Event Endpoints

#### 6.3.1 List Public Events
```
GET /api/events?page=1&limit=20&sort=date&order=asc
Authorization: Optional (Bearer <accessToken>)

Query Parameters:
- page: 1 (default)
- limit: 20 (default, max 100)
- sort: 'date' | 'created' | 'participants' (default: 'date')
- order: 'asc' | 'desc'
- sport: string[] (comma-separated, optional)
- skillLevel: 'beginner' | 'intermediate' | 'advanced' (optional)
- location: string (city name, optional)
- radius: number (km, default 50, optional)
- fromDate: ISO-8601 (optional)
- toDate: ISO-8601 (optional)
- hasCapacity: boolean (default false, optional)

Response (Success - 200):
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "sport": "string",
      "skillLevel": "string",
      "startTime": "ISO-8601",
      "location": {...},
      "capacity": number | null,
      "currentParticipants": number,
      "organizer": {
        "id": "string",
        "name": "string"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### 6.3.2 Get Event Details
```
GET /api/events/:eventId
Authorization: Optional

Response (Success - 200):
{
  "id": "string",
  "name": "string",
  "description": "string",
  "sport": "string",
  "skillLevel": "string",
  "startTime": "ISO-8601",
  "duration": number,
  "location": {
    "address": "string",
    "latitude": number,
    "longitude": number,
    "city": "string",
    "country": "string"
  },
  "capacity": number | null,
  "currentParticipants": number,
  "isPublic": true,
  "rules": "string",
  "coverImageUrl": "string",
  "organizer": {
    "id": "string",
    "name": "string",
    "profilePictureUrl": "string"
  },
  "participants": [
    {
      "id": "string",
      "name": "string",
      "profilePictureUrl": "string"
    }
  ],
  "isUserParticipant": boolean, // Only if authenticated
  "isUserInterested": boolean, // Only if authenticated
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

#### 6.3.3 Create Event
```
POST /api/events
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "name": "string", // Required
  "description": "string", // Required
  "sportType": "string", // Required
  "skillLevel": "beginner" | "intermediate" | "advanced", // Required
  "startTime": "ISO-8601", // Required
  "duration": number, // Required (hours)
  "location": {
    "address": "string", // Required
    "latitude": number, // Required
    "longitude": number, // Required
    "city": "string", // Required
    "country": "string" // Required
  },
  "capacity": number | null, // Optional (null = unlimited)
  "isPublic": boolean, // Default: true
  "rules": "string", // Optional
  "requirements": "string", // Optional
  "equipmentNeeded": ["string"], // Optional
  "contactEmail": "string", // Optional
  "contactPhone": "string", // Optional
  "isRecurring": boolean, // Default: false
  "recurringPattern": "daily" | "weekly" | "monthly", // Optional
  "recurringEndDate": "ISO-8601" // Optional
}

Response (Success - 201):
{
  "id": "string",
  "name": "string",
  "organizerId": "string",
  "createdAt": "ISO-8601"
}
```

#### 6.3.4 Update Event
```
PUT /api/events/:eventId
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body: (Same as Create, all fields optional)

Response (Success - 200):
{
  "id": "string",
  "updatedAt": "ISO-8601",
  "message": "Event updated successfully"
}

Response (Error - 403):
{
  "error": "Unauthorized - only event organizer can edit"
}
```

#### 6.3.5 Delete Event
```
DELETE /api/events/:eventId
Authorization: Bearer <accessToken>

Response (Success - 200):
{
  "message": "Event deleted successfully"
}

Response (Error - 403):
{
  "error": "Unauthorized - only event organizer can delete"
}

Response (Error - 400):
{
  "error": "Cannot delete past events"
}
```

#### 6.3.6 Upload Event Cover Image
```
POST /api/events/:eventId/cover
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Request:
{
  "file": <image file>
}

Response (Success - 200):
{
  "coverImageUrl": "string"
}
```

### 6.4 Participation Endpoints

#### 6.4.1 Join Event
```
POST /api/events/:eventId/join
Authorization: Bearer <accessToken>

Response (Success - 200):
{
  "message": "Successfully joined event",
  "event": {
    "id": "string",
    "currentParticipants": number
  }
}

Response (Error - 400):
{
  "error": "Event is at capacity" | "Already joined" | "Event is in the past"
}
```

#### 6.4.2 Leave Event
```
POST /api/events/:eventId/leave
Authorization: Bearer <accessToken>

Response (Success - 200):
{
  "message": "Successfully left event",
  "event": {
    "id": "string",
    "currentParticipants": number
  }
}

Response (Error - 400):
{
  "error": "Not a participant" | "Event has already started"
}
```

#### 6.4.3 Set Interest
```
POST /api/events/:eventId/interest
Authorization: Bearer <accessToken>

Request Body:
{
  "interested": boolean // true to mark interested, false to remove
}

Response (Success - 200):
{
  "message": "Interest updated successfully",
  "interested": boolean
}
```

#### 6.4.4 Get User's Events
```
GET /api/users/profile/events?type=participating|organizing|all
Authorization: Bearer <accessToken>

Query Parameters:
- type: 'participating' | 'organizing' | 'interested' | 'all' (default: 'all')
- from: ISO-8601 date (optional)
- to: ISO-8601 date (optional)

Response (Success - 200):
{
  "organizing": [{...event objects...}],
  "participating": [{...event objects...}],
  "interested": [{...event objects...}]
}
```

### 6.5 Comment Endpoints

#### 6.5.1 Get Event Comments
```
GET /api/events/:eventId/comments?page=1&limit=50
Authorization: Optional

Query Parameters:
- page: 1 (default)
- limit: 50 (default)

Response (Success - 200):
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "userPicture": "string",
      "content": "string",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601",
      "replies": [
        {
          "id": "string",
          "userId": "string",
          "userName": "string",
          "content": "string",
          "createdAt": "ISO-8601"
        }
      ]
    }
  ],
  "pagination": {...}
}
```

#### 6.5.2 Post Comment
```
POST /api/events/:eventId/comments
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "content": "string", // Required, 1-500 characters
  "parentCommentId": "string" // Optional, for replies
}

Response (Success - 201):
{
  "id": "string",
  "userId": "string",
  "content": "string",
  "createdAt": "ISO-8601"
}
```

#### 6.5.3 Update Comment
```
PUT /api/events/:eventId/comments/:commentId
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "content": "string" // Required
}

Response (Success - 200):
{
  "id": "string",
  "content": "string",
  "updatedAt": "ISO-8601"
}

Response (Error - 403):
{
  "error": "Unauthorized - only comment author can edit"
}
```

#### 6.5.4 Delete Comment
```
DELETE /api/events/:eventId/comments/:commentId
Authorization: Bearer <accessToken>

Response (Success - 200):
{
  "message": "Comment deleted successfully"
}

Response (Error - 403):
{
  "error": "Unauthorized"
}
```

### 6.6 Notification Endpoints

#### 6.6.1 Get Notifications
```
GET /api/notifications?page=1&limit=20&unreadOnly=false
Authorization: Bearer <accessToken>

Query Parameters:
- page: 1 (default)
- limit: 20 (default)
- unreadOnly: boolean (default: false)

Response (Success - 200):
{
  "data": [
    {
      "id": "string",
      "type": "string",
      "title": "string",
      "message": "string",
      "isRead": boolean,
      "createdAt": "ISO-8601"
    }
  ],
  "unreadCount": number,
  "pagination": {...}
}
```

#### 6.6.2 Mark Notification as Read
```
POST /api/notifications/:notificationId/read
Authorization: Bearer <accessToken>

Response (Success - 200):
{
  "message": "Marked as read"
}
```

#### 6.6.3 Mark All Notifications as Read
```
POST /api/notifications/read-all
Authorization: Bearer <accessToken>

Response (Success - 200):
{
  "message": "All notifications marked as read"
}
```

#### 6.6.4 Delete Notification
```
DELETE /api/notifications/:notificationId
Authorization: Bearer <accessToken>

Response (Success - 200):
{
  "message": "Notification deleted"
}
```

### 6.7 Reporting Endpoints

#### 6.7.1 Report Post/Event
```
POST /api/reports
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "reportType": "post" | "profile", // Required
  "targetId": "string", // Event or User ID
  "reason": "inappropriate" | "spam" | "harassment" | "dangerous" | "fraud" | "other",
  "description": "string" // Optional
}

Response (Success - 201):
{
  "id": "string",
  "message": "Report submitted successfully. Our team will review it shortly."
}

Response (Error - 400):
{
  "error": "Already reported this content"
}
```

### 6.8 Admin Endpoints

#### 6.8.1 Get Reports
```
GET /api/admin/reports?status=pending|reviewing|resolved&page=1&limit=20
Authorization: Bearer <adminToken>

Response (Success - 200):
{
  "data": [
    {
      "id": "string",
      "reporterId": "string",
      "reportType": "string",
      "targetId": "string",
      "reason": "string",
      "description": "string",
      "status": "string",
      "createdAt": "ISO-8601"
    }
  ],
  "pagination": {...}
}
```

#### 6.8.2 Resolve Report
```
PUT /api/admin/reports/:reportId
Authorization: Bearer <adminToken>
Content-Type: application/json

Request Body:
{
  "status": "resolved" | "dismissed",
  "resolution": "string" // Action taken
}

Response (Success - 200):
{
  "message": "Report resolved",
  "reportId": "string"
}
```

#### 6.8.3 Delete Content (Moderate)
```
DELETE /api/admin/comments/:commentId
Authorization: Bearer <adminToken>
Content-Type: application/json

Request Body:
{
  "reason": "string" // Reason for deletion (logged)
}

Response (Success - 200):
{
  "message": "Comment deleted"
}
```

#### 6.8.4 Ban User
```
POST /api/admin/users/:userId/ban
Authorization: Bearer <adminToken>
Content-Type: application/json

Request Body:
{
  "reason": "string", // Required
  "duration": "permanent" | number // Duration in days or "permanent"
}

Response (Success - 200):
{
  "message": "User banned successfully",
  "bannedUntil": "ISO-8601" | "permanent"
}
```

#### 6.8.5 Unban User
```
POST /api/admin/users/:userId/unban
Authorization: Bearer <adminToken>

Response (Success - 200):
{
  "message": "User unbanned successfully"
}
```

---

## Frontend Architecture

### 7.1 Technology Stack

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite (specified in project config)
- **Styling:** CSS + Tailwind CSS
- **State Management:** React Context API + hooks (or Redux if needed)
- **HTTP Client:** Fetch API or Axios
- **Routing:** React Router v6
- **UI Components:** Custom components + optional UI library (e.g., shadcn/ui)
- **Forms:** React Hook Form + Zod validation
- **Testing:** Vitest + React Testing Library

### 7.2 Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── auth/          # Auth-related components
│   │   ├── events/        # Event components
│   │   ├── common/        # Common/shared components
│   │   └── admin/         # Admin-only components
│   ├── pages/             # Page-level components
│   │   ├── Home.tsx
│   │   ├── EventDetail.tsx
│   │   ├── CreateEvent.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SearchEvents.tsx
│   │   └── NotFound.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   ├── useNotifications.ts
│   │   └── useUser.ts
│   ├── services/          # API service layer
│   │   ├── authService.ts
│   │   ├── eventService.ts
│   │   ├── userService.ts
│   │   ├── notificationService.ts
│   │   └── reportService.ts
│   ├── context/           # React Context
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── types/             # TypeScript types/interfaces
│   │   ├── index.ts
│   │   └── api.ts
│   ├── utils/             # Utility functions
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 7.3 Key Pages & Components

#### 7.3.1 Home Page
- Navigation bar with search
- Featured events carousel
- Event list with filters
- "Create Event" CTA button
- User recommendations based on preferences

#### 7.3.2 Event Discovery/Search Page
- Advanced filter sidebar
- Search results with pagination
- Map view option (future)
- Sorting options

#### 7.3.3 Event Detail Page
- Full event information
- Participant list
- Comments section
- Join/Leave/Interested buttons
- Organizer profile card
- Map showing event location

#### 7.3.4 Create/Edit Event Page
- Form with validation
- Date/time picker
- Location picker (map integration)
- Image upload for cover
- Preview of event details

#### 7.3.5 User Profile Page
- User information and stats
- Events organized
- Events participating in
- Edit profile button
- Notification preferences
- Preferred sports/locations

#### 7.3.6 Admin Dashboard (Future)
- Reports queue
- User management
- Content moderation tools
- Analytics/statistics

### 7.4 Authentication Flow

```
1. User navigates to /login
2. Clicks "Sign up with Google/GitHub"
3. Redirected to OAuth provider
4. OAuth provider redirects to /oauth/[provider]/callback
5. Frontend sends authorization code to backend
6. Backend exchanges code for tokens
7. Frontend stores JWT tokens (localStorage/sessionStorage)
8. Frontend redirects to /onboarding (first time) or home
9. Subsequent requests include JWT in Authorization header
10. Token refresh happens transparently when needed
```

### 7.5 State Management Approach

**User Authentication State:**
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Using Context + useReducer
const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

**Events State:**
- Cache recent events
- Pagination handling
- Filter state
- Use query parameters for URL bookmarking

**Notifications:**
- Real-time via polling
- Cache with update frequency
- Badge counter

### 7.6 API Integration (Services)

**Example: Event Service**
```typescript
export const eventService = {
  getAllEvents: (filters: EventFilters) => 
    fetch(`/api/events?...`).then(r => r.json()),
  
  getEventById: (id: string) => 
    fetch(`/api/events/${id}`).then(r => r.json()),
  
  createEvent: (data: CreateEventInput) =>
    authenticatedFetch('/api/events', { method: 'POST', body: JSON.stringify(data) }),
  
  joinEvent: (eventId: string) =>
    authenticatedFetch(`/api/events/${eventId}/join`, { method: 'POST' }),
    
  // ... more methods
};
```

### 7.7 Responsive Design

- Mobile-first approach
- Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Touch-friendly buttons/inputs (min 44px x 44px)
- Responsive grid layouts using CSS Grid/Flexbox
- Mobile navigation drawer/hamburger menu

---

## Backend Architecture

### 8.1 Technology Stack

- **Runtime:** Bun
- **Framework:** Elysia
- **Database:** SQLite (using `bun:sqlite`)
- **ORM:** None (raw SQL or query builder)
- **Authentication:** JWT (custom implementation)
- **Email:** Nodemailer or Bun SMTP integration
- **File Storage:** Local filesystem or cloud storage (S3/Cloudinary)
- **Testing:** Bun test framework
- **Validation:** Zod

### 8.2 Project Structure

```
backend/
├── src/
│   ├── index.ts               # Entry point
│   ├── config/                # Configuration
│   │   ├── env.ts             # Environment variables
│   │   └── db.ts              # Database setup
│   ├── routes/                # Route definitions
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── events.ts
│   │   ├── comments.ts
│   │   ├── notifications.ts
│   │   ├── reports.ts
│   │   └── admin.ts
│   ├── controllers/           # Business logic
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── eventController.ts
│   │   ├── commentController.ts
│   │   ├── notificationController.ts
│   │   ├── reportController.ts
│   │   └── adminController.ts
│   ├── services/              # Database operations
│   │   ├── userService.ts
│   │   ├── eventService.ts
│   │   ├── commentService.ts
│   │   ├── notificationService.ts
│   │   └── reportService.ts
│   ├── middleware/            # Middleware
│   │   ├── auth.ts            # JWT verification
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── logger.ts
│   ├── utils/                 # Utilities
│   │   ├── jwt.ts
│   │   ├── oauth.ts
│   │   ├── email.ts
│   │   └── validators.ts
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── db/                    # Database
│   │   ├── schema.sql         # Database schema
│   │   └── migrations/        # Migration scripts
│   └── tests/                 # Tests
│       └── *.test.ts
├── package.json
├── tsconfig.json
└── .env                       # Environment variables
```

### 8.3 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  oauth_provider TEXT NOT NULL, -- 'google' | 'github'
  oauth_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  profile_picture_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  is_banned BOOLEAN DEFAULT FALSE,
  banned_until DATETIME,
  banned_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(oauth_provider, oauth_id)
);

-- User preferences (one-to-one)
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  preferred_sports TEXT, -- JSON array
  notification_prefs TEXT, -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User locations
CREATE TABLE user_locations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  radius INTEGER DEFAULT 50, -- km
  label TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sports table (reference table)
CREATE TABLE sports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  icon TEXT,
  description TEXT
);

-- Events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  organizer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  skill_level TEXT NOT NULL, -- 'beginner' | 'intermediate' | 'advanced'
  start_time DATETIME NOT NULL,
  duration INTEGER NOT NULL, -- hours
  location_address TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_country TEXT NOT NULL,
  location_latitude REAL NOT NULL,
  location_longitude REAL NOT NULL,
  capacity INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT, -- 'daily' | 'weekly' | 'monthly'
  recurring_end_date DATETIME,
  rules TEXT,
  requirements TEXT,
  equipment_needed TEXT, -- JSON array
  cover_image_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  cancelled_at DATETIME,
  cancellation_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Event participants junction table
CREATE TABLE event_participants (
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Event interested users junction table
CREATE TABLE event_interested (
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  interested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  parent_comment_id TEXT,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_by TEXT, -- 'user' | 'organizer' | 'admin'
  deletion_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'reminder' | 'event_update' | 'comment' | etc
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  event_id TEXT,
  related_user_id TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reports table
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'post' | 'profile'
  target_id TEXT NOT NULL, -- Event or User ID
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  resolved_at DATETIME,
  resolved_by TEXT,
  resolution TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for common queries
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_sport ON events(sport_type);
CREATE INDEX idx_events_skill_level ON events(skill_level);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_public ON events(is_public);
CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_user ON event_participants(user_id);
CREATE INDEX idx_comments_event ON comments(event_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_reports_status ON reports(status);
```

### 8.4 Core Services Implementation

**JWT Service (utils/jwt.ts)**
```typescript
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const jwtService = {
  generateAccessToken: (payload: TokenPayload): string => {
    // Generate JWT with 24-hour expiration
  },

  generateRefreshToken: (userId: string): string => {
    // Generate refresh token with 30-day expiration
  },

  verifyAccessToken: (token: string): TokenPayload | null => {
    // Verify and decode JWT
  },

  refreshAccessToken: (refreshToken: string): string => {
    // Exchange refresh token for new access token
  }
};
```

**OAuth Service (utils/oauth.ts)**
```typescript
export const oauthService = {
  generateGoogleAuthUrl: () => {
    // Generate Google OAuth authorization URL
  },

  exchangeGoogleCode: (code: string, redirectUri: string) => {
    // Exchange authorization code for tokens
    // Fetch user info from Google
  },

  generateGithubAuthUrl: () => {
    // Generate GitHub OAuth authorization URL
  },

  exchangeGithubCode: (code: string, redirectUri: string) => {
    // Exchange authorization code for tokens
    // Fetch user info from GitHub
  }
};
```

**Event Service (services/eventService.ts)**
```typescript
export const eventService = {
  createEvent: (userId: string, data: CreateEventInput) => {
    // Insert into database
    // Create initial entry in event_participants for organizer
  },

  getPublicEvents: (filters: EventFilters, page: number, limit: number) => {
    // Query events where is_public = TRUE
    // Apply filters and pagination
  },

  getEventById: (eventId: string) => {
    // Query event by ID with related data
  },

  updateEvent: (eventId: string, userId: string, data: UpdateEventInput) => {
    // Verify ownership, update event
  },

  deleteEvent: (eventId: string, userId: string) => {
    // Verify ownership, mark as cancelled or delete
  },

  joinEvent: (eventId: string, userId: string) => {
    // Check capacity, add to event_participants, update count
  },

  leaveEvent: (eventId: string, userId: string) => {
    // Remove from event_participants, update count
  }
};
```

### 8.5 Route Setup with Elysia

```typescript
// routes/events.ts
import { Elysia } from 'elysia';
import { authMiddleware } from '../middleware/auth';
import * as eventController from '../controllers/eventController';

export const eventsRoutes = (app: Elysia) =>
  app
    .get('/api/events', eventController.listEvents)
    .get('/api/events/:id', eventController.getEventDetail)
    .post('/api/events', authMiddleware, eventController.createEvent)
    .put('/api/events/:id', authMiddleware, eventController.updateEvent)
    .delete('/api/events/:id', authMiddleware, eventController.deleteEvent)
    .post('/api/events/:id/join', authMiddleware, eventController.joinEvent)
    .post('/api/events/:id/leave', authMiddleware, eventController.leaveEvent)
    .post('/api/events/:id/interest', authMiddleware, eventController.setInterest);

// index.ts
const app = new Elysia()
  .get('/api/health', () => ({ status: 'ok' }))
  .use(eventsRoutes)
  .use(usersRoutes)
  .use(authRoutes)
  .use(commentsRoutes)
  .use(notificationsRoutes)
  .use(reportsRoutes)
  .use(adminRoutes)
  .listen(process.env.PORT || 3000);
```

### 8.6 Authentication Middleware

```typescript
// middleware/auth.ts
import { Context } from 'elysia';
import { jwtService } from '../utils/jwt';

export const authMiddleware = async (context: Context) => {
  const token = context.request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return { error: 'Missing authorization token' };
  }

  const payload = jwtService.verifyAccessToken(token);
  
  if (!payload) {
    context.set.status = 401;
    return { error: 'Invalid or expired token' };
  }

  // Attach user info to context
  context.user = payload;
  
  return null; // Continue to next handler
};
```

### 8.7 Error Handling Strategy

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
  }
}

// Global error handler
app.onError(({ error, context }) => {
  if (error instanceof AppError) {
    context.set.status = error.statusCode;
    return { error: error.message, code: error.code };
  }

  // Log unexpected errors
  console.error(error);
  
  context.set.status = 500;
  return { error: 'Internal server error' };
});
```

### 8.8 Background Jobs (Email Reminders)

```typescript
// Example: Send event reminders
async function sendEventReminders() {
  // Query events happening in the next 24 hours
  const upcomingEvents = db.prepare(`
    SELECT e.*, u.email 
    FROM events e
    JOIN user_locations ul ON ST_Distance(...)
    WHERE e.start_time > datetime('now') 
    AND e.start_time <= datetime('now', '+24 hours')
  `).all();

  for (const event of upcomingEvents) {
    // Send email to participants
    await emailService.sendEventReminder(event);
  }
}

// Run periodically (e.g., every hour)
setInterval(sendEventReminders, 3600000);
```

---

## Security & Compliance

### 9.1 Authentication Security

- **JWT Signing:** Use HS256 or RS256 algorithm with strong secret key
- **Refresh Token Rotation:** Invalidate old refresh tokens
- **HTTPOnly Cookies:** Store refresh tokens in HTTPOnly, Secure cookies only
- **CORS:** Whitelist allowed origins
- **Rate Limiting:** Implement on auth endpoints (max 5 login attempts per IP per 15 minutes)

### 9.2 Data Protection

- **Password:** Not applicable (OAuth-based)
- **Account Reset:** OAuth provider handles recovery
- **PII Handling:** Encrypt sensitive PII in database (optional)
- **Data Retention:** Default retention 2 years after last login, with privacy controls

### 9.3 Input Validation & Sanitization

- **Server-side Validation:** All inputs validated using Zod
- **SQL Injection Prevention:** Use parameterized queries
- **XSS Prevention:** Sanitize user-generated content before storage and display
- **Content Length Limits:** Comments (500 chars), descriptions (5000 chars)

### 9.4 API Security

- **HTTPS Only:** All production endpoints use HTTPS
- **Rate Limiting:** 100 requests per minute per user
- **Request Size Limit:** Max payload 10 MB
- **API Versioning:** Optional, use /api/v1/ for versioning

### 9.5 File Upload Security

- **File Type Validation:** Only accept image formats (jpg, png, webp)
- **File Size Limit:** Max 5 MB per image
- **Virus Scanning:** Optional (e.g., ClamAV)
- **Storage:** Store outside webroot, serve through CDN

### 9.6 Compliance

- **GDPR:** Privacy policy, data export/deletion functionality
- **Terms of Service:** Clear platform guidelines
- **Reporting/Moderation:** System in place for user safety
- **Age Restriction:** Optional (13+ or 18+ if including sports with age restrictions)

---

## Performance & Scalability

### 10.1 Frontend Optimization

- **Code Splitting:** Lazy load pages with React.lazy()
- **Image Optimization:** Use WebP format, responsive images
- **Caching:** Service Worker for offline support (future)
- **Bundle Size:** Keep under 200 KB (gzipped)
- **Performance Monitoring:** Integrate Sentry or similar

### 10.2 Backend Optimization

- **Database Indexing:** Create indexes on frequently queried columns
- **Query Optimization:** Use EXPLAIN to analyze slow queries
- **Caching:** Redis for session data and hot data (future)
- **Pagination:** Default 20 items per request, max 100
- **Lazy Loading:** Load event participants on demand

### 10.3 Scalability Considerations

**Phase 1 (MVP - <10k users):**
- Single Bun server
- SQLite database
- File storage (local or S3)

**Phase 2 (10k-100k users):**
- Load balancer (nginx)
- Multiple Bun instances
- PostgreSQL database
- Redis caching
- CDN for static assets

**Phase 3 (100k+ users):**
- Microservices architecture
- Message queue (RabbitMQ/Kafka)
- Elasticsearch for search
- Distributed caching
- Database replication/sharding

### 10.4 Monitoring & Logging

- **Logging:** Winston or Pino for structured logs
- **Monitoring:** Prometheus metrics + Grafana dashboard
- **Error Tracking:** Sentry or similar
- **Performance APM:** Optional (DataDog, New Relic)

---

## Error Handling

### 11.1 HTTP Status Codes

```
200 OK - Request successful
201 Created - Resource created
204 No Content - Successful but no content
400 Bad Request - Invalid input
401 Unauthorized - Missing/invalid authentication
403 Forbidden - Authenticated but unauthorized for action
404 Not Found - Resource not found
409 Conflict - Already exists / constraint violation
422 Unprocessable Entity - Validation errors
429 Too Many Requests - Rate limited
500 Internal Server Error - Server error
503 Service Unavailable - Server maintenance
```

### 11.2 Error Response Format

```json
{
  "error": "Event not found",
  "code": "EVENT_NOT_FOUND",
  "statusCode": 404,
  "timestamp": "2026-03-13T10:30:00Z"
}
```

### 11.3 Common Error Codes

- `INVALID_CREDENTIALS` - OAuth failed
- `TOKEN_EXPIRED` - JWT token expired
- `UNAUTHORIZED_ACTION` - User not authorized
- `VALIDATION_ERROR` - Input validation failed
- `RESOURCE_NOT_FOUND` - Event/user not found
- `CAPACITY_EXCEEDED` - Event at capacity
- `ALREADY_JOINED` - User already participating
- `EVENT_CANCELLED` - Event was cancelled
- `USER_BANNED` - User account suspended

---

## Testing Strategy

### 12.1 Frontend Testing

- **Unit Tests:** Component logic, hooks, utilities (React Testing Library)
- **Integration Tests:** User flows (login → create event → join)
- **E2E Tests:** Full user journeys (optional, use Playwright)
- **Coverage Target:** 70%+ line coverage

### 12.2 Backend Testing

- **Unit Tests:** Service functions, validators
- **Integration Tests:** API endpoints with database
- **Test Database:** Separate SQLite DB for tests (auto-cleanup)
- **Coverage Target:** 80%+ line coverage
- **Load Testing:** Simulate 100+ concurrent users (optional)

### 12.3 Test Examples

```typescript
// Backend test example
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { eventService } from '../services/eventService';

describe('Event Service', () => {
  beforeEach(() => {
    // Setup test database
  });

  afterEach(() => {
    // Cleanup
  });

  test('should create event', async () => {
    const event = await eventService.createEvent(userId, {
      name: 'Test Event',
      sport: 'football',
      // ...
    });

    expect(event.id).toBeDefined();
    expect(event.name).toBe('Test Event');
  });

  test('should not exceed capacity', async () => {
    // Setup event with 2 capacity
    // Try to add 3 users
    // Should fail on 3rd join
  });
});
```

---

## Deployment

### 13.1 Development Environment

- Local development with Bun hot reload
- SQLite database locally
- Environment variables in `.env` file
- Frontend dev server: `bun run dev` (frontend/)
- Backend dev server: `bun --hot src/index.ts` (backend/)

### 13.2 Production Deployment

**Option 1: Single Server (AWS EC2)**
- Ubuntu 20.04 LTS
- Bun runtime installed
- SQLite database
- Nginx reverse proxy
- SSL/TLS with Let's Encrypt
- GitHub Actions for CI/CD

**Option 2: Container Deployment (Docker)**
```dockerfile
# Dockerfile for backend
FROM oven/bun:latest

WORKDIR /app
COPY . .
RUN bun install

EXPOSE 3000
CMD ["bun", "src/index.ts"]
```

**Option 3: Serverless (Cloudflare Workers, Vercel)**
- Frontend: Vercel
- API: Cloudflare Workers + Durable Objects (for persistence)
- Database: SQLite in Durable Objects or external DB

### 13.3 CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
      - run: bun run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        # SSH into server, pull latest, restart services
```

### 13.4 Database Backups

- Daily automated backups to cloud storage (S3)
- Point-in-time recovery capability
- Test restore procedures monthly

---

## Future Enhancements

### 14.1 Phase 2 Features

1. **User Ratings & Reviews**
   - Rate events (1-5 stars)
   - Rate other participants
   - Review comments and badges

2. **Advanced Search**
   - Full-text search with Elasticsearch
   - Geospatial search (distance-based)
   - Filter by event type/category

3. **Social Features**
   - Follow other users
   - User bio with social links
   - Friendlist and direct messaging

4. **Recurring Events**
   - Properly implement recurring patterns
   - Calendar view with recurring instances
   - Edit all/single event in series

5. **Payment Integration**
   - Stripe or PayPal integration
   - Event fees (organizer sets price)
   - Premium features/tier system

### 14.2 Phase 3 Features

1. **Mobile App**
   - React Native version
   - Push notifications
   - Location services/GPS

2. **Advanced Moderation**
   - AI-powered content moderation
   - Automated spam detection
   - User appeals system

3. **Analytics**
   - Organizer dashboard (event stats)
   - Platform analytics
   - User behavior insights

4. **Integrations**
   - Calendar sync (Google Calendar, Outlook)
   - Email digest subscriptions
   - Social media sharing

5. **Accessibility**
   - WCAG 2.1 AA compliance
   - Screen reader support
   - Multiple language support

### 14.3 Possible Monetization (Post-MVP)

- Premium user subscriptions (advanced filters, analytics)
- Sponsored events/featured listings
- Transaction fee on event payments
- API access for third parties
- White-label solution for organizations

---

## Appendix: Key Decisions & Rationale

### A.1 Technology Choices

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Backend Framework | Elysia | Lightweight, fast, Bun-native |
| Database | SQLite | Good for MVP, free, portable |
| Auth | OAuth 2.0 | No password management, trusted providers |
| Frontend Framework | React + TypeScript | Industry standard, large ecosystem |
| Styling | Tailwind CSS | Utility-first, rapid development |
| State Management | Context API | Sufficient for MVP, can upgrade later |

### A.2 Design Principles

1. **User-Centric:** Design around user needs and workflows
2. **Simplicity:** MVP focused, no unnecessary features
3. **Scalability:** Architecture allows growth without major rewrites
4. **Maintainability:** Clear code structure, comprehensive documentation
5. **Security:** Security by default, no shortcuts

### A.3 Assumptions

- User base starts small (<1000 users)
- Events are primarily local/regional initially
- No payment processing initially (free platform)
- Users have access to modern web browsers
- Sufficient for 99% of use cases initially

---

**Document Version:** 1.0  
**Last Updated:** March 13, 2026  
**Next Review:** Once MVP reaches 1000 users

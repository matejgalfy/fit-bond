# FitBond Requirements Document

## 1. Purpose of the Application

FitBond is a social sports application that helps people find others to exercise with, create sport events, and build a local activity community. The app should reduce the friction of organizing sports meetups by making it easy to discover activities, join them, communicate with other participants, and keep the environment safe through moderation.

## 2. Product Goals

The application should satisfy these user goals:

- Help users discover sport activities that fit their interests, time, and location.
- Allow users to organize their own events without needing external tools.
- Encourage interaction between participants through comments and lightweight engagement.
- Support trust and safety through reporting and moderation.

## 3. Target Users

### 3.1 Regular User

A regular user is a person who wants to:

- create an account and sign in,
- search for sport activities,
- organize a public or private event,
- join events created by others,
- leave events they previously joined,
- communicate through comments,
- express interest in events,
- report problematic content.

### 3.2 Administrator

An administrator is responsible for platform safety and quality. The administrator should be able to:

- ban users when needed,
- review and resolve reports,
- edit or delete problematic posts, comments or user profile,
- discover and search for events,
- search for users, 
- keep the platform usable and respectful.

## 4. Scope of the First Complete Version

The first complete version of FitBond should include:

- account registration and sign-in,
- event creation, editing, and deletion,
- event discovery and filtering,
- event joining and leaving,
- comments on events,
- interest marking on events,
- reporting posts or users,
- administrative moderation,
- user notifications about important activity.

## 5. Core User Journey

The expected basic flow of the app is:

1. A new user creates an account or signs in.
2. The user sets basic profile information, preferred sports and preferred location.
3. The user browses or searches available sport events.
4. The user opens event detail, checks the description, time, location, skill level, and current participation.
5. The user either joins the event, marks interest, or continues searching.
6. If the user wants to organize an activity, they create a new event and publish it.
7. Participants interact on the event page through comments.
8. If problematic content appears, a user reports it and an administrator reviews it.

## 6. Functional Requirements

### 6.1 Registration and Authentication

- The application must allow users to register and sign in.
- A new user must be able to create an account using a supported sign-up flow.
- An existing user must be able to sign in securely.
- The app must prevent banned users from accessing normal user functions during an active ban.
- The app should support a smooth return experience so that frequent users can access the platform quickly.

### 6.2 User Profile

- The application should maintain a basic user profile that helps others understand who is organizing or joining activities.
- A user profile must include a first name and last name, and optional personal details such as profile picture or bio.
- A user should be able to set preferred sports.
- A user should be able to define a preferred location and an activity radius.
- A user should be identifiable as the organizer of events they create.

### 6.3 Event Creation

- Users must be able to create their own sport events.
- A user must be able to create an event with a title, description, sport type, location, date and start time, expected duration, and participant capacity.
- A user should be able to specify the expected skill level.
- A user should be able to indicate whether the event is public or private.
- A user may add a cover image or visual element for the event.
- The event creator becomes the organizer of the event automatically.

### 6.4 Event Editing and Deletion

- Users must be able to manage events they created.
- An organizer must be able to edit their own event.
- An organizer must be able to delete or cancel their own event.
- Users must not be able to edit or delete events created by others.
- If an event is cancelled, participants should be informed.

### 6.5 Event Discovery and Search

- Searching and browsing events is one of the main product features.
- A user must be able to browse available events.
- A user must be able to search or filter events by sport, time, and location.
- The app should support quick scanning of results through a concise event overview.
- The app should prioritize showing relevant and upcoming activities over outdated ones.

### 6.6 Event Detail View

- Each event needs a dedicated detail page or screen.
- The event detail must display the full description, organizer, location, start time, duration, participant count, and skill level.
- The event detail must show whether the user has already joined or marked interest.
- The event detail must provide access to comments and reporting options.
- The event detail should clearly show whether the event is full, cancelled, or no longer available.

### 6.7 Joining Events

- Users must be able to join events created by others.
- A signed-in user must be able to join an event if it is available and not full.
- The app must prevent duplicate joining by the same user.
- The app must reflect participant limits if capacity is reached.
- A user should be able to see that they are included among participants.

### 6.8 Leaving Events

- Users must be able to leave events they previously joined.
- A signed-in user must be able to leave an event they have already joined.
- Leaving an event must remove the user from the participant list.
- The participant count must update consistently after a user leaves.
- A user must not be able to leave an event they never joined.

### 6.9 Interest Marking

- The application should support lightweight engagement even when a user is not ready to commit.
- A user should be able to mark interest in an event.
- The app should keep this action separate from full participation.
- The user should be able to remove the mark of interest later.

### 6.10 Comments and Discussion

- Users must be able to communicate on event pages.
- Only users who joined an event must be able to add a comment to that event.
- The app should support replies to comments so conversation can remain structured.
- Comment content must remain associated with the author and timestamp.

### 6.11 Notifications

- Users should be informed about important actions related to events.
- A user should receive notifications for relevant activity such as event updates, cancellations, new comments
- A user should be able to distinguish unread and read notifications.
- Notifications should direct the user to the relevant event or action.

### 6.12 Reporting Content

- The platform must allow users to report problematic content or behavior.
- A user must be able to report an event post, or another user
- A report must include a reason.
- A user should not need to confront the offending party directly.

### 6.13 Moderation and Administration

- Administrators need dedicated moderation capabilities.
- An administrator must be able to review reported content.
- An administrator must be able to edit or delete problematic posts or comments.
- An administrator must be able to permanently ban users according to platform policy.

## 7. Business Rules and Operating Rules

The application should follow these core rules:

- Only authenticated users can create events, join events, leave events, mark interest, or submit reports.
- Only the organizer can manage their own event unless an administrator intervenes.
- An event cannot accept more participants than its capacity.
- A banned user cannot create events, join events, or interact socially while banned.
- Report handling must always involve administrator review.
- Public events are visible in search, while private events are visible only according to their access rules.
- Cancelled events should remain understandable to affected users rather than disappearing without notice.
- Only users who joined an event can participate in its comment discussion.

## 8. High-Level Technical Requirements

- The application must work reliably on modern desktop and mobile browsers.
- The interface must support responsive behavior so users can discover and join activities from a phone.
- User authentication and account handling must protect user identity and session security.
- Event data, comments, reports, and notification states must be stored consistently so users see accurate information.
- The system should support role-based access so administrative features are available only to administrators.
- The app should provide acceptable performance for common tasks such as sign-in, search, event detail loading, and joining an event.
- The application should be designed so additional social features can be added later without rewriting the whole product concept.
- Enable user to change between light and dark mode

## 9. Out of Scope for Now

The following items will be implemented if project team decides to expand the scope:

- direct private messaging between users,
- payment processing,
- team or club management,
- advanced recommendation engine,
- calendar synchronization with external services,
- gamification features such as badges or leaderboards.

## 10. Functional Requirements Summary

The core functional requirements for the complete version of FitBond are:

- an unregistered user can only create a new account.
- a user can create, join or leave an event.
- another user can discover that event, join it, and leave it if plans change.
- participants can communicate on the event page.
- inappropriate content can be reported and handled by an administrator.
- the app remains clear and usable on both desktop and mobile devices.
- event visibility supports public and private modes.
- comments are limited to users who joined the event.
- the app includes interest marking as a lightweight engagement option.
- bans are permanent
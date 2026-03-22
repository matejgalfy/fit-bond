## Plan: FitBond Backend MVP to Full Core

Deliver a strict MVP-first backend in 3-4 weeks, then complete remaining core features behind stable auth/authorization foundations. The recommended path is hybrid auth (email/password JWT now, OAuth-ready structure), domain-first API modules, and strong endpoint-level tests so each phase is independently shippable.

**Steps**
1. Phase 1: Backend foundation hardening (week 1)
2. Define API module structure and route groups in [apps/backend/src/index.ts](apps/backend/src/index.ts) so features can be mounted by domain (auth, profile, events, participation, comments, reports, admin, notifications).
3. Add shared request/response validation conventions with Elysia validators and centralized error mapping (400/401/403/404/409/422/500) to keep contracts consistent across all routes.
4. Implement auth core with hybrid-ready design: email/password register + sign-in + JWT verification, and OAuth placeholder endpoints/interfaces without full provider integration yet. Store hashed passwords and reject banned users during sign-in. *blocks phases 2-5*
5. Add authorization middleware: `requireAuth`, `requireAdmin`, `requireOrganizer(eventId)`, and `requireParticipant(eventId)` with reusable guards. *depends on step 4; blocks phases 2-5*
6. Add baseline integration test harness for HTTP endpoint testing and seeded DB assumptions in [apps/backend/src/index.test.ts](apps/backend/src/index.test.ts). *parallel with steps 2-4 after route shape is set*
7. Phase 2: User and event core (week 2)
8. Implement profile endpoints: get/update own profile, preferred sports CRUD, primary location + radius management using existing `userPreferredSports` and `userLocations` tables. *depends on steps 4-5*
9. Implement event CRUD endpoints with organizer ownership checks: create, read detail, update, cancel/delete behavior, and status exposure (`cancelledAt`, reason). *depends on step 5*
10. Implement discovery/search endpoint with filters (sport, time window, location where available), default sort by upcoming events, and public/private visibility rules.
11. Add transactional updates for participant-sensitive fields (especially `currentParticipants`) to prevent race conditions under concurrent joins/leaves. *depends on step 9*
12. Extend integration tests for auth/profile/events/discovery happy-path and rejection-path cases.
13. Phase 3: Participation and discussion (week 3)
14. Implement join/leave endpoints with rules: no duplicate joins, capacity enforcement, cannot leave if not joined, and accurate participant count updates. *depends on steps 9 and 11*
15. Implement interest mark/unmark endpoints using `eventInterested`, explicitly independent from participation status.
16. Implement comments: list comments for event, add comment (joined users only), reply support via `parentCommentId`, and delete/soft-delete behavior for owners/admins.
17. Emit database notifications for key actions (event update/cancel, participant joined, comment, interest) and implement user notification list + mark-read endpoints (database-only delivery in this milestone). *depends on steps 9 and 14-16*
18. Extend tests for participation, interest, comments, and notifications including edge cases (full event, duplicate join, unauthorized comment).
19. Phase 4: Safety and moderation completion (week 4)
20. Implement reporting endpoints: create report (user/event/comment target), list own reports where needed, and admin report queue.
21. Implement moderation/admin endpoints: resolve/reject reports with resolution note, permanent ban/unban actions according to your chosen policy, and admin content moderation for problematic comments/events.
22. Enforce ban checks consistently across social actions (event creation, join/leave, comments, interest, reporting).
23. Add audit-friendly metadata where appropriate (resolver, timestamps, reason fields already in schema) and ensure responses do not leak sensitive moderation internals.
24. Complete end-to-end backend test suite by domain and add regression tests for role-based access and banned-user behavior.
25. Phase 5: Stabilization and handoff (end of week 4)
26. Publish API contract summary for frontend integration (route list, request/response payload shapes, auth requirements, role requirements).
27. Run full verification with seeded data and realistic manual scenarios (organizer lifecycle, participant lifecycle, moderation lifecycle).
28. Prepare implementation backlog for post-MVP enhancements (full OAuth provider integration, realtime notification push, advanced search ranking).

**Relevant files**
- /Users/samo/Documents/MUNI/pb138/pb138-project/apps/backend/src/index.ts — split route mounting and plugin wiring; keep exported `Backend` type stable.
- /Users/samo/Documents/MUNI/pb138/pb138-project/apps/backend/src/db/schema.ts — source of truth for entities/relations used by endpoint logic; verify no schema drift while implementing.
- /Users/samo/Documents/MUNI/pb138/pb138-project/apps/backend/src/db/index.ts — database access entry point used by all domain modules.
- /Users/samo/Documents/MUNI/pb138/pb138-project/apps/backend/src/index.test.ts — convert placeholder tests into integration coverage for core domains.
- /Users/samo/Documents/MUNI/pb138/pb138-project/docs/Requirements.md — acceptance baseline for feature completeness and business rules.

**Verification**
1. Run backend test suite after each phase with Bun test commands and keep failures blocking progression to next phase.
2. For each protected endpoint, verify all authorization states: unauthenticated, authenticated user, organizer (where relevant), admin, banned user.
3. For join/leave and interest endpoints, run concurrency and idempotency checks to confirm `currentParticipants` consistency.
4. Validate event discovery filters and visibility rules against seeded public/private and cancelled events.
5. Validate report-to-resolution lifecycle end-to-end with seeded users and admin accounts.
6. Confirm notification API behavior (create, list, mark read) for all triggering actions in phase 3.

**Decisions**
- Scope: strict MVP-first progression with full core backend completion by end of phase 4.
- Auth: hybrid direction; implement email/password JWT now and keep OAuth extension points for later.
- Notifications: database-only delivery in this milestone (no websocket/SSE).
- Timeline target: 3-4 weeks.
- Included now: auth, profile, event CRUD/discovery/detail, join/leave, interest, comments/replies, reporting, admin moderation, bans, role enforcement, test coverage.
- Excluded now: full external OAuth provider integration and realtime push delivery.

**Further Considerations**
1. Ban policy detail: permanent-only ban behavior vs optional temporary bans already modeled in schema; recommendation is enforce permanent bans now and treat `bannedUntil` as reserved for future policy changes.
2. Route organization: keep all routes in one file initially vs split by domain modules early; recommendation is split by domain in phase 1 to reduce merge conflicts and speed future changes.
3. API versioning: start with unversioned internal API vs `/api/v1`; recommendation is `/api/v1` now to avoid future frontend-breaking migrations.

# Backend Architecture — Notes & Future Improvements

A snapshot review of the backend architecture (event bus, module layering, error
handling). Overall the design is solid: consistent `routes → service → model`
layering, explicit dependency injection via a composition root, a typed event
bus, and clean error handling. The items below are the rough edges worth
revisiting.

## Priority

### 1. Email sends block the HTTP request (highest impact)

`await bus.emit(...)` waits for **every** subscriber to finish before the
response returns. `email.subscribers.ts` awaits SMTP sends to all participants,
so a slow mail server directly slows the user's request.

- **Fix:** move emails off the request path — a background queue, or at minimum
  fire-and-forget (`void` the promise with caught errors).
- **Files:** `src/lib/eventBus.ts`, `src/modules/email/email.subscribers.ts`

## Medium

### 2. Subscriber side-effects are not transactional

Events are emitted _after_ the DB transaction commits (correct — we don't notify
about rolled-back work). But if a notification insert fails it's swallowed and
logged while the domain action already succeeded. This is an acceptable
best-effort model — just make it an explicit, documented decision.

- **Files:** `src/modules/events/events.service.ts`, `src/lib/eventBus.ts`

### 3. `reportsService` dependency creep

`reportsService` already depends on `eventsService`, `commentsService`, and
`usersService`. Watch this growing into a god-service as report types expand;
consider splitting per report target if it keeps accumulating deps.

- **File:** `src/index.ts` (composition root), `src/modules/reports/`

## Low / polish

### 4. `'event.commented'` handler is inlined

Other organizer-notification handlers use the shared `notifyOrganizer` helper,
but `event.commented` is inlined despite being nearly identical. Fold it into
the helper for consistency.

- **File:** `src/modules/notifications/notifications.subscribers.ts`

### 5. `Actor.role` is stringly-typed

`role?: string` with `role === 'admin'` checks. A union (`'admin' | 'user'`)
would be safer, though it mirrors better-auth's loose type so it's partly forced.

- **File:** `src/utils/actor.ts`

### 6. `firstOrThrow` throws a bare `Error` → 500

Correct for "should never happen" invariants (caught as INTERNAL_ERROR), but
ensure no user-reachable, expected-empty path relies on it.

- **File:** `src/utils/query.ts`

## Known limitations (already documented in code)

- **Haversine distance filter forces a full table scan** — no spatial index can
  be used. Acceptable while the events table is small; switch to PostGIS or a
  bounding-box pre-filter if it grows. (Noted in `src/modules/events/events.query.ts`.)

## Things that are good (keep doing)

- Composition root in `index.ts` — explicit DI, whole dependency graph readable
  in ~50 lines, no hidden singletons.
- Factory-DI services (`createXxxService(deps)`) with overridable `model` —
  fully testable without a DB.
- Subscribers declaring exact service slices via `Pick<...>` — minimal, honest
  interfaces.
- Typed `DomainEvents` map — compile-time safety on `emit`/`on`.
- Per-handler error isolation in the bus — one failing subscriber can't break
  the request or other subscribers.
- `ServiceError` + single `handleServiceError` hook with code→status mapping.
- Shared query helpers (`events.query.ts`, `utils/query.ts`) with comments that
  explain _why_.

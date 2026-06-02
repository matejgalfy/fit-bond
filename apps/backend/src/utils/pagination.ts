import { t } from 'elysia';

export const DEFAULT_PAGE_SIZE = 20;
export const COMMENTS_PAGE_SIZE = 50;
export const MIN_PAGE_SIZE = 1;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_OFFSET = 0;

/** Reusable `limit` query field for paginated endpoints. */
export const limitQuerySchema = t.Optional(
    t.Integer({ minimum: MIN_PAGE_SIZE, maximum: MAX_PAGE_SIZE })
);

/** Reusable `offset` query field for paginated endpoints. */
export const offsetQuerySchema = t.Optional(
    t.Integer({ minimum: DEFAULT_OFFSET })
);

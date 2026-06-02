/**
 * Returns the first row of a query result, or null when empty.
 *
 * Centralizes the `results.length === 0 ? null : results[0]` pattern repeated
 * across every model. We avoid `results.at(0)` because ESLint cannot resolve
 * Drizzle's row types through `.at()` (see CLAUDE.md).
 */
export function firstOrNull<T>(results: T[]): T | null {
    return results.length === 0 ? null : results[0];
}

/**
 * Returns the first row of a query result, or throws with `message` when empty.
 * Used after inserts/upserts that must produce exactly one row.
 */
export function firstOrThrow<T>(results: T[], message: string): T {
    if (results.length === 0) {
        throw new Error(message);
    }
    return results[0];
}

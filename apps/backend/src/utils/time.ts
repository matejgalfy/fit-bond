export function hasDateTimePassed(
    dateTime: Date | string,
    now: Date = new Date()
): boolean {
    return new Date(dateTime) <= now;
}

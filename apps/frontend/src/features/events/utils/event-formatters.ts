export function formatEventDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatEventTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatEventDuration(durationMinutes: number): string {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) return `${String(durationMinutes)} min`;
    if (minutes === 0) return `${String(hours)}h`;
    return `${String(hours)}h ${String(minutes)}m`;
}

export function formatSkillLevel(skillLevel: string): string {
    return skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
}

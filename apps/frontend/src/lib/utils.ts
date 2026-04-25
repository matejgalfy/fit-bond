import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            'font-size': [
                'text-heading',
                'text-subheading',
                'text-regular',
                'text-small',
                'text-tiny',
            ],
            'font-family': ['font-heading', 'font-sans', 'font-subheading'],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function timeAgo(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${String(diffMinutes)}m ago`;
    if (diffHours < 24) return `${String(diffHours)}h ago`;
    if (diffDays < 7) return `${String(diffDays)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

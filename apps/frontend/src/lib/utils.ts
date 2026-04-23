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

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-regular font-medium transition-colors duration-50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-colors [&_svg]:duration-50 outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'bg-primary-blue text-surface hover:bg-primary-blue/90 cursor-pointer',
                destructive:
                    'bg-primary-red text-surface hover:bg-primary-red/90 cursor-pointer',
                outline:
                    'border border-outline bg-surface hover:bg-soft-blue hover:text-strong-blue cursor-pointer',
                secondary:
                    'bg-muted-background text-primary-text hover:bg-muted-background/80 cursor-pointer',
                ghost: 'hover:bg-soft-blue hover:text-strong-blue cursor-pointer',
                link: 'text-primary-blue underline-offset-4 hover:underline cursor-pointer',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-tiny',
                lg: 'h-10 rounded-md px-6',
                icon: 'h-9 w-9',
                'icon-sm': 'h-8 w-8',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };

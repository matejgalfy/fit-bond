import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { cn } from '@/lib/utils';

type Visibility = 'public' | 'private';

interface VisibilityFieldProps {
    visibility: Visibility;
    // eslint-disable-next-line no-unused-vars
    onVisibilityChange: (visibility: Visibility) => void;
}

const VISIBILITY_OPTIONS = [
    { label: 'Public', value: 'public', icon: Eye },
    { label: 'Private', value: 'private', icon: EyeOff },
] satisfies {
    label: string;
    value: Visibility;
    icon: LucideIcon;
}[];

export function VisibilityField({
    visibility,
    onVisibilityChange,
}: VisibilityFieldProps) {
    return (
        <FormField label="Visibility">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VISIBILITY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isActive = visibility === option.value;

                    return (
                        <Button
                            key={option.value}
                            type="button"
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                onVisibilityChange(option.value);
                            }}
                            className={cn(
                                'h-9 rounded-xl text-tiny',
                                !isActive &&
                                    'bg-transparent text-secondary-text hover:bg-muted-background hover:text-primary-text'
                            )}
                        >
                            <Icon size={14} />
                            {option.label}
                        </Button>
                    );
                })}
            </div>
        </FormField>
    );
}

export type { Visibility };

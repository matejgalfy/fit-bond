import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { SkillLevel } from '../../../../../../../backend/src/modules/events/events.types';
import type { EventFormValues } from '../../../validation/event-form-schema';

const SKILL_LEVELS: { label: string; value: SkillLevel }[] = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
];

export function SkillLevelField() {
    const form = useFormContext<EventFormValues>();

    return (
        <FormField
            control={form.control}
            name="skillLevel"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Skill level</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {SKILL_LEVELS.map((level) => (
                            <Button
                                key={level.value}
                                type="button"
                                variant={
                                    field.value === level.value
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => {
                                    field.onChange(level.value);
                                }}
                                className={cn(
                                    'h-9 rounded-xl text-tiny',
                                    field.value !== level.value &&
                                        'bg-transparent text-secondary-text hover:bg-muted-background hover:text-primary-text'
                                )}
                            >
                                {level.label}
                            </Button>
                        ))}
                    </div>
                </FormItem>
            )}
        />
    );
}

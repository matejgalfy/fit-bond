import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { cn } from '@/lib/utils';
import type { SkillLevel } from '../../../../../../../backend/src/modules/events/events.types';

interface SkillLevelFieldProps {
    skillLevel: SkillLevel;
    onSkillLevelChange: (skillLevel: SkillLevel) => void;
}

const SKILL_LEVELS: { label: string; value: SkillLevel }[] = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
];

export function SkillLevelField({
    skillLevel,
    onSkillLevelChange,
}: SkillLevelFieldProps) {
    return (
        <FormField label="Skill level">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SKILL_LEVELS.map((level) => (
                    <Button
                        key={level.value}
                        type="button"
                        variant={
                            skillLevel === level.value ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => {
                            onSkillLevelChange(level.value);
                        }}
                        className={cn(
                            'h-9 rounded-xl text-tiny',
                            skillLevel !== level.value &&
                                'bg-transparent text-secondary-text hover:bg-muted-background hover:text-primary-text'
                        )}
                    >
                        {level.label}
                    </Button>
                ))}
            </div>
        </FormField>
    );
}

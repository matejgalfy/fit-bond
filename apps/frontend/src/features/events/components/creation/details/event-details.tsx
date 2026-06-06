import { Card } from '@/components/ui/card';
import type { SkillLevel } from '../../../../../../../backend/src/modules/events/events.types';
import { CapacityField } from './capacity';
import { SkillLevelField } from './skill-level';

interface CreatingEventDetailsProps {
    capacity: string;
    skillLevel: SkillLevel;
    onCapacityChange: (capacity: string) => void;
    onSkillLevelChange: (skillLevel: SkillLevel) => void;
}

export function CreatingEventDetails({
    capacity,
    skillLevel,
    onCapacityChange,
    onSkillLevelChange,
}: CreatingEventDetailsProps) {
    return (
        <Card className="p-5 border-outline bg-surface shadow-sm rounded-xl gap-0">
            <h2 className="font-heading text-regular font-bold mb-4">
                Details
            </h2>

            <SkillLevelField
                skillLevel={skillLevel}
                onSkillLevelChange={onSkillLevelChange}
            />

            <div className="mt-4">
                <CapacityField
                    capacity={capacity}
                    onCapacityChange={onCapacityChange}
                />
            </div>
        </Card>
    );
}

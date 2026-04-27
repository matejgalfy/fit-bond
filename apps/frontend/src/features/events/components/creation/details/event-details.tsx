import { Card } from '@/components/ui/card';
import type { SkillLevel } from '../../../../../../../backend/src/modules/events/events.types';
import { CapacityField } from './capacity';
import { SkillLevelField } from './skill-level';
import { VisibilityField, type Visibility } from './visibility';

interface CreatingEventDetailsProps {
    capacity: string;
    skillLevel: SkillLevel;
    visibility: Visibility;
    // eslint-disable-next-line no-unused-vars
    onCapacityChange: (capacity: string) => void;
    // eslint-disable-next-line no-unused-vars
    onSkillLevelChange: (skillLevel: SkillLevel) => void;
    // eslint-disable-next-line no-unused-vars
    onVisibilityChange: (visibility: Visibility) => void;
}

export function CreatingEventDetails({
    capacity,
    skillLevel,
    visibility,
    onCapacityChange,
    onSkillLevelChange,
    onVisibilityChange,
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

            <div className="mt-4">
                <VisibilityField
                    visibility={visibility}
                    onVisibilityChange={onVisibilityChange}
                />
            </div>
        </Card>
    );
}

export type { Visibility };

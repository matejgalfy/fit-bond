import { Card } from '@/components/ui/card';
import { CapacityField } from './capacity';
import { SkillLevelField } from './skill-level';

export function CreatingEventDetails() {
    return (
        <Card className="p-5 border-outline bg-surface shadow-sm rounded-xl gap-0">
            <h2 className="font-heading text-regular font-bold mb-4">
                Details
            </h2>

            <SkillLevelField />

            <div className="mt-4">
                <CapacityField />
            </div>
        </Card>
    );
}

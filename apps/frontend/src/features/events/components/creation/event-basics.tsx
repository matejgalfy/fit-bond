import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';

interface CreatingEventBasicsProps {
    eventName: string;
    sportType: string;
    description: string;
    // eslint-disable-next-line no-unused-vars
    onEventNameChange: (eventName: string) => void;
    // eslint-disable-next-line no-unused-vars
    onSportTypeChange: (sportType: string) => void;
    // eslint-disable-next-line no-unused-vars
    onDescriptionChange: (description: string) => void;
}

export function CreatingEventBasics({
    eventName,
    sportType,
    description,
    onEventNameChange,
    onSportTypeChange,
    onDescriptionChange,
}: CreatingEventBasicsProps) {
    return (
        <Card className="p-5 border-outline bg-surface shadow-sm rounded-xl gap-0">
            <h2 className="font-heading text-regular font-bold mb-4">Basics</h2>

            <div className="space-y-4">
                <FormField label="Event name" htmlFor="event-name" required>
                    <Input
                        id="event-name"
                        type="text"
                        placeholder="e.g. Morning Run in the Park"
                        value={eventName}
                        onChange={(e) => {
                            onEventNameChange(e.target.value);
                        }}
                        className="h-10 bg-background"
                    />
                </FormField>

                <FormField label="Sport type" htmlFor="sport-type" required>
                    <Input
                        id="sport-type"
                        type="text"
                        placeholder="e.g. Football"
                        value={sportType}
                        onChange={(e) => {
                            onSportTypeChange(e.target.value);
                        }}
                        className="h-10 bg-background"
                    />
                </FormField>

                <FormField label="Description" htmlFor="event-description">
                    <textarea
                        id="event-description"
                        placeholder="Tell people what this event is about..."
                        value={description}
                        onChange={(e) => {
                            onDescriptionChange(e.target.value);
                        }}
                        className="min-h-24 w-full resize-none rounded-md border border-outline bg-background px-3 py-2 text-regular text-primary-text shadow-sm transition-colors placeholder:text-secondary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
                    />
                </FormField>
            </div>
        </Card>
    );
}

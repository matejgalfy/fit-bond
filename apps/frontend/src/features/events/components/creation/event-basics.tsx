import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { ImageUpload } from '@/components/ui/image-upload';
import { SportCombobox } from '@/features/sports/components/sport-combobox';

interface CreatingEventBasicsProps {
    eventName: string;
    sportId: string;
    description: string;
    coverImageUrl: string;
    onEventNameChange: (eventName: string) => void;
    onSportIdChange: (sportId: string) => void;
    onDescriptionChange: (description: string) => void;
    onCoverImageUrlChange: (url: string) => void;
    onCoverImageError?: (message: string) => void;
}

export function CreatingEventBasics({
    eventName,
    sportId,
    description,
    coverImageUrl,
    onEventNameChange,
    onSportIdChange,
    onDescriptionChange,
    onCoverImageUrlChange,
    onCoverImageError,
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
                    <SportCombobox
                        id="sport-type"
                        value={sportId}
                        onChange={onSportIdChange}
                    />
                </FormField>

                <FormField label="Description" htmlFor="event-description">
                    <Textarea
                        id="event-description"
                        placeholder="Tell people what this event is about..."
                        value={description}
                        onChange={(e) => {
                            onDescriptionChange(e.target.value);
                        }}
                        className="min-h-24 w-full resize-none rounded-md border border-outline bg-background px-3 py-2 text-regular text-primary-text shadow-sm transition-colors placeholder:text-secondary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
                    />
                </FormField>

                <FormField label="Cover image">
                    <ImageUpload
                        currentUrl={coverImageUrl || null}
                        onUpload={onCoverImageUrlChange}
                        onError={onCoverImageError}
                    />
                </FormField>
            </div>
        </Card>
    );
}

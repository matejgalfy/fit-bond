import { MapPin } from 'lucide-react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

interface LocationFieldProps {
    location: string;
    onLocationChange: (location: string) => void;
}

export function LocationField({
    location,
    onLocationChange,
}: LocationFieldProps) {
    return (
        <FormField label="Location" htmlFor="event-location" required>
            <div className="relative">
                <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
                />
                <Input
                    id="event-location"
                    type="text"
                    placeholder="Search for a place..."
                    value={location}
                    onChange={(e) => {
                        onLocationChange(e.target.value);
                    }}
                    className="h-10 pl-9 bg-background"
                />
            </div>
        </FormField>
    );
}

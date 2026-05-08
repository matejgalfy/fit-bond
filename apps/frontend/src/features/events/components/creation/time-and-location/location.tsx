import { FormField } from '@/components/ui/form-field';
import { LocationCombobox } from '@/components/location-combobox';
import type { LocationSuggestion } from '../../../../../../../backend/src/modules/locations/locations.schema';

interface LocationFieldProps {
    location: LocationSuggestion | null;
    onLocationChange: (location: LocationSuggestion | null) => void;
}

export function LocationField({
    location,
    onLocationChange,
}: LocationFieldProps) {
    return (
        <FormField label="Location" htmlFor="event-location" required>
            <LocationCombobox
                id="event-location"
                value={location}
                onChange={onLocationChange}
            />
        </FormField>
    );
}

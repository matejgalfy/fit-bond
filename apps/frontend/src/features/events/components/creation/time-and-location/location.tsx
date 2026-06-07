import { useFormContext } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { LocationCombobox } from '@/components/location-combobox';
import type { EventFormValues } from '../../../validation/event-form-schema';

export function LocationField() {
    const form = useFormContext<EventFormValues>();

    return (
        <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
                <FormItem>
                    <FormLabel htmlFor="event-location">
                        Location<span className="text-primary-red">*</span>
                    </FormLabel>
                    <FormControl>
                        <LocationCombobox
                            id="event-location"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

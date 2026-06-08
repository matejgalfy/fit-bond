import { Users } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { EventFormValues } from '../../../validation/event-form-schema';

export function CapacityField() {
    const form = useFormContext<EventFormValues>();

    return (
        <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
                <FormItem>
                    <FormLabel htmlFor="event-capacity">
                        Capacity<span className="text-primary-red">*</span>
                    </FormLabel>
                    <div className="flex items-center gap-2">
                        <Users
                            size={16}
                            className="text-secondary-text"
                            aria-hidden="true"
                        />
                        <FormControl>
                            <Input
                                id="event-capacity"
                                type="text"
                                inputMode="numeric"
                                className="h-10 w-20 bg-background"
                                {...field}
                            />
                        </FormControl>
                        <span className="text-small text-secondary-text">
                            players max
                        </span>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { ImageUpload } from '@/components/ui/image-upload';
import { SportCombobox } from '@/features/sports/components/sport-combobox';
import type { EventFormValues } from '../../validation/event-form-schema';

export function CreatingEventBasics() {
    const form = useFormContext<EventFormValues>();

    return (
        <Card className="p-5 border-outline bg-surface shadow-sm rounded-xl gap-0">
            <h2 className="font-heading text-regular font-bold mb-4">Basics</h2>

            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="event-name">
                                Event name
                                <span className="text-primary-red">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    id="event-name"
                                    type="text"
                                    placeholder="e.g. Morning Run in the Park"
                                    className="h-10 bg-background"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="sportId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="sport-type">
                                Sport type
                                <span className="text-primary-red">*</span>
                            </FormLabel>
                            <FormControl>
                                <SportCombobox
                                    id="sport-type"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="event-description">
                                Description
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    id="event-description"
                                    placeholder="Tell people what this event is about..."
                                    className="min-h-24 w-full resize-none rounded-md border border-outline bg-background px-3 py-2 text-regular text-primary-text shadow-sm transition-colors placeholder:text-secondary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover image</FormLabel>
                            <ImageUpload
                                currentUrl={field.value || null}
                                onUpload={(url) => {
                                    field.onChange(url);
                                    form.clearErrors('coverImageUrl');
                                }}
                                onError={(message) => {
                                    form.setError('coverImageUrl', { message });
                                }}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </Card>
    );
}

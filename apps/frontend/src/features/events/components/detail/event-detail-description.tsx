import type { Event } from '../../types';

interface EventDetailDescriptionProps {
    event: Event;
}

export function EventDetailDescription({ event }: EventDetailDescriptionProps) {
    const description = event.description?.trim() ?? '';

    if (description.length === 0) {
        return null;
    }

    return (
        <section className="mt-7">
            <h2 className="m-0 font-heading text-subheading font-semibold text-primary-text">
                About this event
            </h2>
            <p className="mt-2 text-regular leading-7 text-secondary-text">
                {description}
            </p>
        </section>
    );
}

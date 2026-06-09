import {
    createFileRoute,
    useCanGoBack,
    useRouter,
} from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { useEvent } from '@/features/events/hooks/events';
import { EventDetailCover } from '@/features/events/components/detail/event-detail-cover';
import { EventDetailHeader } from '@/features/events/components/detail/event-detail-header';
import { EventDetailInfoGrid } from '@/features/events/components/detail/event-detail-info-grid';
import { EventDetailDescription } from '@/features/events/components/detail/event-detail-description';
import { EventDetailActions } from '@/features/events/components/detail/event-detail-actions';
import { EventEngagementSummary } from '@/features/events/components/detail/event-engagement-summary';
import { EventCommentsSection } from '@/features/comments/components/event-comments-section';
import * as z from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

const eventDetailSearchSchema = z.object({
    eventId: z.string().optional(),
    from: z.literal('my-events').optional().catch(undefined),
    // Set when arriving from a comment notification: the comment to focus.
    commentId: z.string().optional().catch(undefined),
});

type EventDetailSearch = z.infer<typeof eventDetailSearchSchema>;

export const Route = createFileRoute('/_pages/event-detail-page')({
    validateSearch: zodValidator(eventDetailSearchSchema),
    component: EventDetailPage,
});

function EventDetailPage() {
    const { eventId, from, commentId }: EventDetailSearch = Route.useSearch();
    const router = useRouter();
    const canGoBack = useCanGoBack();
    const { data: event, isPending, isError } = useEvent(eventId);

    // Go back to wherever the user came from. When there's no in-app history
    // (e.g. the page was opened in a new tab), close that tab instead.
    const goBack = () => {
        if (canGoBack) {
            router.history.back();
        } else {
            window.close();
        }
    };

    if (isPending) {
        return (
            <div className="max-w-175">
                <Skeleton className="h-45 rounded-2xl" />
                <Skeleton className="mt-5 h-8 w-2/3" />
                <Skeleton className="mt-3 h-4 w-1/2" />
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => (
                        <Skeleton key={item} className="h-20 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-175">
                <EmptyState>
                    <div className="flex flex-col items-center gap-4">
                        <div>
                            <h1 className="font-heading text-subheading font-semibold text-primary-text">
                                Failed to load event
                            </h1>
                            <p className="mt-1 text-regular text-secondary-text">
                                The event may no longer exist or could not be
                                loaded right now.
                            </p>
                        </div>
                        <Button variant="outline" onClick={goBack}>
                            Back
                        </Button>
                    </div>
                </EmptyState>
            </div>
        );
    }

    return (
        <div className="max-w-175">
            <EventDetailCover event={event} />
            <EventDetailHeader event={event} />
            <EventDetailInfoGrid event={event} />
            <EventDetailActions event={event} detailSource={from} />
            <EventDetailDescription event={event} />
            <EventEngagementSummary event={event} />
            <EventCommentsSection
                eventId={event.id}
                focusCommentId={commentId}
            />
        </div>
    );
}

import { Check, Heart, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/api';
import { ReportEventDialog } from '@/features/reports/components/report-event-dialog';
import type { Event } from '../../types';
import {
    useEventInterested,
    useEventParticipants,
    useJoinEvent,
    useLeaveEvent,
    useMarkInterest,
    useUnmarkInterest,
} from '../../hooks/participation';

interface EventDetailActionsProps {
    event: Event;
}

export function EventDetailActions({ event }: EventDetailActionsProps) {
    const { data: session } = authClient.useSession();
    const { data: participants } = useEventParticipants(event.id);
    const { data: interested } = useEventInterested(event.id);

    const join = useJoinEvent(event.id);
    const leave = useLeaveEvent(event.id);
    const mark = useMarkInterest(event.id);
    const unmark = useUnmarkInterest(event.id);

    const userId = session?.user.id;
    const isOrganizer = userId != null && userId === event.organizer.id;
    const isJoined = Boolean(
        userId && participants?.some((p) => p.id === userId)
    );
    const isInterested = Boolean(
        userId && interested?.some((u) => u.id === userId)
    );
    const isCancelled = Boolean(event.cancelledAt);
    const hasStarted = new Date(event.startTime) <= new Date();
    const isFull = event.currentParticipants >= event.capacity;

    const anyPending =
        join.isPending || leave.isPending || mark.isPending || unmark.isPending;

    return (
        <div className="mt-5 flex flex-wrap items-center gap-2">
            {!session?.user && (
                <>
                    <Button disabled>
                        <UserPlus />
                        Join Event
                    </Button>
                    <Button variant="outline" disabled>
                        <Heart />
                        Interested
                    </Button>
                </>
            )}

            {session?.user && !isOrganizer && (
                <>
                    {isJoined ? (
                        <Button
                            variant="outline"
                            disabled={anyPending}
                            onClick={() => {
                                leave.mutate();
                            }}
                        >
                            <LogOut />
                            Leave Event
                        </Button>
                    ) : (
                        <Button
                            disabled={
                                anyPending ||
                                isCancelled ||
                                hasStarted ||
                                isFull
                            }
                            onClick={() => {
                                join.mutate();
                            }}
                        >
                            <UserPlus />
                            Join Event
                        </Button>
                    )}

                    {!isJoined &&
                        (isInterested ? (
                            <Button
                                variant="secondary"
                                disabled={anyPending}
                                onClick={() => {
                                    unmark.mutate();
                                }}
                            >
                                <Check />
                                Interested
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                disabled={
                                    anyPending || isCancelled || hasStarted
                                }
                                onClick={() => {
                                    mark.mutate();
                                }}
                            >
                                <Heart />
                                Interested
                            </Button>
                        ))}
                </>
            )}

            {!isOrganizer && <ReportEventDialog eventId={event.id} />}
        </div>
    );
}

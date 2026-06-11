import { useState } from 'react';
import { Ban, Heart, LogOut, Pencil, UserPlus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/api';
import { ReportEventDialog } from '@/features/reports/components/report-event-dialog';
import { useIsAdmin } from '@/features/admin/hooks/current-user';
import type { Event } from '../../types';
import { useCancelEvent } from '../../hooks/events';
import {
    useEventInterested,
    useEventParticipants,
    useJoinEvent,
    useLeaveEvent,
    useMarkInterest,
    useUnmarkInterest,
} from '../../hooks/participation';
import { canManageEvent } from '../../utils/event-permissions';

interface EventDetailActionsProps {
    event: Event;
    detailSource?: 'discover' | 'my-events';
}

export function EventDetailActions({
    event,
    detailSource,
}: EventDetailActionsProps) {
    const navigate = useNavigate();
    const [managementError, setManagementError] = useState('');
    const { data: session } = authClient.useSession();
    const isAdmin = useIsAdmin();
    const { data: participants } = useEventParticipants(event.id);
    const { data: interested } = useEventInterested(event.id);

    const join = useJoinEvent(event.id);
    const leave = useLeaveEvent(event.id);
    const mark = useMarkInterest(event.id);
    const unmark = useUnmarkInterest(event.id);
    const cancelEvent = useCancelEvent(event.id);

    const userId = session?.user.id;
    const isOrganizer = userId != null && userId === event.organizer.id;
    const canManage = canManageEvent({
        userId,
        organizerId: event.organizer.id,
        isAdmin,
    });
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
        join.isPending ||
        leave.isPending ||
        mark.isPending ||
        unmark.isPending ||
        cancelEvent.isPending;

    const handleCancelEvent = async () => {
        setManagementError('');

        try {
            await cancelEvent.mutateAsync({});
            await navigate({
                to: isAdmin && !isOrganizer ? '/admin/discover' : '/my-events',
            });
        } catch (err) {
            setManagementError(
                err instanceof Error
                    ? err.message
                    : 'Failed to cancel event. Please try again.'
            );
        }
    };

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

            {session?.user && canManage && (
                <>
                    <Button
                        variant="outline"
                        disabled={anyPending}
                        className="w-full border-primary-orange text-primary-orange hover:bg-soft-orange hover:text-primary-orange sm:w-auto"
                        onClick={() => {
                            setManagementError('');
                            if (isAdmin) {
                                void navigate({
                                    to: '/admin/edit-event',
                                    search: { eventId: event.id },
                                });
                                return;
                            }
                            void navigate({
                                to: '/edit-event',
                                search: {
                                    eventId: event.id,
                                    ...(detailSource
                                        ? { from: detailSource }
                                        : {}),
                                },
                            });
                        }}
                    >
                        <Pencil />
                        Edit Event
                    </Button>
                    <Button
                        variant="outline"
                        disabled={anyPending || isCancelled}
                        className="w-full border-primary-red text-primary-red hover:bg-soft-red hover:text-primary-red sm:w-auto"
                        onClick={() => {
                            void handleCancelEvent();
                        }}
                    >
                        <Ban />
                        {isCancelled ? 'Event Cancelled' : 'Cancel Event'}
                    </Button>
                    {managementError && (
                        <p className="basis-full text-small text-primary-red">
                            {managementError}
                        </p>
                    )}
                </>
            )}

            {session?.user && !canManage && (
                <>
                    {isJoined ? (
                        <Button
                            variant="outline"
                            disabled={anyPending}
                            className="w-full border-primary-red text-primary-red hover:bg-soft-red hover:text-primary-red sm:w-auto"
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
                                variant="outline"
                                disabled={anyPending}
                                className="border-primary-orange bg-soft-orange text-primary-orange hover:bg-soft-orange hover:text-primary-orange sm:w-auto"
                                onClick={() => {
                                    unmark.mutate();
                                }}
                            >
                                <Heart fill="currentColor" />
                                Interested
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                disabled={
                                    anyPending || isCancelled || hasStarted
                                }
                                className="border-primary-orange text-primary-orange hover:bg-soft-orange hover:text-primary-orange sm:w-auto"
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

            {!canManage && <ReportEventDialog eventId={event.id} />}
        </div>
    );
}

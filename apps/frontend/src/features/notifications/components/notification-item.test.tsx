import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { NotificationItem } from './notification-item';
import type { Notification } from '../types';

function makeNotification(overrides: Partial<Notification> = {}): Notification {
    const base = {
        id: 'n-1',
        type: 'comment' as const,
        title: 'New comment',
        message: 'Bob commented on your event.',
        isRead: false,
        createdAt: new Date('2026-05-09T10:00:00Z').toISOString(),
    };
    return { ...base, ...overrides } as unknown as Notification;
}

describe('NotificationItem', () => {
    test('renders title and message', () => {
        const onRead = vi.fn();
        const onOpen = vi.fn();
        render(
            <NotificationItem
                notification={makeNotification()}
                onRead={onRead}
                onOpen={onOpen}
            />
        );

        expect(
            screen.getByRole('heading', { name: 'New comment' })
        ).toBeInTheDocument();
        expect(
            screen.getByText('Bob commented on your event.')
        ).toBeInTheDocument();
    });

    test('unread variant has the primary-blue accent border', () => {
        const onRead = vi.fn();
        const onOpen = vi.fn();
        render(
            <NotificationItem
                notification={makeNotification({ isRead: false })}
                onRead={onRead}
                onOpen={onOpen}
            />
        );

        const button = screen.getByRole('button');
        expect(button).toHaveClass('border-primary-blue/20');
    });

    test('read variant uses the neutral outline border', () => {
        const onRead = vi.fn();
        const onOpen = vi.fn();
        render(
            <NotificationItem
                notification={makeNotification({ isRead: true })}
                onRead={onRead}
                onOpen={onOpen}
            />
        );

        const button = screen.getByRole('button');
        expect(button).toHaveClass('border-outline');
        expect(button).not.toHaveClass('border-primary-blue/20');
    });

    test('unread title is rendered with bold font', () => {
        const onRead = vi.fn();
        const onOpen = vi.fn();
        render(
            <NotificationItem
                notification={makeNotification({ isRead: false })}
                onRead={onRead}
                onOpen={onOpen}
            />
        );

        expect(
            screen.getByRole('heading', { name: 'New comment' })
        ).toHaveClass('font-bold');
    });

    test('clicking an unread notification calls onRead with its id', () => {
        const onRead = vi.fn();
        const onOpen = vi.fn();
        render(
            <NotificationItem
                notification={makeNotification({ id: 'n-42', isRead: false })}
                onRead={onRead}
                onOpen={onOpen}
            />
        );

        fireEvent.click(screen.getByRole('button'));

        expect(onRead).toHaveBeenCalledTimes(1);
        expect(onRead).toHaveBeenCalledWith('n-42');
    });

    test('clicking an already-read notification does NOT call onRead', () => {
        const onRead = vi.fn();
        const onOpen = vi.fn();
        render(
            <NotificationItem
                notification={makeNotification({ isRead: true })}
                onRead={onRead}
                onOpen={onOpen}
            />
        );

        fireEvent.click(screen.getByRole('button'));

        expect(onRead).not.toHaveBeenCalled();
    });

    test('clicking a notification calls onOpen with the notification', () => {
        const onRead = vi.fn();
        const onOpen = vi.fn();
        const notification = makeNotification({ id: 'n-7', isRead: true });
        render(
            <NotificationItem
                notification={notification}
                onRead={onRead}
                onOpen={onOpen}
            />
        );

        fireEvent.click(screen.getByRole('button'));

        expect(onOpen).toHaveBeenCalledTimes(1);
        expect(onOpen).toHaveBeenCalledWith(notification);
    });
});

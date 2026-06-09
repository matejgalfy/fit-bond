import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Report } from '../types';

vi.mock('@tanstack/react-router', () => ({
    useRouter: () => ({
        buildLocation: ({
            to,
            search,
        }: {
            to: string;
            search: Record<string, string>;
        }) => ({
            href: `${to}?${new URLSearchParams(search).toString()}`,
        }),
    }),
}));

import { ReportDetailPanel } from './report-detail-panel';

function makeReport(overrides: Partial<Report> = {}): Report {
    const base = {
        id: 'report-1',
        reportType: 'event' as const,
        targetId: 'event-1',
        targetEventId: null,
        targetLabel: 'Friday Football',
        reason: 'Spam content',
        status: 'pending' as const,
        resolution: null,
        reporterName: 'Alice',
    };
    return { ...base, ...overrides } as unknown as Report;
}

function renderPanel(
    report: Report,
    props: Partial<Parameters<typeof ReportDetailPanel>[0]> = {}
) {
    const onResolve = vi.fn();
    const onReject = vi.fn();
    render(
        <ReportDetailPanel
            report={report}
            onResolve={onResolve}
            onReject={onReject}
            {...props}
        />
    );
    return { onResolve, onReject };
}

describe('ReportDetailPanel', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test('renders the report fields', () => {
        renderPanel(makeReport());

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Friday Football')).toBeInTheDocument();
        expect(screen.getByText('Spam content')).toBeInTheDocument();
    });

    test('shows a placeholder when no report is selected', () => {
        const onResolve = vi.fn();
        const onReject = vi.fn();
        render(<ReportDetailPanel onResolve={onResolve} onReject={onReject} />);

        expect(
            screen.getByText(/select a report to see its details/i)
        ).toBeInTheDocument();
    });

    test('opens an event report target in a new tab', () => {
        const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
        renderPanel(makeReport({ reportType: 'event', targetId: 'event-99' }));

        fireEvent.click(screen.getByRole('button', { name: /open event/i }));

        expect(openSpy).toHaveBeenCalledWith(
            '/admin/event-detail-page?eventId=event-99',
            '_blank',
            'noopener,noreferrer'
        );
    });

    test('opens a comment report target with both event and comment ids', () => {
        const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
        renderPanel(
            makeReport({
                reportType: 'comment',
                targetId: 'comment-5',
                targetEventId: 'event-7',
            })
        );

        fireEvent.click(screen.getByRole('button', { name: /open comment/i }));

        expect(openSpy).toHaveBeenCalledWith(
            '/admin/event-detail-page?eventId=event-7&commentId=comment-5',
            '_blank',
            'noopener,noreferrer'
        );
    });

    test('hides the open action for a comment whose event no longer exists', () => {
        renderPanel(
            makeReport({
                reportType: 'comment',
                targetId: 'comment-5',
                targetEventId: null,
            })
        );

        expect(
            screen.queryByRole('button', { name: /open comment/i })
        ).not.toBeInTheDocument();
    });

    test('resolve requires a note before confirming and forwards it', () => {
        const { onResolve } = renderPanel(makeReport());

        fireEvent.click(screen.getByRole('button', { name: /^resolve$/i }));

        const confirm = screen.getByRole('button', {
            name: /confirm resolve/i,
        });
        expect(confirm).toBeDisabled();

        fireEvent.change(screen.getByPlaceholderText(/resolution note/i), {
            target: { value: 'Removed for spam.' },
        });
        expect(confirm).toBeEnabled();

        fireEvent.click(confirm);
        expect(onResolve).toHaveBeenCalledWith('report-1', 'Removed for spam.');
    });

    test('reject forwards an optional note (undefined when blank)', () => {
        const { onReject } = renderPanel(makeReport());

        fireEvent.click(screen.getByRole('button', { name: /^reject$/i }));
        fireEvent.click(
            screen.getByRole('button', { name: /confirm reject/i })
        );

        expect(onReject).toHaveBeenCalledWith('report-1', undefined);
    });

    test('a resolved report hides the action buttons and shows its resolution', () => {
        renderPanel(
            makeReport({ status: 'resolved', resolution: 'Handled by admin.' })
        );

        expect(
            screen.queryByRole('button', { name: /^resolve$/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /^reject$/i })
        ).not.toBeInTheDocument();
        expect(screen.getByText('Handled by admin.')).toBeInTheDocument();
    });

    test('renders the action error when present', () => {
        renderPanel(makeReport(), { actionError: 'Something went wrong.' });

        expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });
});

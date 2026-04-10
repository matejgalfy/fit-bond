import { Activity, Clock, Heart, MapPin, Users } from 'lucide-react';
import type { UIEvent } from '../types/event';
import { Avatar } from './Avatar';

interface EventCardProps {
    event: UIEvent;
    dark: boolean;
}

export function EventCard({ event, dark }: EventCardProps) {
    const bg = dark ? '#1E293B' : '#FFFFFF';
    const text = dark ? '#F0F4FA' : '#1E293B';
    const muted = dark ? '#94A3B8' : '#64748B';
    const border = dark ? '#334155' : '#E2E8F0';
    const isCancelled = event.cancelled;

    return (
        <div
            style={{
                background: bg,
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${border}`,
                opacity: isCancelled ? 0.7 : 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
                if (!isCancelled) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                        '0 8px 24px rgba(0,0,0,0.08)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div
                style={{
                    height: 110,
                    background: `linear-gradient(135deg, ${event.color}22, ${event.color}55)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                <span style={{ fontSize: 34, opacity: 0.6 }}>
                    <Activity size={34} color={event.color} strokeWidth={1.5} />
                </span>
                {event.full && (
                    <span
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: '#EF4444',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                        }}
                    >
                        Full
                    </span>
                )}
                {isCancelled && (
                    <span
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: '#EF4444',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                        }}
                    >
                        Cancelled
                    </span>
                )}
                <span
                    style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: dark ? '#0080FF33' : '#0080FF15',
                        color: '#0080FF',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                    }}
                >
                    {event.sport}
                </span>
            </div>
            <div style={{ padding: '12px 16px' }}>
                <h3
                    style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 600,
                        color: text,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        textDecoration: isCancelled ? 'line-through' : 'none',
                    }}
                >
                    {event.name}
                </h3>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 8,
                        fontSize: 12,
                        color: muted,
                    }}
                >
                    <Clock size={13} />
                    <span>
                        {event.date} · {event.time}
                    </span>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 4,
                        fontSize: 12,
                        color: muted,
                    }}
                >
                    <MapPin size={13} />
                    <span>{event.location}</span>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        marginTop: 10,
                    }}
                >
                    <span
                        style={{
                            color: muted,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <Users size={13} /> {event.participants}/
                        {event.capacity} joined
                    </span>
                    <span
                        style={{
                            color: '#F97316',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <Heart size={13} fill="#F97316" /> {event.interested}
                    </span>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: `1px solid ${border}`,
                    }}
                >
                    <Avatar name={event.organizer} size={24} />
                    <span style={{ fontSize: 12, color: muted }}>
                        {event.organizer}
                    </span>
                    <span
                        style={{
                            marginLeft: 'auto',
                            fontSize: 11,
                            fontWeight: 500,
                            color:
                                event.skill === 'Beginner'
                                    ? '#22C55E'
                                    : event.skill === 'Advanced'
                                      ? '#EF4444'
                                      : '#F97316',
                            background:
                                event.skill === 'Beginner'
                                    ? '#22C55E15'
                                    : event.skill === 'Advanced'
                                      ? '#EF444415'
                                      : '#F9731615',
                            padding: '2px 8px',
                            borderRadius: 6,
                        }}
                    >
                        {event.skill}
                    </span>
                </div>
            </div>
        </div>
    );
}

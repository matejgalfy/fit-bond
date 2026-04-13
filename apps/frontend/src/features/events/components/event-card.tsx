import { Activity, Clock, Heart, MapPin, Users } from 'lucide-react';

export interface SportEvent {
    id: number;
    name: string;
    sport: string;
    date: string;
    time: string;
    location: string;
    participants: number;
    capacity: number;
    interested: number;
    organizer: string;
    skill: string;
    color: string;
    full?: boolean;
}

interface AvatarProps {
    name: string;
    size?: number;
}

interface EventCardProps {
    event: SportEvent;
}

export function Avatar({ name, size = 32 }: AvatarProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background:
                    'linear-gradient(135deg, var(--primary), var(--ring))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-foreground)',
                fontSize: size * 0.38,
                fontWeight: 600,
                flexShrink: 0,
            }}
        >
            {initials}
        </div>
    );
}

export function EventCard({ event }: EventCardProps) {
    return (
        <div
            style={{
                background: 'var(--card)',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div
                style={{
                    height: 120,
                    background: `linear-gradient(135deg, color-mix(in srgb, ${event.color} 12%, transparent), color-mix(in srgb, ${event.color} 40%, transparent))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                <span style={{ fontSize: 36, opacity: 0.6 }}>
                    <Activity size={36} color={event.color} strokeWidth={1.5} />
                </span>
                {event.full && (
                    <span
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'var(--destructive)',
                            color: 'var(--primary-foreground)',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                        }}
                    >
                        Full
                    </span>
                )}
                <span
                    style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'var(--secondary)',
                        color: 'var(--primary)',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        backdropFilter: 'blur(4px)',
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
                        color: 'var(--card-foreground)',
                        fontFamily: 'var(--font-heading)',
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
                        color: 'var(--muted-foreground)',
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
                        color: 'var(--muted-foreground)',
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
                            color: 'var(--muted-foreground)',
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
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <Heart size={13} fill="var(--primary)" />{' '}
                        {event.interested}
                    </span>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '1px solid var(--border)',
                    }}
                >
                    <Avatar name={event.organizer} size={24} />
                    <span
                        style={{
                            fontSize: 12,
                            color: 'var(--muted-foreground)',
                        }}
                    >
                        {event.organizer}
                    </span>
                    <span
                        style={{
                            marginLeft: 'auto',
                            fontSize: 11,
                            fontWeight: 500,
                            color:
                                event.skill === 'Beginner'
                                    ? 'var(--primary)'
                                    : event.skill === 'Advanced'
                                      ? 'var(--destructive)'
                                      : 'var(--secondary-foreground)',
                            background:
                                event.skill === 'Beginner'
                                    ? 'var(--secondary)'
                                    : event.skill === 'Advanced'
                                      ? 'var(--secondary)'
                                      : 'var(--accent)',
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

import {
    Bell,
    CalendarDays,
    Compass,
    Home,
    MapPin,
    Moon,
    Search,
    Shield,
    Sun,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Chip } from '../components/Chip';
import { EventCard } from '../components/EventCard';
import type { UIEvent } from '../types/event';

const NAV_ITEMS = [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: Compass, label: 'Discover', id: 'discover' },
    { icon: CalendarDays, label: 'My Events', id: 'events' },
    { icon: Bell, label: 'Notifications', id: 'notifications', badge: 3 },
    { icon: User, label: 'Profile', id: 'profile' },
];

const MOCK_EVENTS: UIEvent[] = [
    {
        id: 1,
        name: 'Morning Run in the Park',
        sport: 'Running',
        date: 'Mar 25, 2026',
        time: '7:00 AM',
        location: 'Lužánky Park, Brno',
        participants: 8,
        capacity: 12,
        interested: 5,
        organizer: 'Martin N.',
        skill: 'Beginner',
        color: '#0080FF',
        emoji: '🏃',
    },
    {
        id: 2,
        name: 'Basketball 3v3 Tournament',
        sport: 'Basketball',
        date: 'Mar 26, 2026',
        time: '5:00 PM',
        location: 'Sportovní hala, Brno',
        participants: 6,
        capacity: 6,
        interested: 12,
        organizer: 'Jana K.',
        skill: 'Advanced',
        color: '#F97316',
        full: true,
        emoji: '🏀',
    },
    {
        id: 3,
        name: 'Evening Cycling Group',
        sport: 'Cycling',
        date: 'Mar 29, 2026',
        time: '5:30 PM',
        location: 'Brno-Komín, Start',
        participants: 9,
        capacity: 20,
        interested: 11,
        organizer: 'Lucia D.',
        skill: 'Beginner',
        color: '#14B8A6',
        cancelled: true,
        emoji: '🚴',
    },
];

const SKILL_OPTIONS = ['Any', 'Beginner', 'Intermediate', 'Advanced'];

export default function EventFeed() {
    const [dark, setDark] = useState(false);
    const [activeNav, setActiveNav] = useState('discover');
    const [sportSearch, setSportSearch] = useState('');
    const [selectedSports, setSelectedSports] = useState(['Running']);
    const [skillFilter, setSkillFilter] = useState('Any');
    const [showSportSuggestions, setShowSportSuggestions] = useState(false);

    const allSports = [
        'Running',
        'Basketball',
        'Yoga',
        'Football',
        'Tennis',
        'Cycling',
        'Swimming',
        'Volleyball',
        'Hiking',
        'Boxing',
    ];
    const filteredSports = allSports.filter(
        (s) =>
            s.toLowerCase().includes(sportSearch.toLowerCase()) &&
            !selectedSports.includes(s)
    );
    const bg = dark ? '#0F172A' : '#F0F4FA';
    const cardBg = dark ? '#1E293B' : '#FFFFFF';
    const text = dark ? '#F0F4FA' : '#1E293B';
    const muted = dark ? '#94A3B8' : '#64748B';
    const border = dark ? '#334155' : '#E2E8F0';

    return (
        <div
            style={{
                fontFamily: "'DM Sans', sans-serif",
                background: bg,
                color: text,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background 0.3s, color 0.3s',
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap"
                rel="stylesheet"
            />

            {/* NAVBAR */}
            <nav
                style={{
                    height: 56,
                    background: cardBg,
                    borderBottom: `1px solid ${border}`,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    gap: 12,
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                }}
            >
                <div
                    style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#0080FF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background:
                                'linear-gradient(135deg, #0080FF, #0060CC)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                        }}
                    >
                        F
                    </div>
                    <span>FitBond</span>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                        onClick={() => {
                            setDark(!dark);
                        }}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: 'none',
                            border: `1px solid ${border}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: dark ? '#F97316' : '#0080FF',
                        }}
                    >
                        {dark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <Avatar name="John Doe" size={32} />
                </div>
            </nav>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* SIDEBAR */}
                <aside
                    style={{
                        width: 220,
                        background: cardBg,
                        borderRight: `1px solid ${border}`,
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        paddingTop: 8,
                    }}
                >
                    <div
                        style={{
                            padding: '0 8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        {NAV_ITEMS.map((item) => {
                            const active = activeNav === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveNav(item.id);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        background: active
                                            ? dark
                                                ? '#0080FF20'
                                                : '#0080FF10'
                                            : 'transparent',
                                        color: active ? '#0080FF' : muted,
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: active ? 600 : 400,
                                        fontFamily: "'DM Sans', sans-serif",
                                        width: '100%',
                                        textAlign: 'left',
                                    }}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span
                                            style={{
                                                marginLeft: 'auto',
                                                background: '#F97316',
                                                color: '#fff',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                width: 20,
                                                height: 20,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ padding: '0 8px', marginTop: 16 }}>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: muted,
                                padding: '0 12px 6px',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                            }}
                        >
                            Admin
                        </div>
                        <button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 10,
                                background: 'transparent',
                                color: muted,
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontFamily: "'DM Sans', sans-serif",
                                width: '100%',
                                textAlign: 'left',
                            }}
                        >
                            <Shield size={18} />
                            <span>Dashboard</span>
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ marginBottom: 20 }}>
                            <h1
                                style={{
                                    fontFamily:
                                        "'Plus Jakarta Sans', sans-serif",
                                    fontSize: 24,
                                    fontWeight: 700,
                                    margin: 0,
                                    color: text,
                                }}
                            >
                                Discover Events
                            </h1>
                            <p
                                style={{
                                    fontSize: 14,
                                    color: muted,
                                    marginTop: 4,
                                }}
                            >
                                Find sport activities that match your interests
                            </p>
                        </div>

                        {/* FILTER BAR */}
                        <div
                            style={{
                                background: cardBg,
                                borderRadius: 14,
                                padding: 16,
                                border: `1px solid ${border}`,
                                marginBottom: 20,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 12,
                                    alignItems: 'flex-start',
                                }}
                            >
                                {/* Sport search */}
                                <div
                                    style={{
                                        flex: '1 1 200px',
                                        position: 'relative',
                                    }}
                                >
                                    <label
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: muted,
                                            marginBottom: 4,
                                            display: 'block',
                                        }}
                                    >
                                        Sport
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Search
                                            size={14}
                                            style={{
                                                position: 'absolute',
                                                left: 10,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: muted,
                                            }}
                                        />
                                        <input
                                            value={sportSearch}
                                            onChange={(e) => {
                                                setSportSearch(e.target.value);
                                                setShowSportSuggestions(true);
                                            }}
                                            onFocus={() => {
                                                setShowSportSuggestions(true);
                                            }}
                                            placeholder="Search sport..."
                                            style={{
                                                width: '100%',
                                                height: 36,
                                                borderRadius: 8,
                                                border: `1px solid ${border}`,
                                                background: dark
                                                    ? '#0F172A'
                                                    : '#F0F4FA',
                                                padding: '0 10px 0 32px',
                                                fontSize: 13,
                                                color: text,
                                                outline: 'none',
                                                fontFamily:
                                                    "'DM Sans', sans-serif",
                                            }}
                                        />
                                        {showSportSuggestions &&
                                            sportSearch.length > 0 &&
                                            filteredSports.length > 0 && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 40,
                                                        left: 0,
                                                        right: 0,
                                                        zIndex: 20,
                                                        background: cardBg,
                                                        border: `1px solid ${border}`,
                                                        borderRadius: 8,
                                                        boxShadow:
                                                            '0 4px 12px rgba(0,0,0,0.1)',
                                                    }}
                                                >
                                                    {filteredSports
                                                        .slice(0, 5)
                                                        .map((sport) => (
                                                            <div
                                                                key={sport}
                                                                onClick={() => {
                                                                    setSelectedSports(
                                                                        [
                                                                            ...selectedSports,
                                                                            sport,
                                                                        ]
                                                                    );
                                                                    setSportSearch(
                                                                        ''
                                                                    );
                                                                    setShowSportSuggestions(
                                                                        false
                                                                    );
                                                                }}
                                                                style={{
                                                                    padding:
                                                                        '8px 12px',
                                                                    fontSize: 13,
                                                                    cursor: 'pointer',
                                                                    color: text,
                                                                }}
                                                                onMouseEnter={(
                                                                    e
                                                                ) =>
                                                                    (e.currentTarget.style.background =
                                                                        dark
                                                                            ? '#334155'
                                                                            : '#F0F4FA')
                                                                }
                                                                onMouseLeave={(
                                                                    e
                                                                ) =>
                                                                    (e.currentTarget.style.background =
                                                                        'transparent')
                                                                }
                                                            >
                                                                {sport}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                    </div>
                                    {selectedSports.length > 0 && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 6,
                                                marginTop: 6,
                                            }}
                                        >
                                            {selectedSports.map((s) => (
                                                <Chip
                                                    key={s}
                                                    label={s}
                                                    onRemove={() => {
                                                        setSelectedSports(
                                                            selectedSports.filter(
                                                                (x) => x !== s
                                                            )
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Date */}
                                <div style={{ flex: '1 1 160px' }}>
                                    <label
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: muted,
                                            marginBottom: 4,
                                            display: 'block',
                                        }}
                                    >
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        style={{
                                            width: '100%',
                                            height: 36,
                                            borderRadius: 8,
                                            border: `1px solid ${border}`,
                                            background: dark
                                                ? '#0F172A'
                                                : '#F0F4FA',
                                            padding: '0 10px',
                                            fontSize: 13,
                                            color: text,
                                            outline: 'none',
                                            fontFamily: "'DM Sans', sans-serif",
                                        }}
                                    />
                                </div>

                                {/* Location */}
                                <div style={{ flex: '1 1 180px' }}>
                                    <label
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: muted,
                                            marginBottom: 4,
                                            display: 'block',
                                        }}
                                    >
                                        Location
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin
                                            size={14}
                                            style={{
                                                position: 'absolute',
                                                left: 10,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: muted,
                                            }}
                                        />
                                        <input
                                            placeholder="City or area..."
                                            style={{
                                                width: '100%',
                                                height: 36,
                                                borderRadius: 8,
                                                border: `1px solid ${border}`,
                                                background: dark
                                                    ? '#0F172A'
                                                    : '#F0F4FA',
                                                padding: '0 10px 0 32px',
                                                fontSize: 13,
                                                color: text,
                                                outline: 'none',
                                                fontFamily:
                                                    "'DM Sans', sans-serif",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Skill level */}
                                <div style={{ flex: '0 0 auto' }}>
                                    <label
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: muted,
                                            marginBottom: 4,
                                            display: 'block',
                                        }}
                                    >
                                        Skill level
                                    </label>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {SKILL_OPTIONS.map((skill) => (
                                            <button
                                                key={skill}
                                                onClick={() => {
                                                    setSkillFilter(skill);
                                                }}
                                                style={{
                                                    height: 36,
                                                    padding: '0 12px',
                                                    borderRadius: 8,
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    border: `1px solid ${skillFilter === skill ? '#0080FF' : border}`,
                                                    background:
                                                        skillFilter === skill
                                                            ? '#0080FF'
                                                            : 'transparent',
                                                    color:
                                                        skillFilter === skill
                                                            ? '#fff'
                                                            : muted,
                                                    cursor: 'pointer',
                                                    fontFamily:
                                                        "'DM Sans', sans-serif",
                                                }}
                                            >
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results count */}
                        <div style={{ marginBottom: 16 }}>
                            <span style={{ fontSize: 14, color: muted }}>
                                <span style={{ fontWeight: 600, color: text }}>
                                    {MOCK_EVENTS.length}
                                </span>{' '}
                                events found
                            </span>
                        </div>

                        {/* EVENT LIST */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 16,
                            }}
                        >
                            {MOCK_EVENTS.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    dark={dark}
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

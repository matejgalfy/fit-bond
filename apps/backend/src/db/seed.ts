import crypto from 'crypto';
import { db } from './index';
import {
    user,
    events,
    sports,
    locations,
    eventParticipants,
    eventInterested,
    notifications,
    comments,
} from './schema';
import { eq } from 'drizzle-orm';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
type NotificationType =
    | 'comment'
    | 'interest'
    | 'participant_joined'
    | 'event_cancelled'
    | 'event_update';

// ---------------------------------------------------------------------------
// Event data
// ---------------------------------------------------------------------------

const eventData = {
    organizing: [
        {
            name: 'Yoga in the Garden',
            sport: 'Yoga',
            date: 'Mar 27, 2026',
            time: '9:00 AM',
            location: 'Botanical Garden, Brno',
            participants: 4,
            capacity: 15,
            interested: 8,
            skill: 'beginner' as SkillLevel,
        },
        {
            name: 'Friday Football Match',
            sport: 'Football',
            date: 'Mar 28, 2026',
            time: '6:00 PM',
            location: 'Brno-Bystrc, Hřiště',
            participants: 14,
            capacity: 22,
            interested: 3,
            skill: 'intermediate' as SkillLevel,
        },
    ],
    joined: [
        {
            name: 'Morning Run',
            sport: 'Running',
            date: 'Apr 1, 2026',
            time: '7:00 AM',
            location: 'Lužánky Park, Brno',
            participants: 10,
            capacity: 20,
            interested: 5,
            organizer: 'Jana K.',
            skill: 'beginner' as SkillLevel,
        },
        {
            name: 'Tennis Doubles',
            sport: 'Tennis',
            date: 'Apr 3, 2026',
            time: '4:00 PM',
            location: 'TK Brno, Kurty',
            participants: 4,
            capacity: 4,
            interested: 2,
            organizer: 'Martin S.',
            skill: 'advanced' as SkillLevel,
        },
    ],
    interested: [
        {
            name: 'Volleyball on the Beach',
            sport: 'Volleyball',
            date: 'Apr 10, 2026',
            time: '2:00 PM',
            location: 'Přehrada, Brno',
            participants: 8,
            capacity: 12,
            interested: 15,
            organizer: 'Lucie P.',
            skill: 'intermediate' as SkillLevel,
        },
    ],
    discovery: [
        {
            name: 'Basketball 3v3 Tournament',
            sport: 'Basketball',
            date: 'Apr 5, 2026',
            time: '10:00 AM',
            location: 'Kounicova Sportpark, Brno',
            participants: 9,
            capacity: 12,
            interested: 6,
            organizer: 'Pavel N.',
            skill: 'intermediate' as SkillLevel,
        },
        {
            name: 'Cycling Around Brno',
            sport: 'Cycling',
            date: 'Apr 6, 2026',
            time: '8:00 AM',
            location: 'Špilberk Castle, Brno',
            participants: 7,
            capacity: 20,
            interested: 11,
            organizer: 'Tomáš V.',
            skill: 'beginner' as SkillLevel,
        },
        {
            name: 'Swimming Club Open Session',
            sport: 'Swimming',
            date: 'Apr 7, 2026',
            time: '7:00 AM',
            location: 'Aquapark Kohoutovice, Brno',
            participants: 12,
            capacity: 25,
            interested: 4,
            organizer: 'Petra H.',
            skill: 'intermediate' as SkillLevel,
        },
        {
            name: 'Badminton Doubles League',
            sport: 'Badminton',
            date: 'Apr 8, 2026',
            time: '6:00 PM',
            location: 'Hala Rondo, Brno',
            participants: 8,
            capacity: 16,
            interested: 5,
            organizer: 'Ondřej F.',
            skill: 'intermediate' as SkillLevel,
        },
        {
            name: 'Trail Run in Moravian Karst',
            sport: 'Running',
            date: 'Apr 9, 2026',
            time: '9:00 AM',
            location: 'Moravian Karst, Blansko',
            participants: 15,
            capacity: 30,
            interested: 22,
            organizer: 'Klára B.',
            skill: 'advanced' as SkillLevel,
        },
        {
            name: 'Pilates in the Park',
            sport: 'Pilates',
            date: 'Apr 11, 2026',
            time: '8:30 AM',
            location: 'Lužánky Park, Brno',
            participants: 6,
            capacity: 12,
            interested: 3,
            organizer: 'Veronika M.',
            skill: 'beginner' as SkillLevel,
        },
        {
            name: 'Squash Open Challenge',
            sport: 'Squash',
            date: 'Apr 12, 2026',
            time: '5:00 PM',
            location: 'Squash Centrum Brno',
            participants: 4,
            capacity: 8,
            interested: 2,
            organizer: 'Radek J.',
            skill: 'advanced' as SkillLevel,
        },
        {
            name: 'Frisbee in Brno',
            sport: 'Frisbee',
            date: 'Apr 13, 2026',
            time: '3:00 PM',
            location: 'Tyršův háj, Brno',
            participants: 14,
            capacity: 22,
            interested: 9,
            organizer: 'Lukáš D.',
            skill: 'beginner' as SkillLevel,
        },
        {
            name: 'Table Tennis Club Night',
            sport: 'Table Tennis',
            date: 'Apr 14, 2026',
            time: '7:00 PM',
            location: 'TJ Sokol Žabovřesky, Brno',
            participants: 10,
            capacity: 20,
            interested: 7,
            organizer: 'Milan Š.',
            skill: 'intermediate' as SkillLevel,
        },
        {
            name: 'Outdoor Bootcamp',
            sport: 'Fitness',
            date: 'Apr 15, 2026',
            time: '7:00 AM',
            location: 'Kraví hora, Brno',
            participants: 18,
            capacity: 25,
            interested: 12,
            organizer: 'Simona K.',
            skill: 'intermediate' as SkillLevel,
        },
        {
            name: 'Climbing Wall Session',
            sport: 'Climbing',
            date: 'Apr 16, 2026',
            time: '6:00 PM',
            location: 'Boulder Bar Brno',
            participants: 8,
            capacity: 15,
            interested: 6,
            organizer: 'Jakub Č.',
            skill: 'beginner' as SkillLevel,
        },
        {
            name: 'Ice Hockey Pickup Game',
            sport: 'Ice Hockey',
            date: 'Apr 17, 2026',
            time: '9:00 PM',
            location: 'Winning Group Arena, Brno',
            participants: 16,
            capacity: 20,
            interested: 4,
            organizer: 'Marek O.',
            skill: 'intermediate' as SkillLevel,
        },
        {
            name: 'Rowing on Brno Reservoir',
            sport: 'Rowing',
            date: 'Apr 18, 2026',
            time: '8:00 AM',
            location: 'Přehrada, Brno',
            participants: 6,
            capacity: 10,
            interested: 8,
            organizer: 'Andrea T.',
            skill: 'beginner' as SkillLevel,
        },
        {
            name: 'Martial Arts Sparring',
            sport: 'Martial Arts',
            date: 'Apr 19, 2026',
            time: '5:00 PM',
            location: 'Dojo Brno, Cejl',
            participants: 10,
            capacity: 14,
            interested: 5,
            organizer: 'Petr Ž.',
            skill: 'advanced' as SkillLevel,
        },
        {
            name: 'Skateboarding Session',
            sport: 'Skateboarding',
            date: 'Apr 20, 2026',
            time: '2:00 PM',
            location: 'Skatepark Brno, Koliště',
            participants: 9,
            capacity: 20,
            interested: 13,
            organizer: 'Filip W.',
            skill: 'intermediate' as SkillLevel,
        },
        {
            name: 'Beach Volleyball',
            sport: 'Volleyball',
            date: 'Apr 21, 2026',
            time: '4:00 PM',
            location: 'Výstaviště, Brno',
            participants: 10,
            capacity: 12,
            interested: 7,
            organizer: 'Markéta R.',
            skill: 'beginner' as SkillLevel,
        },
        {
            name: 'Nordic Walking Tour',
            sport: 'Nordic Walking',
            date: 'Apr 22, 2026',
            time: '9:00 AM',
            location: 'Bílá hora, Brno',
            participants: 11,
            capacity: 20,
            interested: 6,
            organizer: 'Dagmar L.',
            skill: 'beginner' as SkillLevel,
        },
        {
            name: 'Crossfit WOD',
            sport: 'Crossfit',
            date: 'Apr 23, 2026',
            time: '6:30 AM',
            location: 'CrossFit Brno, Vídeňská',
            participants: 12,
            capacity: 16,
            interested: 9,
            organizer: 'Tomáš H.',
            skill: 'advanced' as SkillLevel,
        },
        {
            name: 'Street Football',
            sport: 'Football',
            date: 'Apr 24, 2026',
            time: '5:00 PM',
            location: 'Husovice Pitch, Brno',
            participants: 16,
            capacity: 22,
            interested: 8,
            organizer: 'Zdeněk P.',
            skill: 'beginner' as SkillLevel,
        },
        {
            name: 'Yoga Sunset Flow',
            sport: 'Yoga',
            date: 'Apr 25, 2026',
            time: '7:00 PM',
            location: 'Špilberk Park, Brno',
            participants: 5,
            capacity: 15,
            interested: 10,
            organizer: 'Barbora N.',
            skill: 'beginner' as SkillLevel,
        },
    ],
};

// ---------------------------------------------------------------------------
// Comment data
// ---------------------------------------------------------------------------

const commentTemplates = [
    "Can't wait for this! See you all there.",
    'Is there parking nearby? First time at this venue.',
    'Will there be equipment provided or should I bring my own?',
    'What should we wear? Any dress code?',
    'I joined last time and it was fantastic, highly recommend!',
    'What is the exact meeting point? The location is a bit large.',
    'Anyone else coming from the city centre? Happy to carpool.',
    "Is this beginner friendly? I'm just starting out.",
    'How long does it usually run? Trying to plan my day.',
    'Just signed up — super excited!',
    'Do we need to warm up beforehand or is that included?',
    'Is there a WhatsApp group for participants?',
    'Loved the last session, looking forward to this one!',
    'Any age restrictions for this event?',
    "Will the event go ahead if it's raining?",
    'Perfect timing, I was looking for exactly this.',
    'Should we bring water and snacks?',
    'Who should I contact if I need to cancel last minute?',
    "I've been doing this for years — happy to help newcomers!",
    'Shared this with my friends, a few of them might join too.',
];

const commenterNames = [
    'Jana K.',
    'Martin S.',
    'Lucie P.',
    'Pavel N.',
    'Tomáš V.',
    'Petra H.',
    'Ondřej F.',
    'Klára B.',
    'Veronika M.',
    'Radek J.',
    'Lukáš D.',
    'Milan Š.',
    'Simona K.',
    'Jakub Č.',
    'Marek O.',
    'Andrea T.',
    'Petr Ž.',
    'Filip W.',
    'Markéta R.',
    'Dagmar L.',
];

// ---------------------------------------------------------------------------
// Notification data
// ---------------------------------------------------------------------------

const notificationData: {
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}[] = [
    {
        type: 'comment',
        title: 'New comment on your event',
        message: 'Jana K. commented on Morning Run: "Can\'t wait for this!"',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
        type: 'participant_joined',
        title: 'New participant joined',
        message: 'Marek R. joined your event Morning Run.',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
        type: 'event_cancelled',
        title: 'Event cancelled',
        message: 'Evening Cycling Group by Lucia D. has been cancelled.',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
        type: 'event_update',
        title: 'Event updated',
        message: 'Friday Football Match has been updated to 7:00 PM.',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
        type: 'interest',
        title: 'Someone is interested in your event',
        message: 'Eva M. marked interest in your Yoga in the Garden event.',
        isRead: true,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
];

const imageUrl = 'http://localhost:3000/uploads/event.jpg';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getOrCreateSport(name: string) {
    const existing = await db.query.sports.findFirst({
        where: eq(sports.name, name),
    });
    if (existing) return existing;
    const [newSport] = await db
        .insert(sports)
        .values({
            name,
            description: `${name} sport`,
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/197/197484.png',
        })
        .returning();
    return newSport;
}

async function getOrCreateLocation(cityStr: string) {
    const existing = await db.query.locations.findFirst({
        where: eq(locations.city, cityStr),
    });
    if (existing) return existing;
    const [newLoc] = await db
        .insert(locations)
        .values({
            address: cityStr,
            city: cityStr,
            country: 'Czech Republic',
            lat: '49.195061',
            lng: '16.606837',
        })
        .returning();
    return newLoc;
}

// Stable ID consumed by the frontend create-event flow until a real
// locations module exists.
export const DEFAULT_LOCATION_ID = '00000000-0000-0000-0000-000000000001';

async function seedDefaultLocation() {
    const existing = await db.query.locations.findFirst({
        where: eq(locations.id, DEFAULT_LOCATION_ID),
    });
    if (existing) return;
    await db.insert(locations).values({
        id: DEFAULT_LOCATION_ID,
        address: 'Default location',
        city: 'Brno',
        country: 'Czech Republic',
        lat: '49.195061',
        lng: '16.606837',
    });
}

async function getOrCreateDummyUser(name: string) {
    const existing = await db.query.user.findFirst({
        where: eq(user.name, name),
    });
    if (existing) return existing;
    const [newUser] = await db
        .insert(user)
        .values({
            id: crypto.randomUUID(),
            name,
            email: `${name.replace(/[\s.]+/g, '').toLowerCase()}@example.com`,
            role: 'user',
        })
        .returning();
    return newUser;
}

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

async function seedEvents() {
    const allUsers = await db.select().from(user);

    if (allUsers.length === 0) {
        console.log('⚠️  No users found — skipping event seeding.');
        return;
    }

    for (const u of allUsers) {
        console.log(`  User events: ${u.name}`);

        for (const item of eventData.organizing) {
            const sport = await getOrCreateSport(item.sport);
            const location = await getOrCreateLocation(item.location);
            await db.insert(events).values({
                organizerId: u.id,
                sportId: sport.id,
                locationId: location.id,
                name: item.name,
                description: `A ${item.sport} event organised by ${u.name}.`,
                skillLevel: item.skill,
                startTime: new Date(`${item.date} ${item.time}`),
                duration: 60,
                capacity: item.capacity,
                currentParticipants: item.participants,
                currentInterested: item.interested,
                isPublic: true,
                coverImageUrl: imageUrl,
            });
        }

        for (const item of eventData.joined) {
            const sport = await getOrCreateSport(item.sport);
            const location = await getOrCreateLocation(item.location);
            const organizer = await getOrCreateDummyUser(item.organizer);

            const [newEvent] = await db
                .insert(events)
                .values({
                    organizerId: organizer.id,
                    sportId: sport.id,
                    locationId: location.id,
                    name: item.name,
                    description: `A ${item.sport} event.`,
                    skillLevel: item.skill,
                    startTime: new Date(`${item.date} ${item.time}`),
                    duration: 60,
                    capacity: item.capacity,
                    currentParticipants: item.participants,
                    currentInterested: item.interested,
                    isPublic: true,
                    coverImageUrl: imageUrl,
                })
                .returning();

            await db
                .insert(eventParticipants)
                .values({ eventId: newEvent.id, userId: u.id })
                .onConflictDoNothing();
        }

        for (const item of eventData.interested) {
            const sport = await getOrCreateSport(item.sport);
            const location = await getOrCreateLocation(item.location);
            const organizer = await getOrCreateDummyUser(item.organizer);

            const [newEvent] = await db
                .insert(events)
                .values({
                    organizerId: organizer.id,
                    sportId: sport.id,
                    locationId: location.id,
                    name: item.name,
                    description: `A ${item.sport} event.`,
                    skillLevel: item.skill,
                    startTime: new Date(`${item.date} ${item.time}`),
                    duration: 60,
                    capacity: item.capacity,
                    currentParticipants: item.participants,
                    currentInterested: item.interested,
                    isPublic: true,
                    coverImageUrl: imageUrl,
                })
                .returning();

            await db
                .insert(eventInterested)
                .values({ eventId: newEvent.id, userId: u.id })
                .onConflictDoNothing();
        }
    }

    // Discovery events are seeded once (not per user — no relationship created)
    console.log('  Discovery events...');
    for (const item of eventData.discovery) {
        const sport = await getOrCreateSport(item.sport);
        const location = await getOrCreateLocation(item.location);
        const organizer = await getOrCreateDummyUser(item.organizer);

        await db.insert(events).values({
            organizerId: organizer.id,
            sportId: sport.id,
            locationId: location.id,
            name: item.name,
            description: `A ${item.sport} event open to everyone.`,
            skillLevel: item.skill,
            startTime: new Date(`${item.date} ${item.time}`),
            duration: 60,
            capacity: item.capacity,
            currentParticipants: item.participants,
            currentInterested: item.interested,
            isPublic: true,
            coverImageUrl: imageUrl,
        });
    }
}

async function seedNotifications() {
    const allUsers = await db.select({ id: user.id }).from(user);

    if (allUsers.length === 0) {
        console.log('⚠️  No users found — skipping notification seeding.');
        return;
    }

    const rows = allUsers.flatMap((u) =>
        notificationData.map((n) => ({ ...n, userId: u.id }))
    );

    await db.insert(notifications).values(rows);
}

async function seedComments() {
    const allEvents = await db
        .select({ id: events.id, organizerId: events.organizerId })
        .from(events);

    if (allEvents.length === 0) {
        console.log('⚠️  No events found — skipping comment seeding.');
        return;
    }

    for (const event of allEvents) {
        const count = 2 + (allEvents.indexOf(event) % 3); // 2, 3, or 4 comments per event
        const rows: {
            eventId: string;
            userId: string;
            content: string;
            createdAt: Date;
        }[] = [];

        for (let i = 0; i < count; i++) {
            const commenterName =
                commenterNames[
                    (allEvents.indexOf(event) * count + i) %
                        commenterNames.length
                ];
            const commenter = await getOrCreateDummyUser(commenterName);
            const content =
                commentTemplates[
                    (allEvents.indexOf(event) * count + i) %
                        commentTemplates.length
                ];
            const minutesAgo = (i + 1) * 37 + allEvents.indexOf(event) * 7;

            rows.push({
                eventId: event.id,
                userId: commenter.id,
                content,
                createdAt: new Date(Date.now() - minutesAgo * 60 * 1000),
            });
        }

        await db.insert(comments).values(rows);
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.log('🌱 Seeding database...');

    console.log('📍 Seeding default location...');
    await seedDefaultLocation();

    console.log('🏟️  Seeding events...');
    await seedEvents();

    console.log('💬 Seeding comments...');
    await seedComments();

    console.log('🔔 Seeding notifications...');
    await seedNotifications();

    console.log('✅ Seeding complete!');
    process.exit(0);
}

void main();

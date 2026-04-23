import { db } from './index';
import {
    user,
    events,
    sports,
    locations,
    eventParticipants,
    eventInterested,
} from './schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const data = {
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
            organizer: 'Eva M.',
            skill: 'Beginner',
            color: 'var(--primary-purple)',
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
            organizer: 'Tomáš R.',
            skill: 'Intermediate',
            color: 'var(--primary-purple)',
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
            skill: 'Beginner',
            color: 'var(--primary-blue)',
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
            skill: 'Advanced',
            color: 'var(--primary-orange)',
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
            skill: 'Intermediate',
            color: 'var(--primary-purple)',
        },
    ],
};

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
            email: `${name.replace(/\s+/g, '').replace('.', '').toLowerCase()}@example.com`,
            role: 'user',
        })
        .returning();
    return newUser;
}

async function main() {
    console.log('🌱 Adding predefined events to every user...');
    const allUsers = await db.select().from(user);

    if (allUsers.length === 0) {
        console.log(
            '⚠️ No users found in the database. Please run seed first.'
        );
        process.exit(1);
    }

    for (const u of allUsers) {
        console.log(`Processing user: ${u.name}`);

        // Organizing (User is the organizer)
        for (const item of data.organizing) {
            const sport = await getOrCreateSport(item.sport);
            const location = await getOrCreateLocation(item.location);
            await db.insert(events).values({
                organizerId: u.id,
                sportId: sport.id,
                locationId: location.id,
                name: item.name,
                description: `This is a ${item.sport} event organized by ${u.name}.`,
                skillLevel: item.skill.toLowerCase() as
                    | 'beginner'
                    | 'intermediate'
                    | 'advanced',
                startTime: new Date(`${item.date} ${item.time}`),
                duration: 60,
                capacity: item.capacity,
                currentParticipants: item.participants,
                currentInterested: item.interested,
                isPublic: true,
                coverImageUrl: 'https://picsum.photos/seed/sports/400/300',
            });
        }

        // Joined (Someone else is the organizer, user is participating)
        for (const item of data.joined) {
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
                    description: `This is a ${item.sport} event.`,
                    skillLevel: item.skill.toLowerCase() as
                        | 'beginner'
                        | 'intermediate'
                        | 'advanced',
                    startTime: new Date(`${item.date} ${item.time}`),
                    duration: 60,
                    capacity: item.capacity,
                    currentParticipants: item.participants,
                    currentInterested: item.interested,
                    isPublic: true,
                    coverImageUrl: 'https://picsum.photos/seed/sports/400/300',
                })
                .returning();

            // Link the user as a participant
            await db
                .insert(eventParticipants)
                .values({ eventId: newEvent.id, userId: u.id })
                .onConflictDoNothing();
        }

        // Interested (Someone else is the organizer, user is interested)
        for (const item of data.interested) {
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
                    description: `This is a ${item.sport} event.`,
                    skillLevel: item.skill.toLowerCase() as
                        | 'beginner'
                        | 'intermediate'
                        | 'advanced',
                    startTime: new Date(`${item.date} ${item.time}`),
                    duration: 60,
                    capacity: item.capacity,
                    currentParticipants: item.participants,
                    currentInterested: item.interested,
                    isPublic: true,
                    coverImageUrl: 'https://picsum.photos/seed/sports/400/300',
                })
                .returning();

            // Link the user as interested
            await db
                .insert(eventInterested)
                .values({ eventId: newEvent.id, userId: u.id })
                .onConflictDoNothing();
        }
    }

    console.log('✅ Events successfully added to all users!');
    process.exit(0);
}

void main();

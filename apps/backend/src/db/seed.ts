import { db } from './index';
import * as schema from './schema';
import { seed, reset } from 'drizzle-seed';

async function main() {
    console.log('🌱 Seeding database with realistic data...');
    await reset(db, schema);

    await seed(db, schema).refine((f) => ({
        sports: {
            count: 5,
            columns: {
                name: f.valuesFromArray({
                    values: [
                        'Football',
                        'Basketball',
                        'Tennis',
                        'Volleyball',
                        'Running',
                    ],
                }),
                description: f.loremIpsum({ sentencesCount: 2 }),
                iconUrl: f.valuesFromArray({
                    values: [
                        'https://cdn-icons-png.flaticon.com/512/197/197484.png',
                        'https://cdn-icons-png.flaticon.com/512/197/197567.png',
                        'https://cdn-icons-png.flaticon.com/512/197/197386.png',
                        'https://cdn-icons-png.flaticon.com/512/197/197408.png',
                        'https://cdn-icons-png.flaticon.com/512/197/197374.png',
                    ],
                }),
                deletedAt: f.default({ defaultValue: null }),
            },
        },
        locations: {
            count: 8,
            columns: {
                address: f.streetAddress(),
                city: f.city(),
                country: f.country(),
                lat: f.number({
                    minValue: -90,
                    maxValue: 90,
                    precision: 1000000,
                }),
                lng: f.number({
                    minValue: -180,
                    maxValue: 180,
                    precision: 1000000,
                }),
                deletedAt: f.default({ defaultValue: null }),
            },
        },
        users: {
            count: 10,
            columns: {
                id: f.uuid(),
                firstName: f.firstName(),
                lastName: f.lastName(),
                email: f.email(),
                profilePictureUrl: f.default({
                    defaultValue: 'https://picsum.photos/seed/2/400/300',
                }),
                bio: f.loremIpsum(),
                role: f.valuesFromArray({ values: ['user', 'admin'] }),
                isBanned: f.default({ defaultValue: false }),
                deletedAt: f.default({ defaultValue: null }),
            },
            with: {
                userPreferredSports: 1,
            },
        },
        userPreferredSports: {
            count: 0,
        },
        events: {
            count: 12,
            columns: {
                name: f.jobTitle(),
                description: f.loremIpsum({ sentencesCount: 3 }),
                skillLevel: f.valuesFromArray({
                    values: ['beginner', 'intermediate', 'advanced'],
                }),
                startTime: f.date(),
                duration: f.int({ minValue: 30, maxValue: 180 }),
                capacity: f.int({ minValue: 5, maxValue: 30 }),
                isPublic: f.boolean(),
                coverImageUrl: f.default({
                    defaultValue: 'https://picsum.photos/seed/2/400/300',
                }),
                deletedAt: f.default({ defaultValue: null }),
                cancelledAt: f.default({ defaultValue: null }),
            },
            with: {
                eventParticipants: 1,
                eventInterested: 1,
                comments: 3,
            },
        },
    }));

    console.log('✅ Seeding complete!');
    process.exit(0);
}

void main();

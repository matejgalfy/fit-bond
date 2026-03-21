import { db } from './index';
import * as schema from './schema';
import { seed } from 'drizzle-seed';

async function main() {
    console.log('🌱 Seeding database with realistic data...');

    await seed(db, schema, { seed: 69 }).refine((f) => ({
        sports: {
            count: 5,
            columns: {
                name: [
                    'Football',
                    'Basketball',
                    'Tennis',
                    'Volleyball',
                    'Running',
                ],
                description: f.loremIpsum( {sentencesCount: 2} ),
                iconUrl: [
                    'https://cdn-icons-png.flaticon.com/512/197/197484.png',
                    'https://cdn-icons-png.flaticon.com/512/197/197567.png',
                    'https://cdn-icons-png.flaticon.com/512/197/197386.png',
                    'https://cdn-icons-png.flaticon.com/512/197/197408.png',
                    'https://cdn-icons-png.flaticon.com/512/197/197374.png',
                ],
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
                    precision: 1000000 // To get 6 decimal places
                }),
                // Longitude: -180 to 180
                lng: f.number({ 
                    minValue: -180, 
                    maxValue: 180, 
                    precision: 1000000 
                }),
            },
        },
        users: {
            count: 15,
            columns: {
                firstName: f.firstName(),
                lastName: f.lastName(),
                email: f.email(),
                // TODO: Add some randomnes
                profilePictureUrl: "https://picsum.photos/seed/2/400/300",
                bio: f.loremIpsum(),
                role: ['user', 'admin'],
                isBanned: false,
            },
            with: {
                preferredSports: {
                    count: { min: 1, max: 3 },
                },
                locations: {
                    count: 1,
                },
            },
        },
        events: {
            count: 12,
            columns: {
                name: f.jobTitle(),
                description: f.loremIpsum({ sentencesCount: 3 }),
                skillLevel: ['beginner', 'intermediate', 'advanced'],
                startTime: f.datetime(),
                duration: f.int({ minValue: 30, maxValue: 180 }),
                capacity: f.int({ minValue: 5, maxValue: 30 }),
                isPublic: f.boolean(), // 70% true, 30% false
                coverImageUrl: "https://picsum.photos/seed/2/400/300",
            },
            with: {
                participants: {
                    count: { min: 2, max: 8 },
                },
                comments: {
                    count: { min: 0, max: 5 },
                },
            },
        },
        comments: {
            count: 20,
            columns: {
                content: f.loremIpsum({ sentencesCount: 4 }),
            },
        },
    }));

    console.log('✅ Seeding complete!');
    process.exit(0);
}

void main();

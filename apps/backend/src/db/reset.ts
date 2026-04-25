import { db } from './index';
import * as schema from './schema';
import { reset } from 'drizzle-seed';

async function main() {
    console.log('🧹 Clearing database...');
    await reset(db, schema);
    console.log('✅ Database cleared.');
    process.exit(0);
}

void main();

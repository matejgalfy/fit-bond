import { db } from './index';
import * as schema from './schema';
import { reset } from 'drizzle-seed';

async function main() {
    console.log('Clearing database...');
    await reset(db, schema);
}

void main();
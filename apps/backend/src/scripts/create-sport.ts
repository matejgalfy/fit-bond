import { db } from '../db/index';
import { createSportsService } from '../modules/sports/sports.service';

const sportsService = createSportsService();

function getArgValue(names: string[]) {
    const args = process.argv.slice(2);
    for (const name of names) {
        const index = args.indexOf(name);
        if (
            index >= 0 &&
            args[index + 1] &&
            !args[index + 1].startsWith('--')
        ) {
            return args[index + 1];
        }

        const prefixed = args.find((arg) => arg.startsWith(`${name}=`));
        if (prefixed) {
            return prefixed.slice(name.length + 1);
        }
    }

    return null;
}

function getPositionalArg() {
    return process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? null;
}

async function main() {
    const name = getArgValue(['--name']) ?? getPositionalArg();
    const iconUrl = getArgValue(['--icon-url', '--iconUrl']);
    const description = getArgValue(['--description']);

    if (!name) {
        console.error(
            'Usage: bun run sports:create -- --name <sport-name> [--icon-url <url>] [--description <text>]'
        );
        process.exit(1);
    }

    const sport = await sportsService.create(db, {
        name,
        iconUrl: iconUrl ?? undefined,
        description: description ?? undefined,
    });

    console.log(`Created sport ${sport.name} (${sport.id}).`);
    process.exit(0);
}

void main().catch((error: unknown) => {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('Failed to create sport.');
    }
    process.exit(1);
});

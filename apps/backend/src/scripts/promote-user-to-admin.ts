import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { user } from '../db/schema';
import { createAdminService } from '../modules/admin/admin.service';

const adminService = createAdminService();

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
    const identifier =
        getArgValue(['--id', '--user-id']) ??
        getArgValue(['--email', '--user-email']) ??
        getPositionalArg();

    if (!identifier) {
        console.error(
            'Usage: bun run admin:promote -- --id <user-id> | --email <user-email>'
        );
        process.exit(1);
    }

    const foundById = await db.query.user.findFirst({
        where: eq(user.id, identifier),
    });
    const target =
        foundById ??
        (await db.query.user.findFirst({
            where: eq(user.email, identifier),
        }));

    if (!target) {
        console.error(`User not found for identifier: ${identifier}`);
        process.exit(1);
    }

    const updated = await adminService.updateUser(db, target.id, {
        role: 'admin',
    });

    console.log(`Promoted ${updated.name} (${updated.email}) to admin.`);
    process.exit(0);
}

void main().catch((error: unknown) => {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('Failed to promote user to admin.');
    }
    process.exit(1);
});

import { t } from 'elysia';

export const uploadBody = t.Object({
    file: t.File({
        type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxSize: '5m',
    }),
});

export const uploadResponse = t.Object({ url: t.String() });

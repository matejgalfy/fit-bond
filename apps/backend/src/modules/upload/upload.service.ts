import path from 'path';
import { ServiceError } from '../../utils/errors';

// Derive the on-disk extension from the validated MIME type, never from the
// user-supplied filename — otherwise a real image named `x.html` would be
// served back from /uploads as HTML (stored XSS). The accepted types mirror
// the `t.File({ type: [...] })` allowlist in upload.schema.ts.
const EXTENSION_BY_MIME: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

export const uploadService = {
    async uploadImage(file: File): Promise<{ url: string }> {
        const ext = EXTENSION_BY_MIME[file.type];
        if (!ext) {
            throw ServiceError.badRequest('Unsupported image type');
        }
        const filename = `${crypto.randomUUID()}${ext}`;
        const filepath = path.join(process.cwd(), 'uploads', filename);

        await Bun.write(filepath, file);
        return { url: `/uploads/${filename}` };
    },
};

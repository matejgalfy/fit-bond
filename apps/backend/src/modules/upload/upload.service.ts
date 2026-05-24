import path from 'path';

export const uploadService = {
    async uploadImage(file: File): Promise<{ url: string }> {
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${crypto.randomUUID()}${ext}`;
        const filepath = path.join(process.cwd(), 'uploads', filename);

        await Bun.write(filepath, file);
        return { url: `/uploads/${filename}` };
    },
};

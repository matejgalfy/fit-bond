import { apiUrl, filesBaseUrl } from './api';

export async function uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: form,
    });

    if (!res.ok) {
        throw new Error('Image upload failed');
    }

    const { url } = (await res.json()) as { url: string };
    return `${filesBaseUrl}${url}`;
}

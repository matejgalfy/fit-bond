import { Elysia } from 'elysia';
import { uploadBody, uploadResponse } from './upload.schema';
import { authLayer } from '../../auth_middleware';
import { uploadService } from './upload.service';

export const uploadRoutes = new Elysia()
    .use(authLayer)
    .post('/upload', ({ body }) => uploadService.uploadImage(body.file), {
        body: uploadBody,
        response: uploadResponse,
        auth: true,
        detail: {
            tags: ['Upload'],
            summary: 'Upload an image file',
        },
    });

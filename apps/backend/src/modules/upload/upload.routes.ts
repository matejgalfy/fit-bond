import { Elysia } from 'elysia';
import { uploadBody, uploadResponse } from './upload.schema';
import { uploadController } from './upload.controller';
import { authLayer } from '../../auth_middleware';

export const uploadRoutes = new Elysia()
    .use(authLayer)
    .post('/upload', ({ body }) => uploadController.uploadImage(body.file), {
        body: uploadBody,
        response: uploadResponse,
        auth: true,
        detail: {
            tags: ['Upload'],
            summary: 'Upload an image file',
        },
    });

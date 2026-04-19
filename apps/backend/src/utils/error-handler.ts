import { t } from 'elysia';
import { ServiceError } from './errors';

export const apiErrorSchema = t.Object({
    error: t.String(),
    code: t.String(),
});

export const standardErrorResponses = {
    400: apiErrorSchema,
    401: apiErrorSchema,
    403: apiErrorSchema,
    404: apiErrorSchema,
    409: apiErrorSchema,
    422: t.Object({
        error: t.String(),
        code: t.Literal('VALIDATION_ERROR'),
        details: t.Array(
            t.Object({
                path: t.Array(t.Union([t.String(), t.Number()])),
                message: t.String(),
            })
        ),
    }),
} as const;

interface ZodLikeError {
    name: string;
    errors: { path: (string | number)[]; message: string }[];
}

function isZodError(error: Error): error is Error & ZodLikeError {
    return error.name === 'ZodError' && 'errors' in error;
}

export function handleServiceError({
    error,
    set,
}: {
    error: Error;
    set: { status?: number | string };
}) {
    if (error instanceof ServiceError) {
        set.status = error.statusCode;
        return { error: error.message, code: error.code };
    }

    if (isZodError(error)) {
        set.status = 422;
        return {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR' as const,
            details: error.errors.map((e) => ({
                path: e.path,
                message: e.message,
            })),
        };
    }
}

import { t, type ErrorHandler } from 'elysia';
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
    500: apiErrorSchema,
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

interface ElysiaValidationIssue {
    path: string | (string | number)[];
    message?: string;
    summary?: string;
}

interface ElysiaValidationError extends Error {
    all?: ElysiaValidationIssue[];
    errors?: ElysiaValidationIssue[];
}

export const handleServiceError: ErrorHandler = ({ error, set, code }) => {
    if (error instanceof ServiceError) {
        set.status = error.statusCode;
        return { error: error.message, code: error.code };
    }

    if (code === 'VALIDATION') {
        set.status = 422;

        const validationError = error as ElysiaValidationError;
        const issues = validationError.all ?? validationError.errors ?? [];

        return {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR' as const,
            details: issues.map((issue) => {
                const pathArray =
                    typeof issue.path === 'string'
                        ? issue.path.split('/').filter(Boolean)
                        : Array.isArray(issue.path)
                          ? issue.path
                          : [];

                return {
                    path: pathArray,
                    message: issue.message ?? issue.summary ?? 'Invalid input',
                };
            }),
        };
    }

    // 3. Handle Unhandled / Internal Errors
    set.status = 500;
    console.error(`[Unhandled Error: `, error); // Prevent silent failures

    return {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
    };
};

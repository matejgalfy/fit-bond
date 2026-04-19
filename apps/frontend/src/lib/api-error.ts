import type { ServiceErrorCode } from '../../../backend/src/utils/errors';

export class ApiError extends Error {
    public readonly code: ServiceErrorCode;

    constructor(message: string, code: ServiceErrorCode) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
    }
}

interface EdenErrorValue {
    error?: string;
    code?: string;
}

interface EdenErrorLike {
    value?: EdenErrorValue | string;
    message?: string;
}

/**
 * Extracts a structured error from an Eden treaty error response.
 * Throws an `ApiError` if the response contains an error, otherwise does nothing.
 */
export function throwIfError(
    error: unknown,
    fallbackMessage: string
): asserts error is null | undefined {
    if (error == null) return;

    const errorLike = error as EdenErrorLike;
    const val = errorLike.value;

    if (typeof val === 'object' && typeof val.error === 'string') {
        throw new ApiError(
            val.error,
            val.code != null ? (val.code as ServiceErrorCode) : 'INTERNAL_ERROR'
        );
    }

    if (typeof val === 'string' && val.length > 0) {
        throw new Error(val);
    }

    if (typeof errorLike.message === 'string' && errorLike.message.length > 0) {
        throw new Error(errorLike.message);
    }

    throw new Error(fallbackMessage);
}

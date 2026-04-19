const CODE_TO_STATUS = {
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    UNAUTHORIZED: 401,
    CONFLICT: 409,
    BAD_REQUEST: 400,
    INTERNAL_ERROR: 500,
} as const;

export type ServiceErrorCode = keyof typeof CODE_TO_STATUS;

export class ServiceError extends Error {
    public readonly code: ServiceErrorCode;
    public readonly statusCode: number;

    constructor(message: string, code: ServiceErrorCode) {
        super(message);
        this.name = 'ServiceError';
        this.code = code;
        this.statusCode = CODE_TO_STATUS[code];
    }

    static notFound(message: string) {
        return new ServiceError(message, 'NOT_FOUND');
    }
    static forbidden(message: string) {
        return new ServiceError(message, 'FORBIDDEN');
    }
    static unauthorized(message: string) {
        return new ServiceError(message, 'UNAUTHORIZED');
    }
    static conflict(message: string) {
        return new ServiceError(message, 'CONFLICT');
    }
    static badRequest(message: string) {
        return new ServiceError(message, 'BAD_REQUEST');
    }
}

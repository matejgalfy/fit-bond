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
    public readonly statusCode: number;

    constructor(
        message: string,
        public readonly code: ServiceErrorCode
    ) {
        super(message);
        this.name = 'ServiceError';
        this.statusCode = CODE_TO_STATUS[code];
    }

    static notFound = (msg: string) => new ServiceError(msg, 'NOT_FOUND');
    static forbidden = (msg: string) => new ServiceError(msg, 'FORBIDDEN');
    static unauthorized = (msg: string) =>
        new ServiceError(msg, 'UNAUTHORIZED');
    static conflict = (msg: string) => new ServiceError(msg, 'CONFLICT');
    static badRequest = (msg: string) => new ServiceError(msg, 'BAD_REQUEST');
}

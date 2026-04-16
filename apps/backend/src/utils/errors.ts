export type ServiceErrorCode =
    | 'NOT_FOUND'
    | 'ALREADY_EXISTS'
    | 'UNAUTHORIZED'
    | 'VALIDATION_FAILED'
    | 'INTERNAL_ERROR';

export class ServiceError extends Error {
    constructor(
        public override message: string,
        // eslint-disable-next-line no-unused-vars
        public code: ServiceErrorCode,
        // eslint-disable-next-line no-unused-vars
        public status = 400
    ) {
        super(message);
        this.name = 'ServiceError';
    }
}

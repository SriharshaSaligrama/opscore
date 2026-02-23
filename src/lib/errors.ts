export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number
    ) {
        super(message)
    }
}

export class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401)
    }
}
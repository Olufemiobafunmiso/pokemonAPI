import { FastifyError } from "fastify";

export class CustomError implements FastifyError {
    constructor(message = 'An error occurred, admin fixing 🛠', statusCode = 500, code = "Error") {
        this.statusCode = statusCode
        this.message = message
        this.code = code
    }
    code: string;
    name: string;
    statusCode?: number;
    message: string;



}

export class NotFoundError extends CustomError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class BadRequestError extends CustomError {
    constructor(message: string) {
        super(message, 400);
    }
}



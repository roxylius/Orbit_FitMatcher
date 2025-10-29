import { Request, Response, NextFunction } from 'express';
import getLogger from '../utils/logger';

const logger = getLogger('errorHandler');

/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    // Log error for debugging
    logger.error('ErrorHandler', `${err.message}\nStack: ${err.stack || 'No stack trace'}`);

    // Default error status and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

// Custom error class for operational errors
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

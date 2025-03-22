'use strict';

/**
 * Handle 404 errors for routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
};

/**
 * Global error handler for all uncaught errors
 */
const errorHandler = (err, req, res, next) => {
    // Handle JWT authentication errors
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        // P2025 is "Record not found"
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Resource not found' });
        }

        // P2002 is unique constraint violation
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'Resource already exists' });
        }

        return res.status(400).json({ error: 'Database operation failed' });
    }

    // Log the error for debugging
    console.error('Uncaught error:', err);

    // Explicit error status codes
    if (err.statusCode === 400) {
        return res.status(400).json({ error: err.message || 'Bad Request' });
    } else if (err.statusCode === 404) {
        return res.status(404).json({ error: err.message || 'Not Found' });
    } else if (err.statusCode === 410) {
        return res.status(410).json({ error: err.message || 'Gone' });
    } else if (err.statusCode === 403) {
        return res.status(403).json({ error: err.message || 'Forbidden' });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({ error: message });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
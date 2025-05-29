const { notFoundHandler, errorHandler } = require('../../middlewares/errorMiddleware');

describe('Error Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            method: 'GET',
            path: '/nonexistent'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('notFoundHandler', () => {
        test('should return 404 with method and path in error message', () => {
            notFoundHandler(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cannot GET /nonexistent'
            });
        });

        test('should handle different HTTP methods', () => {
            req.method = 'POST';
            req.path = '/api/users';

            notFoundHandler(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cannot POST /api/users'
            });
        });
    });

    describe('errorHandler', () => {
        describe('JWT authentication errors', () => {
            test('should handle UnauthorizedError', () => {
                const err = {
                    name: 'UnauthorizedError'
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Invalid or expired token'
                });
            });
        });

        describe('Prisma errors', () => {
            test('should handle PrismaClientKnownRequestError with P2025 code (record not found)', () => {
                const err = {
                    name: 'PrismaClientKnownRequestError',
                    code: 'P2025'
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Resource not found'
                });
            });

            test('should handle PrismaClientKnownRequestError with P2002 code (unique constraint)', () => {
                const err = {
                    name: 'PrismaClientKnownRequestError',
                    code: 'P2002'
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(409);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Resource already exists'
                });
            });

            test('should handle PrismaClientKnownRequestError with unknown code', () => {
                const err = {
                    name: 'PrismaClientKnownRequestError',
                    code: 'P9999'
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Database operation failed'
                });
            });
        });

        describe('Explicit status code errors', () => {
            test('should handle 400 status code with custom message', () => {
                const err = {
                    statusCode: 400,
                    message: 'Invalid input data'
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Invalid input data'
                });
            });

            test('should handle 400 status code with default message', () => {
                const err = {
                    statusCode: 400
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Bad Request'
                });
            });

            test('should handle 404 status code with custom message', () => {
                const err = {
                    statusCode: 404,
                    message: 'User not found'
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'User not found'
                });
            });

            test('should handle 404 status code with default message', () => {
                const err = {
                    statusCode: 404
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Not Found'
                });
            });

            test('should handle 410 status code with custom message', () => {
                const err = {
                    statusCode: 410,
                    message: 'Resource has expired'
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(410);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Resource has expired'
                });
            });

            test('should handle 410 status code with default message', () => {
                const err = {
                    statusCode: 410
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(410);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Gone'
                });
            });

            test('should handle 403 status code with custom message', () => {
                const err = {
                    statusCode: 403,
                    message: 'Access denied'
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Access denied'
                });
            });

            test('should handle 403 status code with default message', () => {
                const err = {
                    statusCode: 403
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Forbidden'
                });
            });
        });

        describe('Default error handling', () => {
            test('should handle generic error with custom status code and message', () => {
                const err = {
                    statusCode: 422,
                    message: 'Unprocessable entity'
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(422);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Unprocessable entity'
                });
            });

            test('should handle generic error with default status code 500', () => {
                const err = {
                    message: 'Something went wrong'
                };

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Something went wrong'
                });
            });

            test('should handle error with no message using default message', () => {
                const err = {};

                errorHandler(err, req, res, next);

                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'Internal server error'
                });
            });
        });

        describe('Error logging', () => {
            test('should log uncaught errors to console', () => {
                const err = {
                    message: 'Test error',
                    stack: 'Error stack trace'
                };

                errorHandler(err, req, res, next);

                expect(console.error).toHaveBeenCalledWith('Uncaught error:', err);
            });
        });
    });
}); 
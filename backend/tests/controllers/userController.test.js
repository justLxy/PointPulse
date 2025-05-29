// Mock external dependencies
jest.mock('../../services/userService');
jest.mock('../../middlewares/authMiddleware');

const userController = require('../../controllers/userController');
const userService = require('../../services/userService');
const { checkRole } = require('../../middlewares/authMiddleware');

describe('UserController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        req = {
            body: {},
            params: {},
            query: {},
            auth: { id: 1, role: 'regular' },
            originalUrl: '/test',
            method: 'GET',
            protocol: 'http',
            get: jest.fn().mockReturnValue('localhost:3000'),
            file: null
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('createUser', () => {
        beforeEach(() => {
            req.auth = { id: 1, role: 'cashier' };
            req.body = {
                utorid: 'testuser1',
                name: 'Test User',
                email: 'test@mail.utoronto.ca'
            };
        });

        test('should create user successfully with cashier role', async () => {
            checkRole.mockReturnValue(true);
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                email: 'test@mail.utoronto.ca',
                verified: false
            };
            userService.createUser.mockResolvedValue(mockUser);

            await userController.createUser(req, res);

            expect(checkRole).toHaveBeenCalledWith(req.auth, 'cashier');
            expect(userService.createUser).toHaveBeenCalledWith({
                utorid: 'testuser1',
                name: 'Test User',
                email: 'test@mail.utoronto.ca'
            }, 1);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        test('should handle utorid case conversion', async () => {
            req.body.utorid = 'TESTUSER1';
            checkRole.mockReturnValue(true);
            userService.createUser.mockResolvedValue({});

            await userController.createUser(req, res);

            expect(userService.createUser).toHaveBeenCalledWith({
                utorid: 'testuser1',
                name: 'Test User',
                email: 'test@mail.utoronto.ca'
            }, 1);
        });

        test('should return 403 when user lacks cashier role', async () => {
            checkRole.mockReturnValue(false);

            await userController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to create users'
            });
        });

        test('should return 409 when user already exists', async () => {
            checkRole.mockReturnValue(true);
            userService.createUser.mockRejectedValue(new Error('User with this UTORid already exists'));

            await userController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User with this UTORid already exists'
            });
        });

        test('should return 400 for validation errors', async () => {
            checkRole.mockReturnValue(true);
            userService.createUser.mockRejectedValue(new Error('Invalid email format'));

            await userController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid email format'
            });
        });
    });

    describe('getUsers', () => {
        beforeEach(() => {
            req.auth = { id: 1, role: 'manager' };
            req.query = {
                name: 'test',
                role: 'regular',
                verified: 'true',
                activated: 'false',
                page: '2',
                limit: '5'
            };
        });

        test('should get users successfully with manager role', async () => {
            checkRole.mockReturnValue(true);
            const mockResult = {
                results: [{ id: 1, name: 'Test User' }],
                count: 1
            };
            userService.getUsers.mockResolvedValue(mockResult);

            await userController.getUsers(req, res);

            expect(checkRole).toHaveBeenCalledWith(req.auth, 'manager');
            expect(userService.getUsers).toHaveBeenCalledWith({
                name: 'test',
                role: 'regular',
                verified: 'true',
                activated: 'false'
            }, '2', '5');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should use default pagination values', async () => {
            req.query = {};
            checkRole.mockReturnValue(true);
            userService.getUsers.mockResolvedValue({ results: [], count: 0 });

            await userController.getUsers(req, res);

            expect(userService.getUsers).toHaveBeenCalledWith({}, 1, 10);
        });

        test('should return 403 when user lacks manager role', async () => {
            checkRole.mockReturnValue(false);

            await userController.getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to view all users'
            });
            expect(userService.getUsers).not.toHaveBeenCalled();
        });

        test('should return 400 for invalid pagination', async () => {
            checkRole.mockReturnValue(true);
            userService.getUsers.mockRejectedValue(new Error('Invalid page number'));

            await userController.getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid page number'
            });
        });

        test('should return 400 for invalid limit', async () => {
            checkRole.mockReturnValue(true);
            userService.getUsers.mockRejectedValue(new Error('Invalid limit number'));

            await userController.getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid limit number'
            });
        });

        test('should return 500 for other errors', async () => {
            checkRole.mockReturnValue(true);
            userService.getUsers.mockRejectedValue(new Error('Database error'));

            await userController.getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database error'
            });
        });
    });

    describe('getUser', () => {
        beforeEach(() => {
            req.params = { userId: '1' };
        });

        test('should return 400 for invalid user ID', async () => {
            req.params.userId = 'invalid';

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid user ID'
            });
        });

        test('should return 404 when user not found', async () => {
            userService.getUserRole.mockResolvedValue(null);

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User not found'
            });
        });

        test('should return 403 when viewing manager without manager role', async () => {
            req.auth = { role: 'cashier' };
            userService.getUserRole.mockResolvedValue({ id: 1, role: 'manager' });
            checkRole.mockReturnValue(false);

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Insufficient permissions to view this user'
            });
        });

        test('should get user by manager successfully', async () => {
            req.auth = { role: 'manager' };
            const mockTargetUser = { id: 1, role: 'regular' };
            const mockUser = { id: 1, name: 'Test User', role: 'regular' };
            
            userService.getUserRole.mockResolvedValue(mockTargetUser);
            checkRole.mockReturnValueOnce(true).mockReturnValueOnce(true);
            userService.getUserByManager.mockResolvedValue(mockUser);

            await userController.getUser(req, res);

            expect(userService.getUserByManager).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        test('should get user by cashier successfully', async () => {
            req.auth = { role: 'cashier' };
            const mockTargetUser = { id: 1, role: 'regular' };
            const mockUser = { id: 1, name: 'Test User', points: 100 };
            
            userService.getUserRole.mockResolvedValue(mockTargetUser);
            
            // Clear any previous mock implementations and set up fresh one
            checkRole.mockClear();
            checkRole.mockReset();
            checkRole.mockImplementation((auth, role) => {
                if (role === 'manager') return false; // First check - not a manager
                if (role === 'cashier') return true;  // Second check - is a cashier
                return false;
            });
            userService.getUserByCashier.mockResolvedValue(mockUser);

            await userController.getUser(req, res);

            expect(userService.getUserByCashier).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        test('should return 403 when user lacks sufficient role', async () => {
            req.auth = { role: 'regular' };
            const mockTargetUser = { id: 1, role: 'regular' };
            
            userService.getUserRole.mockResolvedValue(mockTargetUser);
            // Mock checkRole to always return false for regular user
            checkRole.mockImplementation((auth, role) => {
                return false; // Regular user has no access
            });

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to view user details'
            });
        });

        test('should handle service errors', async () => {
            userService.getUserRole.mockRejectedValue(new Error('Database error'));

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database error'
            });
        });

        test('should handle user not found from getUserByManager', async () => {
            req.auth = { role: 'manager' };
            const mockTargetUser = { id: 1, role: 'regular' };
            
            userService.getUserRole.mockResolvedValue(mockTargetUser);
            checkRole.mockImplementation((auth, role) => {
                return role === 'manager'; // Only manager returns true
            });
            userService.getUserByManager.mockRejectedValue(new Error('User not found'));

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User not found'
            });
        });
    });

    describe('updateUser', () => {
        beforeEach(() => {
            req.params = { userId: '1' };
            req.body = { verified: true };
        });

        test('should return 400 for invalid user ID', async () => {
            req.params.userId = 'invalid';

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid user ID'
            });
        });

        test('should return 400 for empty payload', async () => {
            req.body = {};

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No fields provided for update'
            });
        });

        test('should return 400 for invalid fields', async () => {
            req.body = { invalidField: 'value' };

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid fields: invalidField'
            });
        });

        test('should return 400 for invalid email type', async () => {
            req.body = { email: 123 };

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Email must be a string or null'
            });
        });

        test('should return 400 for invalid verified value', async () => {
            req.body = { verified: false };

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Verified must be true or "true"'
            });
        });

        test('should return 400 for invalid suspicious type', async () => {
            req.body = { suspicious: 'invalid' };

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Suspicious must be a boolean, string "true"/"false", or null'
            });
        });

        test('should return 400 for invalid role type', async () => {
            req.body = { role: 123 };

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Role must be a string or null'
            });
        });

        test('should update user successfully as superuser', async () => {
            req.auth = { role: 'superuser' };
            req.body = { role: 'manager', verified: true };
            
            // Mock checkRole to return true for superuser
            checkRole.mockImplementation((auth, role) => {
                return role === 'superuser';
            });
            
            const mockRoleUpdate = { id: 1, utorid: 'test', name: 'Test', role: 'manager' };
            const mockOtherUpdate = { id: 1, utorid: 'test', name: 'Test', verified: true };
            
            userService.updateUserRoleBySuperuser.mockResolvedValue(mockRoleUpdate);
            userService.updateUserByManager.mockResolvedValue(mockOtherUpdate);

            await userController.updateUser(req, res);

            expect(userService.updateUserRoleBySuperuser).toHaveBeenCalledWith(1, 'manager');
            expect(userService.updateUserByManager).toHaveBeenCalledWith(1, { verified: true });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should update user successfully as manager', async () => {
            req.auth = { role: 'manager' };
            req.body = { role: 'CASHIER', suspicious: 'false' };
            
            // Mock checkRole to return false for superuser, true for manager
            checkRole.mockImplementation((auth, role) => {
                if (role === 'superuser') return false;
                if (role === 'manager') return true;
                return false;
            });
            
            const mockUpdate = { id: 1, utorid: 'test', name: 'Test', role: 'cashier' };
            userService.updateUserByManager.mockResolvedValue(mockUpdate);

            await userController.updateUser(req, res);

            expect(userService.updateUserByManager).toHaveBeenCalledWith(1, { 
                role: 'cashier', 
                suspicious: false 
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdate);
        });

        test('should return 403 when manager tries invalid role', async () => {
            req.auth = { role: 'manager' };
            req.body = { role: 'superuser' };
            
            // Mock checkRole to return false for superuser, true for manager
            checkRole.mockImplementation((auth, role) => {
                if (role === 'superuser') return false;
                if (role === 'manager') return true;
                return false;
            });

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Managers can only set roles to cashier or regular'
            });
        });

        test('should return 403 when user lacks sufficient role', async () => {
            req.auth = { role: 'cashier' };
            
            // Mock checkRole to always return false
            checkRole.mockImplementation((auth, role) => {
                return false;
            });

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to update user'
            });
        });

        test('should handle service errors', async () => {
            req.auth = { role: 'manager' };
            
            // Mock checkRole to return false for superuser, true for manager
            checkRole.mockImplementation((auth, role) => {
                if (role === 'superuser') return false;
                if (role === 'manager') return true;
                return false;
            });
            userService.updateUserByManager.mockRejectedValue(new Error('Email already in use'));

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Email already in use'
            });
        });

        test('should convert string suspicious values correctly', async () => {
            req.auth = { role: 'manager' };
            req.body = { suspicious: 'true' };
            
            // Mock checkRole to return false for superuser, true for manager
            checkRole.mockImplementation((auth, role) => {
                if (role === 'superuser') return false;
                if (role === 'manager') return true;
                return false;
            });
            userService.updateUserByManager.mockResolvedValue({});

            await userController.updateUser(req, res);

            expect(userService.updateUserByManager).toHaveBeenCalledWith(1, { suspicious: true });
        });

        test('should handle null fields correctly', async () => {
            req.auth = { role: 'manager' };
            req.body = { email: null, verified: null };

            // Mock checkRole to return false for superuser, true for manager
            checkRole.mockImplementation((auth, role) => {
                if (role === 'superuser') return false;
                if (role === 'manager') return true;
                return false;
            });

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No valid fields provided for update'
            });
        });
    });

    describe('getCurrentUser', () => {
        test('should get current user successfully', async () => {
            const mockUser = {
                id: 1,
                name: 'Test User',
                verified: 1
            };
            userService.getCurrentUser.mockResolvedValue(mockUser);

            await userController.getCurrentUser(req, res);

            expect(userService.getCurrentUser).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                ...mockUser,
                verified: true
            });
        });

        test('should handle service errors', async () => {
            userService.getCurrentUser.mockRejectedValue(new Error('User not found'));

            await userController.getCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User not found'
            });
        });
    });

    describe('updateCurrentUser', () => {
        test('should return 400 when no fields provided', async () => {
            req.body = {};

            await userController.updateCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No fields provided for update'
            });
        });

        test('should return 400 for invalid fields', async () => {
            req.body = { invalidField: 'value' };

            await userController.updateCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid fields: invalidField'
            });
        });

        test('should return 400 for invalid field types', async () => {
            req.body = { name: 123 };

            await userController.updateCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Name must be a string'
            });
        });

        test('should update current user successfully', async () => {
            req.body = {
                name: 'Updated Name',
                email: 'updated@mail.utoronto.ca',
                birthday: '1990-01-01'
            };
            req.file = {
                filename: 'avatar.jpg'
            };

            const mockUpdatedUser = {
                id: 1,
                name: 'Updated Name',
                email: 'updated@mail.utoronto.ca'
            };
            userService.updateCurrentUser.mockResolvedValue(mockUpdatedUser);

            await userController.updateCurrentUser(req, res);

            expect(userService.updateCurrentUser).toHaveBeenCalledWith(
                1,
                req.body,
                'http://localhost:3000/uploads/avatars/avatar.jpg'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
        });

        test('should handle null fields correctly', async () => {
            req.body = { name: null, email: null };

            await userController.updateCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No valid fields provided for update'
            });
        });

        test('should handle service errors', async () => {
            req.body = { name: 'Test' };
            userService.updateCurrentUser.mockRejectedValue(new Error('Email already in use'));

            await userController.updateCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Email already in use'
            });
        });

        test('should handle unexpected errors', async () => {
            req.body = { name: 'Test' };
            
            userService.updateCurrentUser.mockRejectedValue(new Error('Unexpected error'));

            await userController.updateCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unexpected error'
            });
        });
    });

    describe('updatePassword', () => {
        beforeEach(() => {
            req.body = {
                old: 'oldPassword',
                new: 'newPassword123!'
            };
        });

        test('should update password successfully', async () => {
            userService.updatePassword.mockResolvedValue({ success: true });

            await userController.updatePassword(req, res);

            expect(userService.updatePassword).toHaveBeenCalledWith(1, 'oldPassword', 'newPassword123!');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Password updated successfully'
            });
        });

        test('should return 400 when old password missing', async () => {
            req.body.old = undefined;

            await userController.updatePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Both current and new passwords are required'
            });
        });

        test('should return 400 when new password missing', async () => {
            req.body.new = undefined;

            await userController.updatePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Both current and new passwords are required'
            });
        });

        test('should return 403 for incorrect current password', async () => {
            userService.updatePassword.mockRejectedValue(new Error('Current password is incorrect'));

            await userController.updatePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Current password is incorrect'
            });
        });

        test('should return 400 for other validation errors', async () => {
            userService.updatePassword.mockRejectedValue(new Error('Password too weak'));

            await userController.updatePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Password too weak'
            });
        });
    });

    describe('lookupUserByUtorid', () => {
        beforeEach(() => {
            req.params = { utorid: 'testuser1' };
            req.auth = { role: 'cashier' };
        });

        test('should lookup user successfully', async () => {
            checkRole.mockReturnValue(true);
            userService.getUserIdByUtorid.mockResolvedValue(1);
            const mockUser = { id: 1, name: 'Test User', points: 100 };
            userService.getUserByCashier.mockResolvedValue(mockUser);

            await userController.lookupUserByUtorid(req, res);

            expect(checkRole).toHaveBeenCalledWith(req.auth, 'cashier');
            expect(userService.getUserIdByUtorid).toHaveBeenCalledWith('testuser1');
            expect(userService.getUserByCashier).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        test('should return 403 when user lacks cashier role', async () => {
            checkRole.mockReturnValue(false);

            await userController.lookupUserByUtorid(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to lookup users'
            });
        });

        test('should return 400 when utorid missing', async () => {
            req.params.utorid = undefined;
            checkRole.mockReturnValue(true);

            await userController.lookupUserByUtorid(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'UTORid is required'
            });
        });

        test('should return 404 when user not found', async () => {
            checkRole.mockReturnValue(true);
            userService.getUserIdByUtorid.mockRejectedValue(new Error('User not found'));

            await userController.lookupUserByUtorid(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User not found'
            });
        });

        test('should handle service errors', async () => {
            checkRole.mockReturnValue(true);
            userService.getUserIdByUtorid.mockRejectedValue(new Error('Database error'));

            await userController.lookupUserByUtorid(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database error'
            });
        });
    });
}); 
/**
 * Core User Flow: User management business logic
 * Validates user profile management, user creation, and user listing workflows
 */

import api from '../../services/api';
import UserService from '../../services/user.service';

jest.mock('../../services/api');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Management', () => {
    const mockProfile = {
      id: 1,
      utorid: 'testuser',
      name: 'Test User',
      email: 'test@mail.utoronto.ca',
      birthday: '1990-01-01',
      avatar: 'avatar.jpg'
    };

    describe('getProfile', () => {
      test('successfully fetches user profile', async () => {
        api.get.mockResolvedValue({ data: mockProfile });
        const result = await UserService.getProfile();
        expect(api.get).toHaveBeenCalledWith('/users/me');
        expect(result).toEqual(mockProfile);
      });

      test('handles session expiration', async () => {
        api.get.mockRejectedValue({
          response: {
            status: 401,
            data: { message: 'Session expired' }
          }
        });
        await expect(UserService.getProfile())
          .rejects.toThrow('Your session has expired. Please log in again.');
      });

      test('handles network errors', async () => {
        api.get.mockRejectedValue(new Error('Network error'));
        await expect(UserService.getProfile())
          .rejects.toThrow('Network error: Could not connect to server');
      });

      test('handles generic error response', async () => {
        api.get.mockRejectedValue({
          response: {
            status: 500,
            data: { message: 'Server error' }
          }
        });
        await expect(UserService.getProfile())
          .rejects.toThrow('Server error');
      });
    });

    describe('updateProfile', () => {
      const updateData = {
        name: 'Updated Name',
        email: 'new@mail.utoronto.ca',
        birthday: '1990-02-02',
        avatar: new File([''], 'test.jpg', { type: 'image/jpeg' })
      };

      test('successfully updates profile with all fields', async () => {
        api.patch.mockResolvedValue({ 
          data: { ...mockProfile, ...updateData, avatar: 'new-avatar.jpg' }
        });
        
        const result = await UserService.updateProfile(updateData);
        
        expect(api.patch).toHaveBeenCalledWith(
          '/users/me',
          expect.any(FormData),
          expect.objectContaining({
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        );
        
        // Verify FormData content
        const formData = api.patch.mock.calls[0][1];
        expect(formData.get('name')).toBe(updateData.name);
        expect(formData.get('email')).toBe(updateData.email);
        expect(formData.get('birthday')).toBe(updateData.birthday);
        expect(formData.get('avatar')).toEqual(updateData.avatar);
      });

      test('handles partial updates', async () => {
        const partialData = { name: 'Updated Name' };
        api.patch.mockResolvedValue({ 
          data: { ...mockProfile, ...partialData }
        });
        
        await UserService.updateProfile(partialData);
        
        const formData = api.patch.mock.calls[0][1];
        expect(formData.get('name')).toBe(partialData.name);
        expect(formData.get('email')).toBeNull();
        expect(formData.get('birthday')).toBeNull();
        expect(formData.get('avatar')).toBeNull();
      });

      test('handles validation errors', async () => {
        const testCases = [
          {
            error: { message: 'Invalid email format' },
            expectedMessage: 'Invalid email format'
          },
          {
            error: { message: 'Name is required' },
            expectedMessage: 'Name is required'
          },
          {
            error: { message: 'Invalid birthday format' },
            expectedMessage: 'Invalid date format for birthday.'
          },
          {
            error: { message: 'Invalid avatar format' },
            expectedMessage: 'Invalid avatar file. Please upload a valid image file (JPG, PNG, or GIF).'
          }
        ];

        for (const testCase of testCases) {
          api.patch.mockRejectedValueOnce({
            response: {
              status: 400,
              data: testCase.error
            }
          });

          await expect(UserService.updateProfile(updateData))
            .rejects.toThrow(testCase.expectedMessage);
        }
      });

      test('handles file size limit', async () => {
        api.patch.mockRejectedValue({
          response: {
            status: 413,
            data: { message: 'File too large' }
          }
        });
        
        await expect(UserService.updateProfile(updateData))
          .rejects.toThrow('Avatar file is too large. Please upload a smaller image (max 50MB).');
      });
    });

    describe('updateAvatar', () => {
      const avatarFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      test('successfully updates avatar', async () => {
        api.patch.mockResolvedValue({ 
          data: { ...mockProfile, avatar: 'new-avatar.jpg' }
        });
        
        const result = await UserService.updateAvatar(avatarFile);
        
        expect(api.patch).toHaveBeenCalledWith(
          '/users/me',
          expect.any(FormData),
          expect.objectContaining({
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        );
        
        const formData = api.patch.mock.calls[0][1];
        expect(formData.get('avatar')).toEqual(avatarFile);
      });

      test('handles invalid file format', async () => {
        api.patch.mockRejectedValue({
          response: {
            status: 400,
            data: { message: 'Invalid file format' }
          }
        });
        
        await expect(UserService.updateAvatar(avatarFile))
          .rejects.toThrow('Invalid file format');
      });

      test('handles file size limit', async () => {
        api.patch.mockRejectedValue({
          response: {
            status: 413,
            data: { message: 'File too large' }
          }
        });
        
        await expect(UserService.updateAvatar(avatarFile))
          .rejects.toThrow('Avatar file is too large. Please upload a smaller image (max 50MB).');
      });
    });
  });

  describe('User Management', () => {
    const mockUser = {
      id: 2,
      utorid: 'newuser',
      name: 'New User',
      email: 'new@mail.utoronto.ca',
      role: 'regular'
    };

    describe('getUser', () => {
      test('successfully fetches user by ID', async () => {
        api.get.mockResolvedValue({ data: mockUser });
        const result = await UserService.getUser(2);
        expect(api.get).toHaveBeenCalledWith('/users/2');
        expect(result).toEqual(mockUser);
      });

      test('handles user not found', async () => {
        api.get.mockRejectedValue({
          response: {
            status: 404,
            data: { message: 'User not found' }
          }
        });
        
        await expect(UserService.getUser(999))
          .rejects.toThrow('User not found. The user may have been deleted or deactivated.');
      });

      test('handles permission error', async () => {
        api.get.mockRejectedValue({
          response: {
            status: 403,
            data: { message: 'Permission denied' }
          }
        });
        
        await expect(UserService.getUser(2))
          .rejects.toThrow('You do not have permission to view this user\'s details.');
      });
    });

    describe('getUsers', () => {
      const mockUsersList = {
        count: 2,
        results: [
          mockUser,
          { id: 3, utorid: 'user3', name: 'User 3', role: 'regular' }
        ]
      };

      test('successfully fetches users list with params', async () => {
        api.get.mockResolvedValue({ data: mockUsersList });
        
        const params = { 
          page: 1, 
          limit: 10, 
          role: 'regular',
          verified: true,
          suspicious: false,
          search: 'test'
        };
        
        const result = await UserService.getUsers(params);
        
        expect(api.get).toHaveBeenCalledWith('/users', {
          params,
          paramsSerializer: expect.any(Object)
        });
        
        // Test params serialization
        const serializer = api.get.mock.calls[0][1].paramsSerializer;
        const serializedParams = serializer.serialize(params);
        expect(serializedParams).toContain('page=1');
        expect(serializedParams).toContain('limit=10');
        expect(serializedParams).toContain('role=regular');
        expect(serializedParams).toContain('verified=true');
        expect(serializedParams).toContain('suspicious=false');
        expect(serializedParams).toContain('search=test');
        
        expect(result).toEqual(mockUsersList);
      });

      test('handles empty params', async () => {
        api.get.mockResolvedValue({ data: mockUsersList });
        await UserService.getUsers();
        expect(api.get).toHaveBeenCalledWith('/users', {
          params: {},
          paramsSerializer: expect.any(Object)
        });
      });

      test('handles invalid params', async () => {
        api.get.mockRejectedValue({
          response: {
            status: 400,
            data: { message: 'Invalid parameters' }
          }
        });
        
        await expect(UserService.getUsers({ invalid: true }))
          .rejects.toThrow('Invalid parameters');
      });

      test('handles permission error', async () => {
        api.get.mockRejectedValue({
          response: {
            status: 403,
            data: { message: 'Permission denied' }
          }
        });
        
        await expect(UserService.getUsers())
          .rejects.toThrow('You do not have permission to view the user list.');
      });
    });

    describe('createUser', () => {
      const newUserData = {
        utorid: 'newuser',
        name: 'New User',
        email: 'new@mail.utoronto.ca'
      };

      test('successfully creates new user', async () => {
        api.post.mockResolvedValue({ 
          data: { id: 2, ...newUserData, role: 'regular' }
        });
        
        const result = await UserService.createUser(newUserData);
        
        expect(api.post).toHaveBeenCalledWith('/users', newUserData);
        expect(result).toEqual(expect.objectContaining(newUserData));
      });

      test('handles validation errors', async () => {
        const testCases = [
          {
            error: { message: 'Invalid utorid' },
            expectedMessage: 'Invalid or duplicate UTORid. Each user must have a unique UTORid.'
          },
          {
            error: { message: 'Invalid email' },
            expectedMessage: 'Invalid email format. Please enter a valid email address.'
          },
          {
            error: { message: 'Name is required' },
            expectedMessage: 'Name is required'
          }
        ];

        for (const testCase of testCases) {
          api.post.mockRejectedValueOnce({
            response: {
              status: 400,
              data: testCase.error
            }
          });

          await expect(UserService.createUser(newUserData))
            .rejects.toThrow(testCase.expectedMessage);
        }
      });

      test('handles duplicate UTORid', async () => {
        api.post.mockRejectedValue({
          response: {
            status: 409,
            data: { message: 'UTORid already exists' }
          }
        });
        
        await expect(UserService.createUser(newUserData))
          .rejects.toThrow('A user with this UTORid already exists.');
      });

      test('handles permission error', async () => {
        api.post.mockRejectedValue({
          response: {
            status: 403,
            data: { message: 'Permission denied' }
          }
        });
        
        await expect(UserService.createUser(newUserData))
          .rejects.toThrow('You do not have permission to create new users.');
      });
    });

    describe('updateUser', () => {
      const updateData = {
        email: 'updated@mail.utoronto.ca',
        role: 'cashier',
        verified: true
      };

      test('successfully updates user', async () => {
        api.patch.mockResolvedValue({ 
          data: { ...mockUser, ...updateData }
        });
        
        const result = await UserService.updateUser(2, updateData);
        
        expect(api.patch).toHaveBeenCalledWith('/users/2', updateData);
        expect(result).toEqual(expect.objectContaining(updateData));
      });

      test('handles validation errors', async () => {
        api.patch.mockRejectedValue({
          response: {
            status: 400,
            data: { message: 'Invalid role' }
          }
        });
        
        await expect(UserService.updateUser(2, { role: 'invalid' }))
          .rejects.toThrow('Invalid role. Please select a valid role for the user.');
      });

      test('handles user not found', async () => {
        api.patch.mockRejectedValue({
          response: {
            status: 404,
            data: { message: 'User not found' }
          }
        });
        
        await expect(UserService.updateUser(999, updateData))
          .rejects.toThrow('User not found. The user may have been deleted.');
      });

      test('handles permission error', async () => {
        api.patch.mockRejectedValue({
          response: {
            status: 403,
            data: { message: 'Permission denied' }
          }
        });
        
        await expect(UserService.updateUser(2, updateData))
          .rejects.toThrow('You do not have permission to update this user.');
      });
    });
  });

  describe('Network Error Handling', () => {
    const networkError = new Error('Network error');

    test('handles network errors for all operations', async () => {
      api.get.mockRejectedValue(networkError);
      await expect(UserService.getProfile())
        .rejects.toThrow('Network error: Could not connect to server');
      await expect(UserService.getUser(1))
        .rejects.toThrow('Network error: Could not connect to server');
      await expect(UserService.getUsers())
        .rejects.toThrow('Network error: Could not retrieve users. Please check your connection.');

      api.post.mockRejectedValue(networkError);
      await expect(UserService.createUser({}))
        .rejects.toThrow('Network error: Could not connect to server');

      api.patch.mockRejectedValue(networkError);
      await expect(UserService.updateProfile({}))
        .rejects.toThrow('Network error: Could not connect to server');
      await expect(UserService.updateAvatar(new File([''], 'test.jpg')))
        .rejects.toThrow('Network error: Could not upload avatar. Please check your connection.');
      await expect(UserService.updateUser(1, {}))
        .rejects.toThrow('Network error: Could not connect to server');
    });
  });
}); 
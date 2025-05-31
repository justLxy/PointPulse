/**
 * Core User Flow: User management business logic
 * Validates user profile management, user creation, and user listing workflows
 */

import api from '../../services/api';
import UserService from '../../services/user.service';

jest.mock('../../services/api');

describe('UserService - User Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('profile management: get → update → avatar', async () => {
    // Test get profile
    const mockProfileResponse = {
      data: {
        id: 1,
        utorid: 'testuser',
        name: 'Test User',
        email: 'test@mail.utoronto.ca',
        birthday: '1990-01-01',
        avatar: 'avatar.jpg'
      }
    };
    api.get.mockResolvedValue(mockProfileResponse);
    const profileResult = await UserService.getProfile();
    expect(api.get).toHaveBeenCalledWith('/users/me');
    expect(profileResult).toEqual(mockProfileResponse.data);

    // Test profile update
    const updateData = {
      name: 'Updated Name',
      email: 'new@mail.utoronto.ca',
      birthday: '1990-02-02'
    };
    const mockUpdateResponse = {
      data: {
        ...mockProfileResponse.data,
        ...updateData
      }
    };
    api.patch.mockResolvedValue(mockUpdateResponse);
    const updateResult = await UserService.updateProfile(updateData);
    expect(api.patch).toHaveBeenCalledWith('/users/me', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    expect(updateResult).toEqual(mockUpdateResponse.data);

    // Test avatar update
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockAvatarResponse = {
      data: {
        ...mockProfileResponse.data,
        avatar: 'new-avatar.jpg'
      }
    };
    api.patch.mockResolvedValue(mockAvatarResponse);
    const avatarResult = await UserService.updateAvatar(mockFile);
    expect(api.patch).toHaveBeenCalledWith('/users/me', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    expect(avatarResult).toEqual(mockAvatarResponse.data);
  });

  test('user management: create → get → list', async () => {
    // Test user creation
    const newUserData = {
      utorid: 'newuser',
      name: 'New User',
      email: 'new@mail.utoronto.ca'
    };
    const mockCreateResponse = {
      data: {
        id: 2,
        ...newUserData,
        role: 'regular'
      }
    };
    api.post.mockResolvedValue(mockCreateResponse);
    const createResult = await UserService.createUser(newUserData);
    expect(api.post).toHaveBeenCalledWith('/users', newUserData);
    expect(createResult).toEqual(mockCreateResponse.data);

    // Test get single user
    const mockUserResponse = {
      data: mockCreateResponse.data
    };
    api.get.mockResolvedValue(mockUserResponse);
    const getResult = await UserService.getUser(2);
    expect(api.get).toHaveBeenCalledWith('/users/2');
    expect(getResult).toEqual(mockUserResponse.data);

    // Test user listing
    const mockUsersResponse = {
      data: {
        count: 2,
        results: [
          mockCreateResponse.data,
          { id: 3, utorid: 'user3', name: 'User 3', role: 'regular' }
        ]
      }
    };
    api.get.mockResolvedValue(mockUsersResponse);
    const params = { page: 1, limit: 10, role: 'regular' };
    const listResult = await UserService.getUsers(params);
    expect(api.get).toHaveBeenCalledWith('/users', {
      params,
      paramsSerializer: expect.any(Object)
    });
    expect(listResult).toEqual(mockUsersResponse.data);
  });

  test('error handling and validation', async () => {
    // Test profile update validation errors
    api.patch.mockRejectedValue({
      response: {
        status: 400,
        data: { message: 'Invalid email format' }
      }
    });
    await expect(UserService.updateProfile({ email: 'invalid' }))
      .rejects.toThrow('Invalid email format');

    // Test avatar size limit
    api.patch.mockRejectedValue({
      response: {
        status: 413,
        data: { message: 'File too large' }
      }
    });
    await expect(UserService.updateAvatar(new File([''], 'large.jpg')))
      .rejects.toThrow('Avatar file is too large');

    // Test user not found
    api.get.mockRejectedValue({
      response: {
        status: 404,
        data: { message: 'User not found' }
      }
    });
    await expect(UserService.getUser(999))
      .rejects.toThrow('User not found');

    // Test permission errors
    api.get.mockRejectedValue({
      response: {
        status: 403,
        data: { message: 'Permission denied' }
      }
    });
    await expect(UserService.getUsers())
      .rejects.toThrow('You do not have permission to view the user list');
  });

  test('handles network errors across all operations', async () => {
    const networkError = new Error('Network error');
    
    // Test network error handling for each operation
    api.get.mockRejectedValue(networkError);
    await expect(UserService.getProfile())
      .rejects.toThrow('Network error: Could not connect to server');

    await expect(UserService.getUsers())
      .rejects.toThrow('Network error: Could not retrieve users');

    api.patch.mockRejectedValue(networkError);
    await expect(UserService.updateProfile({}))
      .rejects.toThrow('Network error: Could not connect to server');

    await expect(UserService.updateAvatar(new File([''], 'test.jpg')))
      .rejects.toThrow('Network error: Could not upload avatar');
  });
}); 
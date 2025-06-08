/**
 * 场景：用户上传头像文件时进行文件类型和大小验证
 * 预期：1) 超过50MB显示错误消息；2) 非图片文件显示错误消息；3) 有效文件正常上传
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Profile from '../../../pages/users/Profile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useUserProfile from '../../../hooks/useUserProfile';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('../../../hooks/useUserProfile');
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      utorid: 'testuser',
      name: 'Test User',
      email: 'test@mail.utoronto.ca',
      points: 100,
      verified: true,
      avatarUrl: null,
    },
    activeRole: 'regular',
  }),
}));
jest.mock('../../../components/common/QRCode', () => {
  return function QRCode() {
    return <div data-testid="qr-code">QR Code Component</div>;
  };
});
jest.mock('../../../components/common/UniversalQRCode', () => {
  return function UniversalQRCode() {
    return <div data-testid="universal-qr-code">Universal QR Code Component</div>;
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Profile Avatar Upload', () => {
  const mockUserProfile = {
    data: {
      id: 1,
      utorid: 'testuser',
      name: 'Test User',
      email: 'test@mail.utoronto.ca',
      birthday: '2000-01-01',
      role: 'regular',
      points: 100,
      verified: true,
      avatarUrl: null,
    },
    isLoading: false,
    error: null,
  };

  const mockUpdateAvatar = jest.fn();
  const mockUpdateProfile = jest.fn();
  const mockUpdatePassword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUserProfile.mockReturnValue({
      ...mockUserProfile,
      updateAvatar: mockUpdateAvatar,
      updateProfile: mockUpdateProfile,
      updatePassword: mockUpdatePassword,
      isUpdatingAvatar: false,
      isUpdatingProfile: false,
      isUpdatingPassword: false,
    });
  });

  // Helper function to create a large file
  const createLargeFile = (sizeInMB, type = 'image/jpeg') => {
    const sizeInBytes = sizeInMB * 1024 * 1024;
    const buffer = new ArrayBuffer(sizeInBytes);
    return new File([buffer], 'large-image.jpg', { type });
  };

  it('should show error for files larger than 50MB', async () => {
    render(<Profile />, { wrapper: createWrapper() });

    // Create a 51MB file
    const largeFile = createLargeFile(51);
    
    // Find the hidden file input for avatar
    const fileInput = screen.getByTestId('avatar-input');
    
    expect(fileInput).toBeInTheDocument();

    // Upload the large file
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    // Verify error toast was called
    expect(toast.error).toHaveBeenCalledWith('File size must be less than 50MB');
    
    // Verify updateAvatar was not called
    expect(mockUpdateAvatar).not.toHaveBeenCalled();
  });

  it('should show error for non-image files', async () => {
    render(<Profile />, { wrapper: createWrapper() });

    // Create a non-image file
    const textFile = new File(['hello'], 'test.txt', { type: 'text/plain' });
    
    // Find the hidden file input for avatar
    const fileInput = screen.getByTestId('avatar-input');
    
    expect(fileInput).toBeInTheDocument();

    // Upload the text file
    fireEvent.change(fileInput, { target: { files: [textFile] } });

    // Verify error toast was called
    expect(toast.error).toHaveBeenCalledWith('Please select an image file');
    
    // Verify updateAvatar was not called
    expect(mockUpdateAvatar).not.toHaveBeenCalled();
  });

  it('should upload valid image file successfully', async () => {
    render(<Profile />, { wrapper: createWrapper() });

    // Create a valid image file (10MB)
    const validFile = createLargeFile(10, 'image/jpeg');
    
    // Find the hidden file input for avatar
    const fileInput = screen.getByTestId('avatar-input');
    
    expect(fileInput).toBeInTheDocument();

    // Upload the valid file
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Wait for the upload to be triggered
    await waitFor(() => {
      expect(mockUpdateAvatar).toHaveBeenCalledWith(validFile, expect.any(Object));
    });
    
    // Verify no error toast was called
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should handle exactly 50MB file successfully', async () => {
    render(<Profile />, { wrapper: createWrapper() });

    // Create a 50MB file (at the limit)
    const limitFile = createLargeFile(50, 'image/png');
    
    // Find the hidden file input for avatar
    const fileInput = screen.getByTestId('avatar-input');
    
    expect(fileInput).toBeInTheDocument();

    // Upload the file at limit
    fireEvent.change(fileInput, { target: { files: [limitFile] } });

    // Wait for the upload to be triggered
    await waitFor(() => {
      expect(mockUpdateAvatar).toHaveBeenCalledWith(limitFile, expect.any(Object));
    });
    
    // Verify no error toast was called
    expect(toast.error).not.toHaveBeenCalled();
  });
}); 
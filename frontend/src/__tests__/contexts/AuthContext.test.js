/**
 * Core User Flow: Authentication lifecycle and state management
 * Tests AuthContext provider rendering and basic functionality
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import AuthService from '../../services/auth.service';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('../../services/auth.service');
jest.mock('react-hot-toast');

// Test component that exposes auth context functionality
const TestComponent = () => {
  const auth = useAuth();
  
  return (
    <div data-testid="test-component">
      <div data-testid="auth-status">
        {auth.isAuthenticated ? 'authenticated' : 'not authenticated'}
      </div>
      <div data-testid="user-role">{auth.activeRole || 'no role'}</div>
      <button 
        onClick={() => auth.login('testuser', 'password')}
        data-testid="login-button"
      >
        Login
      </button>
      <button 
        onClick={() => auth.logout()}
        data-testid="logout-button"
      >
        Logout
      </button>
      <button 
        onClick={() => auth.switchRole('manager')}
        data-testid="switch-role-button"
      >
        Switch Role
      </button>
      <button 
        onClick={() => auth.updateCurrentUser({ name: 'Updated Name' })}
        data-testid="update-user-button"
      >
        Update User
      </button>
      <button 
        onClick={() => auth.requestPasswordReset('testuser')}
        data-testid="request-reset-button"
      >
        Request Reset
      </button>
      <button 
        onClick={() => auth.resetPassword('token', 'testuser', 'newpassword')}
        data-testid="reset-password-button"
      >
        Reset Password
      </button>
      <button 
        onClick={() => auth.updatePassword('oldpass', 'newpass')}
        data-testid="update-password-button"
      >
        Update Password
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser = {
    id: 1,
    utorid: 'testuser',
    role: 'manager',
    name: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Default mock implementations
    AuthService.isAuthenticated.mockReturnValue(false);
    AuthService.getCurrentUser.mockResolvedValue(null);
    AuthService.login.mockResolvedValue({ token: 'fake-token' });
    toast.error.mockImplementation(() => {});
    toast.success.mockImplementation(() => {});
  });

  describe('Initial Setup and Loading', () => {
    test('shows loading screen initially', () => {
      AuthService.isAuthenticated.mockReturnValue(true);
      AuthService.getCurrentUser.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByText(/loading your session/i)).toBeInTheDocument();
    });

    test('initializes with saved authentication state', async () => {
      AuthService.isAuthenticated.mockReturnValue(true);
      AuthService.getCurrentUser.mockResolvedValue(mockUser);
      localStorage.setItem('activeRole', 'manager');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-role')).toHaveTextContent('manager');
      });
    });

    test('handles initialization errors gracefully', async () => {
      AuthService.getCurrentUser.mockRejectedValue(new Error('API Error'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
      });
    });
  });

  describe('Authentication Operations', () => {
    test('handles successful login', async () => {
      AuthService.login.mockResolvedValue({ token: 'fake-token' });
      AuthService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('login-button'));
      await act(async () => {
        userEvent.click(screen.getByTestId('login-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-role')).toHaveTextContent('manager');
      });
    });

    test('handles login errors with specific messages', async () => {
      const mockError = {
        response: { status: 401 },
        request: {}
      };
      AuthService.login.mockRejectedValue(mockError);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('login-button'));
      await act(async () => {
        userEvent.click(screen.getByTestId('login-button'));
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Incorrect UTORid or password. Please verify your credentials.'
      );
    });

    test('handles network errors during login', async () => {
      const mockError = { request: {} };
      AuthService.login.mockRejectedValue(mockError);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('login-button'));
      await act(async () => {
        userEvent.click(screen.getByTestId('login-button'));
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Network error. Please check your internet connection and try again.'
      );
    });

    test('handles logout', async () => {
      AuthService.isAuthenticated.mockReturnValue(true);
      AuthService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('logout-button'));
      userEvent.click(screen.getByTestId('logout-button'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
        expect(screen.getByTestId('user-role')).toHaveTextContent('no role');
        expect(localStorage.getItem('activeRole')).toBeNull();
      });
    });
  });

  describe('Role Management', () => {
    test('allows valid role switches', async () => {
      AuthService.isAuthenticated.mockReturnValue(true);
      AuthService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('switch-role-button'));
      userEvent.click(screen.getByTestId('switch-role-button'));

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('manager');
        expect(localStorage.getItem('activeRole')).toBe('manager');
      });
    });

    test('prevents invalid role switches', async () => {
      AuthService.isAuthenticated.mockReturnValue(true);
      AuthService.getCurrentUser.mockResolvedValue({ ...mockUser, role: 'regular' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('switch-role-button'));
      userEvent.click(screen.getByTestId('switch-role-button'));

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('regular');
      });
    });
  });

  describe('User Management', () => {
    test('updates user information', async () => {
      AuthService.isAuthenticated.mockReturnValue(true);
      AuthService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('update-user-button'));
      userEvent.click(screen.getByTestId('update-user-button'));

      const storedUser = JSON.parse(localStorage.getItem('user'));
      expect(storedUser.name).toBe('Updated Name');
    });

    test('handles localStorage errors during user update', async () => {
      AuthService.isAuthenticated.mockReturnValue(true);
      AuthService.getCurrentUser.mockResolvedValue(mockUser);

      // Mock localStorage.setItem to throw an error
      const mockError = new Error('Storage full');
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw mockError;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('update-user-button'));
      expect(() => userEvent.click(screen.getByTestId('update-user-button'))).not.toThrow();
    });
  });

  describe('Password Management', () => {
    test('handles password reset request', async () => {
      AuthService.requestPasswordReset.mockResolvedValue({ message: 'Reset email sent' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('request-reset-button'));
      await act(async () => {
        userEvent.click(screen.getByTestId('request-reset-button'));
      });

      expect(AuthService.requestPasswordReset).toHaveBeenCalledWith('testuser');
    });

    test('handles password reset', async () => {
      AuthService.resetPassword.mockResolvedValue({ message: 'Password reset successful' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('reset-password-button'));
      await act(async () => {
        userEvent.click(screen.getByTestId('reset-password-button'));
      });

      expect(AuthService.resetPassword).toHaveBeenCalledWith('token', 'testuser', 'newpassword');
      expect(toast.success).toHaveBeenCalledWith('Account activated successfully!');
    });

    test('handles password update', async () => {
      AuthService.updatePassword.mockResolvedValue({ message: 'Password updated' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('update-password-button'));
      await act(async () => {
        userEvent.click(screen.getByTestId('update-password-button'));
      });

      expect(AuthService.updatePassword).toHaveBeenCalledWith('oldpass', 'newpass');
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully');
    });

    test('handles password operation errors', async () => {
      const mockError = new Error('Failed to update password');
      AuthService.updatePassword.mockRejectedValue(mockError);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => screen.getByTestId('update-password-button'));
      await act(async () => {
        userEvent.click(screen.getByTestId('update-password-button'));
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to update password');
    });
  });

  describe('Authentication Status Check', () => {
    test('periodically checks authentication status', async () => {
      jest.useFakeTimers();
      AuthService.isAuthenticated.mockReturnValue(true);
      AuthService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // Simulate token expiration
      AuthService.isAuthenticated.mockReturnValue(false);
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
      });

      jest.useRealTimers();
    });

    test('checks authentication on window focus', async () => {
      AuthService.isAuthenticated.mockReturnValue(true);
      AuthService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // Simulate token expiration
      AuthService.isAuthenticated.mockReturnValue(false);
      
      act(() => {
        window.dispatchEvent(new Event('focus'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
      });
    });
  });
}); 
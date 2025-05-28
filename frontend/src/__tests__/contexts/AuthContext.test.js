/**
 * AuthContext Tests
 * Purpose: Test authentication context state management, login/logout flows,
 * role switching functionality, and session persistence
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import AuthService from '../../services/auth.service';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('../../services/auth.service');
jest.mock('react-hot-toast');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

// Override global localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Test component to access auth context
const TestComponent = () => {
  const { 
    currentUser, 
    isAuthenticated, 
    loading, 
    activeRole, 
    login, 
    logout, 
    switchRole 
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{currentUser ? currentUser.utorid : 'no-user'}</div>
      <div data-testid="role">{activeRole || 'no-role'}</div>
      <button onClick={() => login('testuser', 'password123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => switchRole('manager')}>Switch Role</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    AuthService.isAuthenticated.mockReturnValue(false);
  });

  test('should initialize with unauthenticated state', async () => {
    AuthService.isAuthenticated.mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for component to finish loading
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('role')).toHaveTextContent('no-role');
  });

  test('should handle successful login', async () => {
    const mockUser = { id: 1, utorid: 'testuser', role: 'cashier', verified: true };
    
    AuthService.login.mockResolvedValue({ token: 'mock.token' });
    AuthService.getCurrentUser.mockResolvedValue(mockUser);
    AuthService.isAuthenticated.mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Perform login
    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('role')).toHaveTextContent('cashier');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('activeRole', 'cashier');
  });

  test('should handle logout', async () => {
    // Start with authenticated state
    const mockUser = { id: 1, utorid: 'testuser', role: 'regular' };
    AuthService.isAuthenticated.mockReturnValue(true);
    AuthService.getCurrentUser.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });

    // Perform logout
    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(AuthService.logout).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('role')).toHaveTextContent('no-role');
  });

  test('should handle role switching', async () => {
    const mockUser = { id: 1, utorid: 'testuser', role: 'manager' };
    AuthService.isAuthenticated.mockReturnValue(true);
    AuthService.getCurrentUser.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });

    // Switch role
    await act(async () => {
      screen.getByText('Switch Role').click();
    });

    expect(screen.getByTestId('role')).toHaveTextContent('manager');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('activeRole', 'manager');
  });
}); 
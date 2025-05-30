/**
 * Core User Flow: Authentication lifecycle and state management
 * Tests AuthContext provider rendering and basic functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import AuthService from '../../services/auth.service';

jest.mock('../../services/auth.service');

const TestComponent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div data-testid="test-component">
      {isAuthenticated ? 'authenticated' : 'not authenticated'}
    </div>
  );
};

describe('AuthContext - Core Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    AuthService.isAuthenticated.mockReturnValue(false);
    AuthService.getCurrentUser.mockReturnValue(null);
  });

  test('provides authentication context and basic state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should render something (either loading state or auth content)
    expect(screen.getByTestId('test-component') || screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('handles authentication service calls', () => {
    AuthService.isAuthenticated.mockReturnValue(true);
    AuthService.getCurrentUser.mockReturnValue({ id: 1, utorid: 'testuser' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should call authentication service methods
    expect(AuthService.isAuthenticated).toHaveBeenCalled();
  });

  test('handles initialization without errors', () => {
    expect(() => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    }).not.toThrow();
  });
}); 
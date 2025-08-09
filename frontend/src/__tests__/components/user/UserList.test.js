/**
 * Core User Flow: User management and listing functionality
 * Validates user display, role-based permissions, and management actions
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserList from '../../../components/user/UserList';

jest.mock('react-icons/fa', () => ({
  FaEye: () => <span data-testid="eye-icon">👁</span>,
  FaUserEdit: () => <span data-testid="edit-icon">✏️</span>,
  FaExclamationTriangle: () => <span data-testid="warning-icon">⚠️</span>,
  FaInfoCircle: () => <span data-testid="info-icon">ℹ️</span>,
}));

describe('UserList - User Management Interface', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', utorid: 'john123', email: 'john@example.com', role: 'cashier', suspicious: false },
    { id: 2, name: 'Jane Smith', utorid: 'jane456', email: 'jane@example.com', role: 'manager', suspicious: true },
    { id: 3, name: 'Admin User', utorid: 'admin', email: 'admin@example.com', role: 'superuser', suspicious: false }
  ];

  const defaultProps = {
    users: mockUsers,
    totalCount: 3,
    isLoading: false,
    isSuperuser: false,
    isManager: false,
    filters: { page: 1, limit: 10, search: '', role: '', verified: '', active: '' },
    onFilterChange: jest.fn(),
    onViewUser: jest.fn(),
    onEditUser: jest.fn(),
    renderUserBadges: jest.fn().mockImplementation((user) => (
      <span data-testid={`user-badges-${user.id}`}>Status: {user.name}</span>
    )),
    onToggleSuspicious: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays user data and handles loading states', async () => {
    const { rerender } = render(<UserList {...defaultProps} isLoading={true} />);
    
    // Loading state - check for skeleton elements instead of loading text
    const skeletonElements = document.querySelectorAll('div[style*="background-color: rgb(224, 224, 224)"]');
    expect(skeletonElements.length).toBeGreaterThan(0);
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

    // Data loaded state
    rerender(<UserList {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane456')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Cashier')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Superuser')).toBeInTheDocument();
  });

  test('user interaction workflows: view and management actions', async () => {
    render(<UserList {...defaultProps} isManager={true} />);

    // View user action
    const viewButtons = screen.getAllByTestId('eye-icon');
    fireEvent.click(viewButtons[0].closest('button'));
    expect(defaultProps.onViewUser).toHaveBeenCalledWith(mockUsers[0]);

    // Suspicious user management (manager can manage cashiers)
    const suspiciousButtons = screen.getAllByTestId('warning-icon');
    expect(suspiciousButtons).toHaveLength(1); // Only for cashier
    
    fireEvent.click(suspiciousButtons[0].closest('button'));
    expect(defaultProps.onToggleSuspicious).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('role-based permission system controls user actions', () => {
    const { rerender } = render(<UserList {...defaultProps} />);
    
    // Regular user - no management actions
    expect(screen.queryByTestId('warning-icon')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('eye-icon')).toHaveLength(3); // Can view all

    // Manager - can manage cashiers
    rerender(<UserList {...defaultProps} isManager={true} />);
    expect(screen.getAllByTestId('warning-icon')).toHaveLength(1); // Can manage 1 cashier

    // Superuser - can manage all roles
    rerender(<UserList {...defaultProps} isSuperuser={true} />);
    expect(screen.getAllByTestId('warning-icon')).toHaveLength(1); // Still 1 cashier to manage
  });

  test('handles edge cases and user badge rendering', () => {
    const usersWithEdgeCases = [
      { id: 1, name: 'Unknown User', utorid: 'unknown', email: 'unknown@example.com', role: 'unknown_role', suspicious: false }
    ];
    
    render(<UserList {...defaultProps} users={usersWithEdgeCases} totalCount={1} />);
    
    // Unknown role handling
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    
    // User badges rendering
    expect(defaultProps.renderUserBadges).toHaveBeenCalledWith(usersWithEdgeCases[0]);
    // The badge content should be rendered as part of the Status column
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
  });

  test('empty state and error handling', () => {
    render(<UserList {...defaultProps} users={[]} totalCount={0} />);
    
    // Should handle empty users gracefully
    expect(screen.getByText('User')).toBeInTheDocument(); // Headers still visible
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});
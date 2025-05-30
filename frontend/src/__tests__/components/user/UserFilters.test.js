/**
 * Core User Flow: User filtering and search interface
 * Tests filter controls, search functionality, and user management actions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserFilters from '../../../components/user/UserFilters';

describe('UserFilters - User Management Interface', () => {
  const defaultProps = {
    isSuperuser: false,
    isManager: false,
    filters: {
      search: '',
      role: '',
      verified: '',
      active: ''
    },
    onFilterChange: jest.fn(),
    onCreateClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders filter interface and handles search workflow', () => {
    const onFilterChange = jest.fn();
    
    render(<UserFilters {...defaultProps} onFilterChange={onFilterChange} />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name or utorid')).toBeInTheDocument();
    
    // Test search functionality
    const searchInput = screen.getByPlaceholderText('Search by name or utorid');
    fireEvent.change(searchInput, { target: { value: 'john' } });
    
    expect(onFilterChange).toHaveBeenCalledWith('search', 'john');
  });

  test('handles filter dropdown interactions', () => {
    const onFilterChange = jest.fn();
    
    render(<UserFilters {...defaultProps} onFilterChange={onFilterChange} />);
    
    // Test role filter
    const roleSelect = screen.getByText('All Roles').closest('select');
    fireEvent.change(roleSelect, { target: { value: 'manager' } });
    expect(onFilterChange).toHaveBeenCalledWith('role', 'manager');
    
    // Test verification filter
    const verifiedSelect = screen.getByText('All Verification').closest('select');
    fireEvent.change(verifiedSelect, { target: { value: 'verified' } });
    expect(onFilterChange).toHaveBeenCalledWith('verified', 'verified');
  });

  test('shows create user button for authorized users', () => {
    const onCreateClick = jest.fn();
    const { rerender } = render(<UserFilters {...defaultProps} />);
    
    // Should not show for regular users
    expect(screen.queryByText('Create User')).not.toBeInTheDocument();
    
    // Should show for superusers
    rerender(<UserFilters {...defaultProps} isSuperuser={true} onCreateClick={onCreateClick} />);
    expect(screen.getByText('Create User')).toBeInTheDocument();
    
    // Test create button click
    fireEvent.click(screen.getByText('Create User'));
    expect(onCreateClick).toHaveBeenCalled();
  });

  test('displays search value when provided', () => {
    const filtersWithSearch = {
      ...defaultProps.filters,
      search: 'alice'
    };
    
    render(<UserFilters {...defaultProps} filters={filtersWithSearch} />);
    
    // Should show current search value
    expect(screen.getByDisplayValue('alice')).toBeInTheDocument();
  });

  test('supports manager permissions for user creation', () => {
    const onCreateClick = jest.fn();
    
    render(<UserFilters {...defaultProps} isManager={true} onCreateClick={onCreateClick} />);
    
    // Managers should also see create button
    expect(screen.getByText('Create User')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Create User'));
    expect(onCreateClick).toHaveBeenCalled();
  });
});
/**
 * Core User Flow: User management interface and CRUD operations
 * Tests user listing, filtering, creation, editing, and role-based permissions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Users from '../../../pages/users/Users';

// Mock data
const mockUsers = [
  {
    id: 1,
    utorid: 'user1',
    name: 'John Doe',
    email: 'john@mail.utoronto.ca',
    role: 'regular',
    verified: true,
    lastLogin: '2024-01-01',
    suspicious: false
  },
  {
    id: 2,
    utorid: 'cashier1',
    name: 'Jane Smith',
    email: 'jane@mail.utoronto.ca',
    role: 'cashier',
    verified: true,
    lastLogin: null,
    suspicious: true
  }
];

const mockCurrentUser = {
  id: 3,
  utorid: 'manager1',
  name: 'Manager User',
  role: 'manager'
};

// Mock hooks
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser
  })
}));

jest.mock('../../../hooks/useUsers', () => ({
  useUsers: () => ({
    users: mockUsers,
    totalCount: 2,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    isCreatingUser: false,
    isUpdatingUser: false
  })
}));

// Mock components with simplified implementations
jest.mock('../../../components/user/UserFilters', () => ({ 
  isSuperuser, 
  isManager, 
  filters, 
  onFilterChange, 
  onCreateClick 
}) => (
  <div data-testid="user-filters">
    <input 
      placeholder="Search by name or utorid"
      value={filters.search}
      onChange={(e) => onFilterChange('search', e.target.value)}
    />
    <select 
      value={filters.role}
      onChange={(e) => onFilterChange('role', e.target.value)}
    >
      <option value="">All Roles</option>
      <option value="regular">Regular</option>
      <option value="cashier">Cashier</option>
    </select>
    {(isManager || isSuperuser) && (
      <button data-testid="create-user-button" onClick={onCreateClick}>Create User</button>
    )}
  </div>
));

jest.mock('../../../components/user/UserList', () => ({ 
  users, 
  isLoading, 
  onViewUser, 
  onEditUser, 
  onToggleSuspicious 
}) => (
  <div data-testid="user-list">
    {isLoading ? (
      <div>Loading users...</div>
    ) : (
      users.map(user => (
        <div key={user.id} data-testid={`user-${user.id}`}>
          <span>{user.name} ({user.utorid})</span>
          <span>{user.role}</span>
          <button data-testid={`view-${user.id}`} onClick={() => onViewUser(user)}>View</button>
          <button data-testid={`edit-${user.id}`} onClick={() => onEditUser(user)}>Edit</button>
          {user.role === 'cashier' && (
            <button data-testid={`suspicious-${user.id}`} onClick={() => onToggleSuspicious(user)}>
              {user.suspicious ? 'Clear Suspicious' : 'Mark Suspicious'}
            </button>
          )}
        </div>
      ))
    )}
  </div>
));

jest.mock('../../../components/user/UserModals', () => ({ 
  createModalOpen,
  editModalOpen,
  viewUserDetails,
  selectedUser,
  setCreateModalOpen,
  setEditModalOpen,
  setViewUserDetails,
  newUser,
  setNewUser,
  handleCreateUser,
  handleUpdateUser
}) => (
  <div data-testid="user-modals">
    {createModalOpen && (
      <div data-testid="create-modal">
        <h3>Create New User</h3>
        <input 
          placeholder="UTORid"
          value={newUser.utorid}
          onChange={(e) => setNewUser(prev => ({ ...prev, utorid: e.target.value }))}
        />
        <input 
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
        />
        <input 
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
        />
        <button onClick={handleCreateUser}>Create</button>
        <button onClick={() => setCreateModalOpen(false)}>Cancel</button>
      </div>
    )}
    {editModalOpen && (
      <div data-testid="edit-modal">
        <h3>Edit User: {selectedUser?.name}</h3>
        <button onClick={handleUpdateUser}>Update</button>
        <button onClick={() => setEditModalOpen(false)}>Cancel</button>
      </div>
    )}
    {viewUserDetails && (
      <div data-testid="view-modal">
        <h3>User Details: {selectedUser?.name}</h3>
        <button onClick={() => setViewUserDetails(false)}>Close</button>
      </div>
    )}
  </div>
));

const renderUsers = (userRole = 'manager') => {
  mockCurrentUser.role = userRole;
  
  return render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );
};

describe('Users - User Management Interface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user management interface with filters and list', () => {
    renderUsers();
    
    expect(screen.getByTestId('user-filters')).toBeInTheDocument();
    expect(screen.getByTestId('user-list')).toBeInTheDocument();
    expect(screen.getByTestId('user-modals')).toBeInTheDocument();
  });

  test('displays users in the list', () => {
    renderUsers();
    
    expect(screen.getByTestId('user-1')).toBeInTheDocument();
    expect(screen.getByTestId('user-2')).toBeInTheDocument();
    expect(screen.getByText('John Doe (user1)')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith (cashier1)')).toBeInTheDocument();
  });

  test('handles user search filtering', () => {
    renderUsers();
    
    const searchInput = screen.getByPlaceholderText('Search by name or utorid');
    fireEvent.change(searchInput, { target: { value: 'john' } });
    
    expect(searchInput.value).toBe('john');
  });

  test('handles role filtering', () => {
    renderUsers();
    
    const roleSelect = screen.getByDisplayValue('All Roles');
    fireEvent.change(roleSelect, { target: { value: 'cashier' } });
    
    expect(roleSelect.value).toBe('cashier');
  });

  test('shows create user button for managers', () => {
    renderUsers('manager');
    
    expect(screen.getByTestId('create-user-button')).toBeInTheDocument();
  });

  test('hides create user button for non-managers', () => {
    renderUsers('cashier');
    
    expect(screen.queryByTestId('create-user-button')).not.toBeInTheDocument();
  });

  test('opens create user modal workflow', async () => {
    renderUsers();
    
    // Click create user button using specific test id
    fireEvent.click(screen.getByTestId('create-user-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('create-modal')).toBeInTheDocument();
      expect(screen.getByText('Create New User')).toBeInTheDocument();
    });
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('UTORid'), {
      target: { value: 'newuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'New User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'new@mail.utoronto.ca' }
    });
    
    expect(screen.getByDisplayValue('newuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New User')).toBeInTheDocument();
  });

  test('opens edit user modal workflow', async () => {
    renderUsers();
    
    // Click edit button for first user using specific test id
    fireEvent.click(screen.getByTestId('edit-1'));
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
      expect(screen.getByText('Edit User: John Doe')).toBeInTheDocument();
    });
  });

  test('opens view user modal workflow', async () => {
    renderUsers();
    
    // Click view button for first user using specific test id
    fireEvent.click(screen.getByTestId('view-1'));
    
    await waitFor(() => {
      expect(screen.getByTestId('view-modal')).toBeInTheDocument();
      expect(screen.getByText('User Details: John Doe')).toBeInTheDocument();
    });
  });

  test('handles suspicious cashier toggle', () => {
    renderUsers();
    
    // Find suspicious toggle for cashier using specific test id
    const suspiciousButton = screen.getByTestId('suspicious-2');
    expect(suspiciousButton).toBeInTheDocument();
    expect(suspiciousButton).toHaveTextContent('Clear Suspicious');
    
    fireEvent.click(suspiciousButton);
    // Button action would be handled by the hook
  });

  test('shows appropriate permissions for superuser', () => {
    renderUsers('superuser');
    
    expect(screen.getByTestId('create-user-button')).toBeInTheDocument();
  });

  test('closes modals when cancel/close buttons are clicked', async () => {
    renderUsers();
    
    // Open create modal
    fireEvent.click(screen.getByTestId('create-user-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('create-modal')).toBeInTheDocument();
    });
    
    // Close modal
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();
    });
  });

  test('validates user actions based on role permissions', () => {
    // Test with cashier role
    renderUsers('cashier');
    
    // Should not show management features
    expect(screen.queryByTestId('create-user-button')).not.toBeInTheDocument();
    
    // But should still show user list
    expect(screen.getByTestId('user-list')).toBeInTheDocument();
  });
}); 
/**
 * Core User Flow: User management modal interactions
 * Tests create user, edit user, and view details modal workflows
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserModals from '../../../components/user/UserModals';

// Mock child components to avoid complex dependencies
jest.mock('../../../components/common/Modal', () => ({ isOpen, onClose, title, children }) => 
  isOpen ? (
    <div data-testid="modal">
      <div data-testid="modal-title">{title}</div>
      <button data-testid="modal-close" onClick={onClose}>Close</button>
      {children}
    </div>
  ) : null
);

jest.mock('../../../components/common/Button', () => ({ children, onClick, loading, disabled, fullWidth, variant, style }) => (
  <button 
    onClick={onClick} 
    disabled={disabled || loading}
    data-testid={`button-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
    style={{ width: fullWidth ? '100%' : 'auto', ...style }}
  >
    {loading ? 'Loading...' : children}
  </button>
));

jest.mock('../../../components/common/Input', () => ({ label, value, onChange, required, helperText }) => {
  const inputId = label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <label htmlFor={inputId}>{label} {required && '*'}</label>
      <input 
        id={inputId}
        data-testid={inputId}
        value={value || ''} 
        onChange={onChange} 
        placeholder={label}
      />
      {helperText && <span data-testid={`${inputId}-helper`}>{helperText}</span>}
    </div>
  );
});

jest.mock('../../../components/common/Select', () => ({ label, value, onChange, children }) => (
  <div>
    <label>{label}</label>
    <select 
      data-testid={`select-${label?.toLowerCase().replace(/\s+/g, '-')}`}
      value={value} 
      onChange={onChange}
    >
      {children}
    </select>
  </div>
));

describe('UserModals Component', () => {
  const mockUser = {
    id: 1,
    utorid: 'john123',
    name: 'John Doe',
    email: 'john@mail.utoronto.ca',
    role: 'cashier',
    points: 1500,
    verified: false,
    suspicious: false,
    createdAt: '2024-01-01T12:00:00Z',
    lastLogin: '2024-03-15T14:30:00Z'
  };

  const defaultProps = {
    createModalOpen: false,
    setCreateModalOpen: jest.fn(),
    newUser: { utorid: '', name: '', email: '' },
    setNewUser: jest.fn(),
    handleCreateUser: jest.fn(),
    isCreatingUser: false,
    
    editModalOpen: false,
    setEditModalOpen: jest.fn(),
    selectedUser: null,
    setSelectedUser: jest.fn(),
    editData: { verified: false, suspicious: false, role: 'regular', email: '' },
    setEditData: jest.fn(),
    handleUpdateUser: jest.fn(),
    isUpdatingUser: false,
    
    viewUserDetails: false,
    setViewUserDetails: jest.fn(),
    
    isSuperuser: false,
    isManager: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create User Modal', () => {
    test('displays all required fields with helper text', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} />);
      
      // Check for required fields and their helper text
      expect(screen.getByTestId('utorid')).toBeInTheDocument();
      expect(screen.getByTestId('utorid-helper')).toHaveTextContent('Unique, Alphanumeric, 8 characters');
      
      expect(screen.getByTestId('name')).toBeInTheDocument();
      expect(screen.getByTestId('name-helper')).toHaveTextContent('1-50 characters');
      
      expect(screen.getByTestId('email')).toBeInTheDocument();
      expect(screen.getByTestId('email-helper')).toHaveTextContent('Valid University of Toronto email');
    });

    test('handles user input correctly', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} />);
      
      // Test UTORid input
      const utoridInput = screen.getByTestId('utorid');
      fireEvent.change(utoridInput, { target: { value: 'test1234' }});
      expect(defaultProps.setNewUser).toHaveBeenCalledWith(expect.any(Function));

      // Test name input
      const nameInput = screen.getByTestId('name');
      fireEvent.change(nameInput, { target: { value: 'Test User' }});
      expect(defaultProps.setNewUser).toHaveBeenCalledWith(expect.any(Function));

      // Test email input
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'test@mail.utoronto.ca' }});
      expect(defaultProps.setNewUser).toHaveBeenCalledWith(expect.any(Function));
    });

    test('handles form submission and loading state', () => {
      const { rerender } = render(<UserModals {...defaultProps} createModalOpen={true} />);
      
      // Test normal state
      const createButton = screen.getByTestId('button-create-user');
      expect(createButton).not.toBeDisabled();
      fireEvent.click(createButton);
      expect(defaultProps.handleCreateUser).toHaveBeenCalled();

      // Test loading state
      rerender(<UserModals {...defaultProps} createModalOpen={true} isCreatingUser={true} />);
      expect(screen.getByTestId('button-create-user')).toBeDisabled();
      expect(screen.getByTestId('button-create-user')).toHaveTextContent('Loading...');
    });

    test('handles modal close', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} />);
      
      const cancelButton = screen.getByTestId('button-cancel');
      fireEvent.click(cancelButton);
      expect(defaultProps.setCreateModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Edit User Modal', () => {
    test('displays user information correctly', () => {
      render(<UserModals {...defaultProps} editModalOpen={true} selectedUser={mockUser} />);
      
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Edit User: John Doe');
      expect(screen.getByTestId('email')).toHaveValue('');
    });

    test('handles verification status correctly', () => {
      const { rerender } = render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
          editData={{ ...defaultProps.editData, verified: false }}
        />
      );

      // Test unverified state
      expect(screen.getByTestId('button-verify-user')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('button-verify-user'));
      expect(defaultProps.setEditData).toHaveBeenCalledWith(expect.any(Function));

      // Test verified state
      rerender(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
          editData={{ ...defaultProps.editData, verified: true }}
        />
      );
      expect(screen.queryByTestId('button-verify-user')).not.toBeInTheDocument();
      expect(screen.getByText('User is verified. Verification cannot be revoked.')).toBeInTheDocument();
    });

    test('handles role management based on user permissions', () => {
      // Test superuser view
      const { rerender } = render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
          isSuperuser={true}
        />
      );

      const roleSelect = screen.getByTestId('select-role');
      expect(roleSelect).toBeInTheDocument();
      expect(within(roleSelect).getByText('Regular User')).toBeInTheDocument();
      expect(within(roleSelect).getByText('Cashier')).toBeInTheDocument();
      expect(within(roleSelect).getByText('Manager')).toBeInTheDocument();
      expect(within(roleSelect).getByText('Superuser')).toBeInTheDocument();

      // Test manager view
      rerender(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
          isManager={true}
        />
      );
      expect(within(roleSelect).getByText('Regular User')).toBeInTheDocument();
      expect(within(roleSelect).getByText('Cashier')).toBeInTheDocument();
      expect(within(roleSelect).queryByText('Manager')).not.toBeInTheDocument();
      expect(within(roleSelect).queryByText('Superuser')).not.toBeInTheDocument();

      // Test regular user view
      rerender(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
        />
      );
      expect(within(roleSelect).getByText('Regular User')).toBeInTheDocument();
      expect(within(roleSelect).queryByText('Cashier')).not.toBeInTheDocument();
    });

    test('handles role changes', () => {
      render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
          isSuperuser={true}
        />
      );

      const roleSelect = screen.getByTestId('select-role');
      fireEvent.change(roleSelect, { target: { value: 'manager' }});
      expect(defaultProps.setEditData).toHaveBeenCalledWith(expect.any(Function));
    });

    test('handles email changes', () => {
      render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
        />
      );

      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'new@mail.utoronto.ca' }});
      expect(defaultProps.setEditData).toHaveBeenCalledWith(expect.any(Function));
    });

    test('handles cashier-specific features', () => {
      render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
          editData={{ ...defaultProps.editData, role: 'cashier' }}
        />
      );

      const suspiciousSelect = screen.getByTestId('select-cashier-status');
      expect(suspiciousSelect).toBeInTheDocument();
      
      fireEvent.change(suspiciousSelect, { target: { value: 'true' }});
      expect(defaultProps.setEditData).toHaveBeenCalledWith(expect.any(Function));
    });

    test('handles form submission and loading state', () => {
      const { rerender } = render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
        />
      );

      // Test normal state
      const updateButton = screen.getByTestId('button-update-user');
      expect(updateButton).not.toBeDisabled();
      fireEvent.click(updateButton);
      expect(defaultProps.handleUpdateUser).toHaveBeenCalled();

      // Test loading state
      rerender(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
          isUpdatingUser={true}
        />
      );
      expect(screen.getByTestId('button-update-user')).toBeDisabled();
      expect(screen.getByTestId('button-update-user')).toHaveTextContent('Loading...');
    });

    test('handles modal close', () => {
      render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
        />
      );

      const cancelButton = screen.getByTestId('button-cancel');
      fireEvent.click(cancelButton);
      expect(defaultProps.setEditModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('View User Details Modal', () => {
    test('displays all user information correctly', () => {
      render(
        <UserModals 
          {...defaultProps} 
          viewUserDetails={true} 
          selectedUser={mockUser}
        />
      );

      // Check all user details are displayed
      expect(screen.getByText('Account Information')).toBeInTheDocument();
      expect(screen.getByText('john123')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@mail.utoronto.ca')).toBeInTheDocument();
      expect(screen.getByText('Cashier')).toBeInTheDocument();
      expect(screen.getByText('1500')).toBeInTheDocument();
      
      // Check verification status
      const verifiedText = screen.getByText((content, element) => {
        return element.textContent === 'Verified: No';
      });
      expect(verifiedText).toBeInTheDocument();
    });

    test('handles modal close correctly', () => {
      render(
        <UserModals 
          {...defaultProps} 
          viewUserDetails={true} 
          selectedUser={mockUser}
        />
      );

      fireEvent.click(screen.getByTestId('modal-close'));
      expect(defaultProps.setViewUserDetails).toHaveBeenCalledWith(false);
    });

    test('displays cashier-specific information', () => {
      const cashierUser = {
        ...mockUser,
        role: 'cashier',
        suspicious: true
      };

      render(
        <UserModals 
          {...defaultProps} 
          viewUserDetails={true} 
          selectedUser={cashierUser}
        />
      );

      const suspiciousText = screen.getByText('Yes', { exact: false });
      expect(suspiciousText).toBeInTheDocument();
      expect(suspiciousText.parentElement).toHaveTextContent('Suspicious: Yes');
      expect(suspiciousText).toHaveStyle('color: #e74c3c');
    });

    test('handles all modal states and transitions', () => {
      const { rerender } = render(<UserModals {...defaultProps} />);
      
      // Initially no modals should be open
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      // Test create modal
      rerender(<UserModals {...defaultProps} createModalOpen={true} />);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Create New User');
      fireEvent.click(screen.getByTestId('button-cancel'));
      expect(defaultProps.setCreateModalOpen).toHaveBeenCalledWith(false);

      // Test edit modal
      rerender(<UserModals {...defaultProps} editModalOpen={true} selectedUser={mockUser} />);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Edit User: John Doe');
      fireEvent.click(screen.getByTestId('button-cancel'));
      expect(defaultProps.setEditModalOpen).toHaveBeenCalledWith(false);

      // Test view details modal
      rerender(<UserModals {...defaultProps} viewUserDetails={true} selectedUser={mockUser} />);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('User Details');
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(defaultProps.setViewUserDetails).toHaveBeenCalledWith(false);
    });

    test('handles loading states correctly', () => {
      const { rerender } = render(
        <UserModals 
          {...defaultProps} 
          createModalOpen={true}
          isCreatingUser={true}
        />
      );

      // Test create modal loading
      const createButton = screen.getByTestId('button-create-user');
      expect(createButton).toBeDisabled();
      expect(createButton).toHaveTextContent('Loading...');

      // Test edit modal loading
      rerender(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={mockUser}
          isUpdatingUser={true}
        />
      );
      const updateButton = screen.getByTestId('button-update-user');
      expect(updateButton).toBeDisabled();
      expect(updateButton).toHaveTextContent('Loading...');
    });

    test('handles role-based permissions correctly', () => {
      const { rerender } = render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={mockUser}
          isSuperuser={true}
        />
      );

      // Test superuser permissions
      const roleSelect = screen.getByTestId('select-role');
      expect(within(roleSelect).getByText('Superuser')).toBeInTheDocument();

      // Test manager permissions
      rerender(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={mockUser}
          isManager={true}
        />
      );
      expect(within(roleSelect).queryByText('Superuser')).not.toBeInTheDocument();
      expect(within(roleSelect).getByText('Cashier')).toBeInTheDocument();

      // Test regular user permissions
      rerender(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={mockUser}
        />
      );
      expect(within(roleSelect).queryByText('Cashier')).not.toBeInTheDocument();
      expect(within(roleSelect).getByText('Regular User')).toBeInTheDocument();
    });

    test('handles verification workflow correctly', () => {
      const { rerender } = render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={mockUser}
          editData={{ ...defaultProps.editData, verified: false }}
        />
      );

      // Test unverified state with role change
      const roleSelect = screen.getByTestId('select-role');
      fireEvent.change(roleSelect, { target: { value: 'cashier' }});
      expect(screen.getByText(/Note: Assigning any role will automatically verify this user./)).toBeInTheDocument();

      // Test verification button
      const verifyButton = screen.getByTestId('button-verify-user');
      fireEvent.click(verifyButton);
      expect(defaultProps.setEditData).toHaveBeenCalledWith(expect.any(Function));

      // Test verified state
      rerender(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={mockUser}
          editData={{ ...defaultProps.editData, verified: true }}
        />
      );
      expect(screen.queryByTestId('button-verify-user')).not.toBeInTheDocument();
      expect(screen.getByText('User is verified. Verification cannot be revoked.')).toBeInTheDocument();
    });

    test('handles cashier status changes correctly', () => {
      render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={{ ...mockUser, role: 'cashier' }}
          editData={{ ...defaultProps.editData, role: 'cashier' }}
        />
      );

      const suspiciousSelect = screen.getByTestId('select-cashier-status');
      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText('Suspicious')).toBeInTheDocument();

      fireEvent.change(suspiciousSelect, { target: { value: 'true' }});
      expect(defaultProps.setEditData).toHaveBeenCalledWith(expect.any(Function));
    });

    test('handles form interactions correctly', () => {
      const { rerender } = render(
        <UserModals 
          {...defaultProps} 
          createModalOpen={true}
        />
      );

      // Test create form
      const utoridInput = screen.getByTestId('utorid');
      const nameInput = screen.getByTestId('name');
      const emailInput = screen.getByTestId('email');

      fireEvent.change(utoridInput, { target: { value: 'test1234' }});
      fireEvent.change(nameInput, { target: { value: 'Test User' }});
      fireEvent.change(emailInput, { target: { value: 'test@mail.utoronto.ca' }});

      expect(defaultProps.setNewUser).toHaveBeenCalledTimes(3);

      // Test edit form
      rerender(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={mockUser}
          editData={{ ...defaultProps.editData, role: 'cashier' }}
        />
      );

      const editEmailInput = screen.getByTestId('email');
      fireEvent.change(editEmailInput, { target: { value: 'new@mail.utoronto.ca' }});
      expect(defaultProps.setEditData).toHaveBeenCalled();

      const roleSelect = screen.getByTestId('select-role');
      fireEvent.change(roleSelect, { target: { value: 'manager' }});
      expect(defaultProps.setEditData).toHaveBeenCalled();
    });

    test('handles verification and role changes together', () => {
      const { rerender } = render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={mockUser}
          editData={{ ...defaultProps.editData, verified: false }}
          isSuperuser={true}
        />
      );

      // Change role for unverified user
      const roleSelect = screen.getByTestId('select-role');
      fireEvent.change(roleSelect, { target: { value: 'manager' }});
      expect(screen.getByText(/Note: Assigning any role will automatically verify this user./)).toBeInTheDocument();

      // Verify user
      const verifyButton = screen.getByTestId('button-verify-user');
      fireEvent.click(verifyButton);

      // Check verified state
      rerender(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={mockUser}
          editData={{ ...defaultProps.editData, verified: true, role: 'manager' }}
          isSuperuser={true}
        />
      );
      expect(screen.queryByTestId('button-verify-user')).not.toBeInTheDocument();
      expect(screen.getByText('User is verified. Verification cannot be revoked.')).toBeInTheDocument();
    });

    test('handles suspicious cashier workflow', () => {
      const suspiciousCashier = {
        ...mockUser,
        role: 'cashier',
        suspicious: true
      };

      render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true}
          selectedUser={suspiciousCashier}
          editData={{ ...defaultProps.editData, role: 'cashier', suspicious: true }}
          isManager={true}
        />
      );

      // Check suspicious status select
      const suspiciousSelect = screen.getByTestId('select-cashier-status');
      expect(suspiciousSelect).toHaveValue('true');

      // Change to normal status
      fireEvent.change(suspiciousSelect, { target: { value: 'false' }});
      expect(defaultProps.setEditData).toHaveBeenCalledWith(expect.any(Function));

      // Check role options as manager
      const roleSelect = screen.getByTestId('select-role');
      expect(within(roleSelect).getByText('Regular User')).toBeInTheDocument();
      expect(within(roleSelect).getByText('Cashier')).toBeInTheDocument();
      expect(within(roleSelect).queryByText('Manager')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles missing user data gracefully', () => {
      const incompleteUser = {
        ...mockUser,
        points: undefined,
        lastLogin: null,
      };

      render(
        <UserModals 
          {...defaultProps} 
          viewUserDetails={true} 
          selectedUser={incompleteUser}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument(); // Default points
      expect(screen.getByText('Never')).toBeInTheDocument(); // No last login
    });

    test('handles role change notification for unverified users', () => {
      render(
        <UserModals 
          {...defaultProps} 
          editModalOpen={true} 
          selectedUser={mockUser}
          editData={{ ...defaultProps.editData, verified: false, role: 'cashier' }}
        />
      );

      expect(screen.getByText(/Note: Assigning any role will automatically verify this user./)).toBeInTheDocument();
    });

    test('handles modal state transitions', () => {
      const { rerender } = render(<UserModals {...defaultProps} />);
      
      // Initially no modals should be open
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      // Open create modal
      rerender(<UserModals {...defaultProps} createModalOpen={true} />);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Create New User');

      // Open edit modal
      rerender(<UserModals {...defaultProps} editModalOpen={true} selectedUser={mockUser} />);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Edit User: John Doe');

      // Open view details modal
      rerender(<UserModals {...defaultProps} viewUserDetails={true} selectedUser={mockUser} />);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('User Details');
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserModals from '../../../components/user/UserModals';

// Mock child components
jest.mock('../../../components/common/Modal', () => ({ isOpen, onClose, title, children }) => 
  isOpen ? (
    <div data-testid="modal">
      <div data-testid="modal-title">{title}</div>
      <button data-testid="modal-close" onClick={onClose}>Close</button>
      {children}
    </div>
  ) : null
);

jest.mock('../../../components/common/Button', () => ({ children, onClick, loading, disabled, variant, style, fullWidth, ...props }) => (
  <button 
    onClick={onClick} 
    disabled={disabled || loading}
    data-testid={`button-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
    data-variant={variant}
    data-loading={loading}
    style={style}
    {...props}
  >
    {loading ? 'Loading...' : children}
  </button>
));

jest.mock('../../../components/common/Input', () => ({ label, value, onChange, placeholder, helperText, required, id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <label htmlFor={inputId}>{label} {required && '*'}</label>
      <input 
        id={inputId}
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        {...props}
      />
      {helperText && <div data-testid="helper-text">{helperText}</div>}
    </div>
  );
});

jest.mock('../../../components/common/Select', () => ({ label, value, onChange, children, id }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <label htmlFor={selectId}>{label}</label>
      <select id={selectId} value={value} onChange={onChange}>
        {children}
      </select>
    </div>
  );
});

describe('UserModals Component', () => {
  const mockUser = {
    id: 1,
    utorid: 'john123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'cashier',
    points: 1500,
    verified: false,
    suspicious: false,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z',
    promotions: [
      { id: 1, name: 'Welcome Bonus', points: 100 },
      { id: 2, name: 'First Purchase', points: 50 }
    ]
  };

  const defaultProps = {
    // Create modal props
    createModalOpen: false,
    setCreateModalOpen: jest.fn(),
    newUser: { utorid: '', name: '', email: '' },
    setNewUser: jest.fn(),
    handleCreateUser: jest.fn(),
    isCreatingUser: false,
    
    // Edit modal props
    editModalOpen: false,
    setEditModalOpen: jest.fn(),
    selectedUser: null,
    setSelectedUser: jest.fn(),
    editData: { verified: false, suspicious: false, role: 'regular', email: '' },
    setEditData: jest.fn(),
    handleUpdateUser: jest.fn(),
    isUpdatingUser: false,
    
    // View details modal props
    viewUserDetails: false,
    setViewUserDetails: jest.fn(),
    
    // Permissions
    isSuperuser: false,
    isManager: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create User Modal', () => {
    it('renders create modal when open', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} />);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Create New User');
      expect(screen.getByLabelText('UTORid *')).toBeInTheDocument();
      expect(screen.getByLabelText('Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    });

    it('does not render create modal when closed', () => {
      render(<UserModals {...defaultProps} createModalOpen={false} />);
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('displays helper texts for create form fields', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} />);
      
      expect(screen.getByText('Unique, Alphanumeric, 8 characters')).toBeInTheDocument();
      expect(screen.getByText('1-50 characters')).toBeInTheDocument();
      expect(screen.getByText('Valid University of Toronto email')).toBeInTheDocument();
    });

    it('calls setNewUser when input values change', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} />);
      
      const utoridInput = screen.getByLabelText('UTORid *');
      const nameInput = screen.getByLabelText('Name *');
      const emailInput = screen.getByLabelText('Email *');
      
      fireEvent.change(utoridInput, { target: { value: 'john123' } });
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      expect(defaultProps.setNewUser).toHaveBeenCalledTimes(3);
    });

    it('calls handleCreateUser when create button is clicked', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} />);
      
      const createButton = screen.getByTestId('button-create-user');
      fireEvent.click(createButton);
      
      expect(defaultProps.handleCreateUser).toHaveBeenCalled();
    });

    it('calls setCreateModalOpen when cancel button is clicked', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} />);
      
      const cancelButton = screen.getByTestId('button-cancel');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.setCreateModalOpen).toHaveBeenCalledWith(false);
    });

    it('disables buttons when creating user', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} isCreatingUser={true} />);
      
      const createButton = screen.getByTestId('button-create-user');
      const cancelButton = screen.getByTestId('button-cancel');
      
      expect(createButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('shows loading state on create button', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} isCreatingUser={true} />);
      
      const createButton = screen.getByTestId('button-create-user');
      expect(createButton).toHaveTextContent('Loading...');
    });
  });

  describe('Edit User Modal', () => {
    const editProps = {
      ...defaultProps,
      editModalOpen: true,
      selectedUser: mockUser,
      editData: {
        verified: false,
        suspicious: false,
        role: 'cashier',
        email: 'john@example.com'
      }
    };

    it('renders edit modal when open', () => {
      render(<UserModals {...editProps} />);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Edit User: John Doe');
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('shows verify button when user is not verified', () => {
      render(<UserModals {...editProps} />);
      
      expect(screen.getByTestId('button-verify-user')).toBeInTheDocument();
    });

    it('shows verification status when user is verified', () => {
      const verifiedProps = {
        ...editProps,
        editData: { ...editProps.editData, verified: true }
      };
      
      render(<UserModals {...verifiedProps} />);
      
      expect(screen.getByText(/User is verified/)).toBeInTheDocument();
      expect(screen.queryByTestId('button-verify-user')).not.toBeInTheDocument();
    });

    it('shows cashier status select for cashiers', () => {
      render(<UserModals {...editProps} />);
      
      expect(screen.getByLabelText('Cashier Status')).toBeInTheDocument();
    });

    it('does not show cashier status for non-cashiers', () => {
      const nonCashierProps = {
        ...editProps,
        selectedUser: { ...mockUser, role: 'regular' },
        editData: { ...editProps.editData, role: 'regular' }
      };
      
      render(<UserModals {...nonCashierProps} />);
      
      expect(screen.queryByLabelText('Cashier Status')).not.toBeInTheDocument();
    });

    it('calls setEditData when verify button is clicked', () => {
      render(<UserModals {...editProps} />);
      
      const verifyButton = screen.getByTestId('button-verify-user');
      fireEvent.click(verifyButton);
      
      expect(defaultProps.setEditData).toHaveBeenCalledWith(expect.any(Function));
    });

    it('calls handleUpdateUser when update button is clicked', () => {
      render(<UserModals {...editProps} />);
      
      const updateButton = screen.getByTestId('button-update-user');
      fireEvent.click(updateButton);
      
      expect(defaultProps.handleUpdateUser).toHaveBeenCalled();
    });

    it('shows note about automatic verification for role assignment', () => {
      render(<UserModals {...editProps} />);
      
      expect(screen.getByText(/Assigning any role will automatically verify this user/)).toBeInTheDocument();
    });

    it('does not show verification note when user is already verified', () => {
      const verifiedProps = {
        ...editProps,
        editData: { ...editProps.editData, verified: true }
      };
      
      render(<UserModals {...verifiedProps} />);
      
      expect(screen.queryByText(/Assigning any role will automatically verify this user/)).not.toBeInTheDocument();
    });
  });

  describe('Role Permissions in Edit Modal', () => {
    const editProps = {
      ...defaultProps,
      editModalOpen: true,
      selectedUser: mockUser,
      editData: { verified: false, suspicious: false, role: 'regular', email: 'john@example.com' }
    };

    it('shows all roles for superuser', () => {
      render(<UserModals {...editProps} isSuperuser={true} />);
      
      const roleSelect = screen.getByLabelText('Role');
      expect(roleSelect).toBeInTheDocument();
      
      // Check if all options are present
      expect(screen.getByText('Regular User')).toBeInTheDocument();
      expect(screen.getByText('Cashier')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
      expect(screen.getByText('Superuser')).toBeInTheDocument();
    });

    it('shows limited roles for manager', () => {
      render(<UserModals {...editProps} isManager={true} />);
      
      expect(screen.getByText('Regular User')).toBeInTheDocument();
      expect(screen.getByText('Cashier')).toBeInTheDocument();
      expect(screen.queryByText('Manager')).not.toBeInTheDocument();
      expect(screen.queryByText('Superuser')).not.toBeInTheDocument();
    });

    it('shows only regular role for regular users', () => {
      render(<UserModals {...editProps} />);
      
      expect(screen.getByText('Regular User')).toBeInTheDocument();
      expect(screen.queryByText('Cashier')).not.toBeInTheDocument();
      expect(screen.queryByText('Manager')).not.toBeInTheDocument();
      expect(screen.queryByText('Superuser')).not.toBeInTheDocument();
    });
  });

  describe('View User Details Modal', () => {
    const viewProps = {
      ...defaultProps,
      viewUserDetails: true,
      selectedUser: mockUser
    };

    it('renders view details modal when open', () => {
      render(<UserModals {...viewProps} />);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('User Details');
      expect(screen.getByText('Account Information')).toBeInTheDocument();
    });

    it('displays user information correctly', () => {
      render(<UserModals {...viewProps} />);
      
      expect(screen.getByText('john123')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Cashier')).toBeInTheDocument();
      expect(screen.getByText('1500')).toBeInTheDocument();
      expect(screen.getByText(/Verified:/).parentElement).toHaveTextContent('No');
    });

    it('displays cashier suspicious status', () => {
      render(<UserModals {...viewProps} />);
      
      expect(screen.getByText(/Suspicious:/)).toBeInTheDocument();
    });

    it('does not display suspicious status for non-cashiers', () => {
      const nonCashierProps = {
        ...viewProps,
        selectedUser: { ...mockUser, role: 'regular' }
      };
      
      render(<UserModals {...nonCashierProps} />);
      
      expect(screen.queryByText(/Suspicious:/)).not.toBeInTheDocument();
    });

    it('displays promotions when available', () => {
      render(<UserModals {...viewProps} />);
      
      expect(screen.getByText('Available One-time Promotions')).toBeInTheDocument();
      expect(screen.getByText(/Welcome Bonus/)).toBeInTheDocument();
      expect(screen.getByText(/First Purchase/)).toBeInTheDocument();
    });

    it('does not display promotions section when none available', () => {
      const noPromosProps = {
        ...viewProps,
        selectedUser: { ...mockUser, promotions: [] }
      };
      
      render(<UserModals {...noPromosProps} />);
      
      expect(screen.queryByText('Available One-time Promotions')).not.toBeInTheDocument();
    });

    it('shows edit button for users with edit permissions', () => {
      render(<UserModals {...viewProps} isManager={true} />);
      
      expect(screen.getByTestId('button-edit-user')).toBeInTheDocument();
    });

    it('does not show edit button for users without edit permissions', () => {
      render(<UserModals {...viewProps} />);
      
      expect(screen.queryByTestId('button-edit-user')).not.toBeInTheDocument();
    });

    it('transitions from view to edit modal when edit button is clicked', () => {
      render(<UserModals {...viewProps} isSuperuser={true} />);
      
      const editButton = screen.getByTestId('button-edit-user');
      fireEvent.click(editButton);
      
      expect(defaultProps.setViewUserDetails).toHaveBeenCalledWith(false);
      expect(defaultProps.setEditData).toHaveBeenCalledWith({
        verified: mockUser.verified,
        suspicious: mockUser.suspicious,
        role: mockUser.role,
        email: mockUser.email
      });
      expect(defaultProps.setEditModalOpen).toHaveBeenCalledWith(true);
    });

    it('handles last login display correctly', () => {
      render(<UserModals {...viewProps} />);
      
      // Should show formatted date
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('handles never logged in user', () => {
      const neverLoggedInProps = {
        ...viewProps,
        selectedUser: { ...mockUser, lastLogin: null }
      };
      
      render(<UserModals {...neverLoggedInProps} />);
      
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('closes create modal when close button is clicked', () => {
      render(<UserModals {...defaultProps} createModalOpen={true} />);
      
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);
      
      expect(defaultProps.setCreateModalOpen).toHaveBeenCalledWith(false);
    });

    it('closes edit modal when close button is clicked', () => {
      render(<UserModals {...defaultProps} editModalOpen={true} selectedUser={mockUser} />);
      
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);
      
      expect(defaultProps.setEditModalOpen).toHaveBeenCalledWith(false);
    });

    it('closes view modal when close button is clicked', () => {
      render(<UserModals {...defaultProps} viewUserDetails={true} selectedUser={mockUser} />);
      
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);
      
      expect(defaultProps.setViewUserDetails).toHaveBeenCalledWith(false);
    });
  });

  describe('Form Validation and State', () => {
    it('updates edit form state when form fields change', () => {
      const editProps = {
        ...defaultProps,
        editModalOpen: true,
        selectedUser: mockUser,
        editData: { verified: false, suspicious: false, role: 'cashier', email: 'john@example.com' }
      };
      
      render(<UserModals {...editProps} />);
      
      const emailInput = screen.getByLabelText('Email');
      const roleSelect = screen.getByLabelText('Role');
      const statusSelect = screen.getByLabelText('Cashier Status');
      
      fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });
      fireEvent.change(roleSelect, { target: { value: 'regular' } });
      fireEvent.change(statusSelect, { target: { value: 'true' } });
      
      expect(defaultProps.setEditData).toHaveBeenCalledTimes(3);
    });

    it('disables form during loading states', () => {
      render(<UserModals {...defaultProps} editModalOpen={true} selectedUser={mockUser} isUpdatingUser={true} />);
      
      const updateButton = screen.getByTestId('button-update-user');
      const cancelButton = screen.getByTestId('button-cancel');
      
      expect(updateButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing selectedUser gracefully', () => {
      render(<UserModals {...defaultProps} viewUserDetails={true} selectedUser={null} />);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('User Details');
    });

    it('handles empty user data gracefully', () => {
      const emptyUser = {
        id: 1,
        utorid: '',
        name: '',
        email: '',
        role: 'regular',
        points: 0,
        verified: false,
        suspicious: false,
        createdAt: '2024-01-01T00:00:00Z',
        lastLogin: null,
        promotions: []
      };
      
      render(<UserModals {...defaultProps} viewUserDetails={true} selectedUser={emptyUser} />);
      
      expect(screen.getByText('Account Information')).toBeInTheDocument();
      expect(screen.getByText('Never')).toBeInTheDocument(); // Last login
    });

    it('capitalizes role names correctly', () => {
      const userWithRole = { ...mockUser, role: 'superuser' };
      
      render(<UserModals {...defaultProps} viewUserDetails={true} selectedUser={userWithRole} />);
      
      expect(screen.getByText('Superuser')).toBeInTheDocument();
    });
  });
});

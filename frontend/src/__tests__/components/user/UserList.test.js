import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserList from '../../../components/user/UserList';

// Mock icons
jest.mock('react-icons/fa', () => ({
  FaEye: () => <span data-testid="eye-icon">Eye</span>,
  FaUserEdit: () => <span data-testid="edit-icon">Edit</span>,
  FaExclamationTriangle: () => <span data-testid="warning-icon">Warning</span>,
}));

describe('UserList Component', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      utorid: 'john123',
      email: 'john@example.com',
      role: 'cashier',
      suspicious: false
    },
    {
      id: 2,
      name: 'Jane Smith',
      utorid: 'jane456',
      email: 'jane@example.com',
      role: 'manager',
      suspicious: true
    },
    {
      id: 3,
      name: 'Admin User',
      utorid: 'admin',
      email: 'admin@example.com',
      role: 'superuser',
      suspicious: false
    }
  ];

  const defaultProps = {
    users: mockUsers,
    totalCount: 3,
    isLoading: false,
    isSuperuser: false,
    isManager: false,
    filters: {
      page: 1,
      limit: 10,
      search: '',
      role: '',
      verified: '',
      active: ''
    },
    onFilterChange: jest.fn(),
    onViewUser: jest.fn(),
    onEditUser: jest.fn(),
    renderUserBadges: jest.fn().mockImplementation((user) => (
      <span data-testid={`user-badges-${user.id}`}>Badges for {user.name}</span>
    )),
    onToggleSuspicious: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<UserList {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
      expect(screen.queryByText('User')).not.toBeInTheDocument();
    });
  });

  describe('Table Structure', () => {
    it('renders table header correctly', () => {
      render(<UserList {...defaultProps} />);
      
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders all users in the list', () => {
      render(<UserList {...defaultProps} />);
      
      // Check user names
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      
      // Check user utorids
      expect(screen.getByText('john123')).toBeInTheDocument();
      expect(screen.getByText('jane456')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      
      // Check emails
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });
  });

  describe('Role Badges', () => {
    it('displays correct role badges with proper styling', () => {
      render(<UserList {...defaultProps} />);
      
      expect(screen.getByText('Cashier')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
      expect(screen.getByText('Superuser')).toBeInTheDocument();
    });

    it('handles unknown role properly', () => {
      const usersWithUnknownRole = [
        {
          id: 1,
          name: 'Unknown User',
          utorid: 'unknown',
          email: 'unknown@example.com',
          role: 'unknown_role',
          suspicious: false
        }
      ];
      
      render(<UserList {...defaultProps} users={usersWithUnknownRole} totalCount={1} />);
      
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('User Badges', () => {
    it('calls renderUserBadges function for each user', () => {
      render(<UserList {...defaultProps} />);
      
      expect(defaultProps.renderUserBadges).toHaveBeenCalledTimes(3);
      expect(defaultProps.renderUserBadges).toHaveBeenCalledWith(mockUsers[0]);
      expect(defaultProps.renderUserBadges).toHaveBeenCalledWith(mockUsers[1]);
      expect(defaultProps.renderUserBadges).toHaveBeenCalledWith(mockUsers[2]);
    });

    it('displays rendered user badges', () => {
      render(<UserList {...defaultProps} />);
      
      // Check that the Status column exists for each user
      const statusColumns = screen.getAllByText(/Status:/);
      expect(statusColumns).toHaveLength(3);
    });
  });

  describe('Action Buttons', () => {
    it('shows view button for all users', () => {
      render(<UserList {...defaultProps} />);
      
      const viewButtons = screen.getAllByTestId('eye-icon');
      expect(viewButtons).toHaveLength(3);
    });

    it('calls onViewUser when view button is clicked', () => {
      render(<UserList {...defaultProps} />);
      
      const viewButtons = screen.getAllByTestId('eye-icon');
      fireEvent.click(viewButtons[0].closest('button'));
      
      expect(defaultProps.onViewUser).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('shows suspicious toggle button for cashiers when user has edit permission', () => {
      render(<UserList {...defaultProps} isManager={true} />);
      
      // Should show suspicious button for cashier (John Doe)
      const suspiciousButtons = screen.getAllByTestId('warning-icon');
      expect(suspiciousButtons).toHaveLength(1);
    });

    it('does not show suspicious toggle button when user has no edit permission', () => {
      render(<UserList {...defaultProps} />);
      
      // Should not show suspicious button when not manager/superuser
      expect(screen.queryByTestId('warning-icon')).not.toBeInTheDocument();
    });

    it('calls onToggleSuspicious when suspicious button is clicked', () => {
      render(<UserList {...defaultProps} isSuperuser={true} />);
      
      const suspiciousButton = screen.getByTestId('warning-icon').closest('button');
      fireEvent.click(suspiciousButton);
      
      expect(defaultProps.onToggleSuspicious).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  describe('Permissions', () => {
    it('allows editing when user is superuser', () => {
      render(<UserList {...defaultProps} isSuperuser={true} />);
      
      // Should show suspicious button for cashier
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });

    it('allows editing when user is manager', () => {
      render(<UserList {...defaultProps} isManager={true} />);
      
      // Should show suspicious button for cashier
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });

    it('does not allow editing for regular users', () => {
      render(<UserList {...defaultProps} />);
      
      // Should not show any edit buttons
      expect(screen.queryByTestId('warning-icon')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no users are provided', () => {
      render(<UserList {...defaultProps} users={[]} totalCount={0} />);
      
      expect(screen.getByText('No users found matching your filters.')).toBeInTheDocument();
    });

    it('shows empty state when users array is null', () => {
      render(<UserList {...defaultProps} users={null} totalCount={0} />);
      
      expect(screen.getByText('No users found matching your filters.')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const paginationProps = {
      ...defaultProps,
      totalCount: 25,
      filters: {
        ...defaultProps.filters,
        page: 2,
        limit: 10
      }
    };

    it('displays correct pagination info', () => {
      render(<UserList {...paginationProps} />);
      
      // Use regex to match text that might be split across elements
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      expect(screen.getByText(/11/)).toBeInTheDocument();
      expect(screen.getByText(/25/)).toBeInTheDocument();
      expect(screen.getByText(/users/)).toBeInTheDocument();
      expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();
    });

    it('handles first page pagination correctly', () => {
      const firstPageProps = {
        ...paginationProps,
        filters: { ...paginationProps.filters, page: 1 }
      };
      
      render(<UserList {...firstPageProps} />);
      
      // Use more specific text matching to avoid multiple matches
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      expect(screen.getByText(/10/)).toBeInTheDocument(); // Using 10 instead of 1 to avoid conflicts
      expect(screen.getByText(/25/)).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      
      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeDisabled();
    });

    it('handles last page pagination correctly', () => {
      const lastPageProps = {
        ...paginationProps,
        filters: { ...paginationProps.filters, page: 3 }
      };
      
      render(<UserList {...lastPageProps} />);
      
      expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('calls onFilterChange when pagination buttons are clicked', () => {
      render(<UserList {...paginationProps} />);
      
      // Test previous button
      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('page', 1);
      
      // Test next button
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('page', 3);
    });

    it('shows zero state pagination when no users', () => {
      render(<UserList {...defaultProps} users={[]} totalCount={0} />);
      
      expect(screen.getByText(/Showing 0 to 0 of 0 users/)).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
    });

    it('handles zero division in pagination correctly', () => {
      const zeroLimitProps = {
        ...defaultProps,
        totalCount: 10,
        filters: { ...defaultProps.filters, limit: 0 }
      };
      
      render(<UserList {...zeroLimitProps} />);
      
      // Should not crash and should handle edge case gracefully
      // When limit is 0, it shows "Infinity" pages
      expect(screen.getByText(/Page/)).toBeInTheDocument();
      expect(screen.getByText(/Infinity/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      // Mock window.matchMedia for responsive tests
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });
    });

    it('adapts layout for mobile screens', () => {
      render(<UserList {...defaultProps} />);
      
      // In mobile view, table structure should adapt
      // We can test for presence of elements that should be visible
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing user properties gracefully', () => {
      const incompleteUsers = [
        {
          id: 1,
          name: '',
          utorid: '',
          email: '',
          role: 'regular',
          suspicious: false
        }
      ];
      
      render(<UserList {...defaultProps} users={incompleteUsers} totalCount={1} />);
      
      expect(screen.getByText('Regular')).toBeInTheDocument();
    });

    it('handles large datasets correctly', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        utorid: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: 'regular',
        suspicious: false
      }));
      
      const largeDataProps = {
        ...defaultProps,
        users: largeDataset.slice(0, 10), // Only first 10 rendered
        totalCount: 100,
        filters: { ...defaultProps.filters, limit: 10 }
      };
      
      render(<UserList {...largeDataProps} />);
      
      expect(screen.getByText(/Showing 1 to 10 of 100 users/)).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of 10/)).toBeInTheDocument();
    });
  });
}); 
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserDetail from '../../../pages/users/UserDetail';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock useUsers hook
const mockGetUser = jest.fn();
jest.mock('../../../hooks/useUsers', () => ({
  useUsers: () => ({
    getUser: mockGetUser,
  }),
}));

// Mock useAuth hook directly
const mockUseAuth = jest.fn();
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock QRCode component to avoid Canvas issues
jest.mock('../../../components/common/QRCode', () => {
  return function MockQRCode({ value }) {
    return <div data-testid="qr-code">QR Code for: {value}</div>;
  };
});

describe('UserDetail', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    utorid: 'testuser',
    role: 'student',
    verified: true,
    birthday: '1990-01-01',
    points: 100,
    avatarUrl: null,
  };

  const mockAuthContext = {
    activeRole: 'manager',
    currentUser: { id: 2, role: 'manager' },
  };

  const renderComponent = (authContext = mockAuthContext) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Set up the mock for this test
    mockUseAuth.mockReturnValue(authContext);

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/users/1']}>
          <UserDetail />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });
  });

  it('renders user details for authorized users', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('User Details')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      // Use more specific selector for UTORid in user info section
      expect(screen.getByText('UTORid:')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  it('shows access denied for unauthorized users', () => {
    const unauthorizedAuth = {
      activeRole: 'student',
      currentUser: { id: 1, role: 'student' },
    };

    renderComponent(unauthorizedAuth);

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You do not have permission to view this page.')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockGetUser.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderComponent();

    expect(screen.getByText('Loading user...')).toBeInTheDocument();
  });

  it('shows error state when user not found', () => {
    mockGetUser.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('User not found'),
    });

    renderComponent();

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Failed to load user details.')).toBeInTheDocument();
  });

  it('displays user avatar initials when no avatar URL', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('TU')).toBeInTheDocument(); // Test User initials
    });
  });

  it('shows verified status badge', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('✔')).toBeInTheDocument();
    });
  });

  it('prevents non-superuser from viewing superuser details', async () => {
    const superuserMock = {
      ...mockUser,
      role: 'superuser',
    };

    const nonSuperuserAuth = {
      activeRole: 'manager',
      currentUser: { id: 2, role: 'manager' },
    };

    mockGetUser.mockReturnValue({
      data: superuserMock,
      isLoading: false,
      error: null,
    });

    renderComponent(nonSuperuserAuth);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Cannot access superuser');
    });
  });
}); 
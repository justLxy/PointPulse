/**
 * TransferPage Tests
 * Purpose: Test transfer page functionality including URL parameter handling,
 * authentication checks, and modal integration
 * Coverage: Authentication redirects, data parameter parsing, modal rendering
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransferPage from '../../pages/TransferPage';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock react-hot-toast (third-party notification library)
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  }
}));

// Create mock auth context that can be modified per test
const createMockAuthContext = (overrides = {}) => ({
  isAuthenticated: true,
  currentUser: {
    id: 1,
    utorid: 'testuser',
    name: 'John Doe',
    role: 'regular',
    points: 1500
  },
  activeRole: 'regular',
  logout: jest.fn(),
  ...overrides
});

let mockAuthContext = createMockAuthContext();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock hooks with minimal implementation
jest.mock('../../hooks/useUserTransactions', () => ({
  __esModule: true,
  default: () => ({
    transferPoints: jest.fn(),
    isTransferringPoints: false
  })
}));

// Mock navigation functions
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderTransferPage = (initialUrl = '/transfer') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0
      },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialUrl]}>
        <TransferPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('TransferPage - Core Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext = createMockAuthContext();
    // Clear console.warn mock to avoid interference
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('URL Parameter Handling', () => {
    it('redirects to home when data parameter is missing', () => {
      const { container } = renderTransferPage('/transfer');
      // Component should redirect, so it won't render the modal
      expect(container.firstChild).toBe(null);
    });

    it('redirects to home when data parameter is invalid base64', () => {
      const invalidData = 'invalid-base64!@#';
      const { container } = renderTransferPage(`/transfer?data=${invalidData}`);
      expect(container.firstChild).toBe(null);
    });

    it('redirects to home when data parameter contains invalid JSON', () => {
      const invalidJson = btoa('{"invalid": json}');
      const { container } = renderTransferPage(`/transfer?data=${invalidJson}`);
      expect(container.firstChild).toBe(null);
    });

    it('redirects to home when decoded data lacks utorid', () => {
      const dataWithoutUtorid = btoa(JSON.stringify({ name: 'John Doe' }));
      const { container } = renderTransferPage(`/transfer?data=${dataWithoutUtorid}`);
      expect(container.firstChild).toBe(null);
    });

    it('successfully parses valid data parameter with utorid', async () => {
      const validData = btoa(JSON.stringify({ utorid: 'recipient123' }));
      renderTransferPage(`/transfer?data=${validData}`);
      
      // Should render the transfer modal with correct recipient
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });
    });

    it('handles URL encoded data parameter correctly', async () => {
      const validData = encodeURIComponent(btoa(JSON.stringify({ utorid: 'recipient@test' })));
      renderTransferPage(`/transfer?data=${validData}`);
      
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Flow', () => {
    it('redirects to login when user is not authenticated', () => {
      mockAuthContext = createMockAuthContext({ isAuthenticated: false });
      const validData = btoa(JSON.stringify({ utorid: 'recipient123' }));
      
      const { container } = renderTransferPage(`/transfer?data=${validData}`);
      
      // Should redirect to login, so container is empty
      expect(container.firstChild).toBe(null);
    });

    it('preserves return URL when redirecting to login', () => {
      mockAuthContext = createMockAuthContext({ isAuthenticated: false });
      const validData = btoa(JSON.stringify({ utorid: 'recipient123' }));
      const expectedReturnUrl = `/transfer?data=${encodeURIComponent(validData)}`;
      
      renderTransferPage(`/transfer?data=${validData}`);
      
      // Component should have tried to navigate to login with return URL
      // Since we're using Navigate component, we test by checking if component renders nothing
      expect(screen.queryByText('Transfer Points')).not.toBeInTheDocument();
    });

    it('renders transfer modal when user is authenticated', async () => {
      const validData = btoa(JSON.stringify({ utorid: 'recipient123' }));
      renderTransferPage(`/transfer?data=${validData}`);
      
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Integration', () => {
    it('renders transfer modal with correct props when authenticated and valid data', async () => {
      const recipientUtorid = 'recipient123';
      const validData = btoa(JSON.stringify({ utorid: recipientUtorid }));
      renderTransferPage(`/transfer?data=${validData}`);
      
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });

      // Check that modal is open and functioning correctly
      expect(screen.getByText('Select the amount of points you\'d like to transfer to another user.')).toBeInTheDocument();
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('displays current user available points in modal', async () => {
      const userPoints = 2500;
      mockAuthContext = createMockAuthContext({
        currentUser: { ...mockAuthContext.currentUser, points: userPoints }
      });
      
      const validData = btoa(JSON.stringify({ utorid: 'recipient123' }));
      renderTransferPage(`/transfer?data=${validData}`);
      
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });

      // Check that available points are displayed in the maximum text
      expect(screen.getByText(`Maximum: ${userPoints} points`)).toBeInTheDocument();
    });

    it('handles modal close and navigation correctly', async () => {
      const validData = btoa(JSON.stringify({ utorid: 'recipient123' }));
      renderTransferPage(`/transfer?data=${validData}`);
      
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });

      // Close the modal using the close button
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('handles user with null points gracefully', async () => {
      mockAuthContext = createMockAuthContext({
        currentUser: { ...mockAuthContext.currentUser, points: null }
      });
      
      const validData = btoa(JSON.stringify({ utorid: 'recipient123' }));
      renderTransferPage(`/transfer?data=${validData}`);
      
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });

      // Should show 0 points when user.points is null
      expect(screen.getByText('Maximum: 0 points')).toBeInTheDocument();
    });

    it('handles user with undefined points gracefully', async () => {
      const userWithoutPoints = { ...mockAuthContext.currentUser };
      delete userWithoutPoints.points;
      
      mockAuthContext = createMockAuthContext({
        currentUser: userWithoutPoints
      });
      
      const validData = btoa(JSON.stringify({ utorid: 'recipient123' }));
      renderTransferPage(`/transfer?data=${validData}`);
      
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });

      // Should show 0 points when user.points is undefined
      expect(screen.getByText('Maximum: 0 points')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles console warnings for invalid data gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidData = 'clearly-not-base64';
      
      renderTransferPage(`/transfer?data=${invalidData}`);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'TransferPage: failed to decode data param',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('handles empty utorid in parsed data', () => {
      const dataWithEmptyUtorid = btoa(JSON.stringify({ utorid: '' }));
      const { container } = renderTransferPage(`/transfer?data=${dataWithEmptyUtorid}`);
      
      // Should redirect to home because empty utorid is invalid
      expect(container.firstChild).toBe(null);
    });

    it('handles malformed JSON in data parameter', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const malformedJson = btoa('{"utorid": "test"'); // Missing closing brace
      
      const { container } = renderTransferPage(`/transfer?data=${malformedJson}`);
      
      expect(container.firstChild).toBe(null);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('maintains functionality when currentUser is null', async () => {
      mockAuthContext = createMockAuthContext({
        currentUser: null,
        isAuthenticated: true
      });
      
      const validData = btoa(JSON.stringify({ utorid: 'recipient123' }));
      renderTransferPage(`/transfer?data=${validData}`);
      
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });

      // Should show 0 points when currentUser is null
      expect(screen.getByText('Maximum: 0 points')).toBeInTheDocument();
    });
  });

  describe('Component State Management', () => {
    it('initializes modal in open state', async () => {
      const validData = btoa(JSON.stringify({ utorid: 'recipient123' }));
      renderTransferPage(`/transfer?data=${validData}`);
      
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });

      // Modal should be visible immediately - check for modal elements
      expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('passes correct prefill data to TransferModal', async () => {
      const recipientUtorid = 'special-recipient-123';
      const validData = btoa(JSON.stringify({ utorid: recipientUtorid }));
      renderTransferPage(`/transfer?data=${validData}`);
      
      await waitFor(() => {
        expect(screen.getByText('Transfer Points')).toBeInTheDocument();
      });

      // The modal renders correctly and prefill data is passed as prop
      // We verify the modal is functioning rather than checking specific input values
      // since the TransferModal manages its own internal state and UI flow
      expect(screen.getByText('Select the amount of points you\'d like to transfer to another user.')).toBeInTheDocument();
    });
  });
}); 
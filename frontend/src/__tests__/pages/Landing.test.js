import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from '../../pages/Landing';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, className, ...props }) => <section className={className} {...props}>{children}</section>,
    div: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
  },
}));

// Mock useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  QrCode: () => <div data-testid="qr-code-icon">QR</div>,
  Gift: () => <div data-testid="gift-icon">Gift</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  ShoppingCart: () => <div data-testid="shopping-cart-icon">Cart</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">Chevron</div>,
  CreditCard: () => <div data-testid="credit-card-icon">Card</div>,
  Trophy: () => <div data-testid="trophy-icon">Trophy</div>,
  Smartphone: () => <div data-testid="smartphone-icon">Phone</div>,
}));

// Mock window.location
const mockLocation = {
  hostname: 'test.pointpulse.com',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Landing Page', () => {
  beforeEach(() => {
    // Reset window.location mock
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });
    
    // Reset useAuth mock
    const { useAuth } = require('../../contexts/AuthContext');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      currentUser: null,
      loading: false,
      activeRole: null,
      login: jest.fn(),
      logout: jest.fn(),
      updateCurrentUser: jest.fn(),
      switchRole: jest.fn(),
      requestPasswordReset: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
    });
  });

  describe('Landing Page Rendering', () => {
    it('should render landing page content', () => {
      renderWithProviders(<Landing />);
      
      // Test basic page rendering
      expect(screen.getByText(/Your points/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });
  });
}); 
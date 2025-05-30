/**
 * Core User Flow: User authentication and login workflow
 * Tests login form submission, error handling, and navigation behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../../pages/auth/Login';

// Mock AuthContext with different states
const mockAuthContext = {
  login: jest.fn(),
  isAuthenticated: false,
  loading: false
};

const mockNavigate = jest.fn();

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ 
    state: null, 
    search: '' 
  })
}));

// Mock components to avoid complex dependencies
jest.mock('../../../components/common/LoadingSpinner', () => ({ text }) => (
  <div data-testid="loading-spinner">{text}</div>
));

jest.mock('../../../components/common/AnimatedLogo', () => () => (
  <div data-testid="animated-logo">PointPulse</div>
));

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
};

describe('Login - User Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.loading = false;
    mockAuthContext.login = jest.fn();
  });

  test('renders login form with required fields', () => {
    renderLogin();
    
    expect(screen.getByTestId('animated-logo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('UTORid')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('handles successful login workflow', async () => {
    mockAuthContext.login.mockResolvedValue({ success: true });
    
    renderLogin();
    
    // Fill in credentials
    fireEvent.change(screen.getByPlaceholderText('UTORid'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  test('displays error message for failed login', async () => {
    mockAuthContext.login.mockResolvedValue({ 
      success: false, 
      error: { status: 401 }
    });
    
    renderLogin();
    
    // Fill and submit
    fireEvent.change(screen.getByPlaceholderText('UTORid'), {
      target: { value: 'invaliduser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/incorrect utorid or password/i)).toBeInTheDocument();
    });
  });

  test('validates required fields before submission', async () => {
    renderLogin();
    
    // Try to submit without filling fields
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter both UTORid and password')).toBeInTheDocument();
    });
    
    expect(mockAuthContext.login).not.toHaveBeenCalled();
  });

  test('toggles password visibility', () => {
    renderLogin();
    
    const passwordInput = screen.getByPlaceholderText('Password');
    const toggleButton = screen.getByLabelText(/show password/i);
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('shows navigation links for account actions', () => {
    renderLogin();
    
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText('Activate Account')).toBeInTheDocument();
  });

  test('redirects already authenticated users', async () => {
    mockAuthContext.isAuthenticated = true;
    
    renderLogin();
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  test('displays loading state during authentication check', () => {
    mockAuthContext.loading = true;
    
    renderLogin();
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Checking login status...')).toBeInTheDocument();
  });

  test('handles network error during login', async () => {
    mockAuthContext.login.mockResolvedValue({ 
      success: false, 
      error: { message: 'Network error occurred' }
    });
    
    renderLogin();
    
    fireEvent.change(screen.getByPlaceholderText('UTORid'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });
  });

  test('trims and lowercases UTORid before submission', async () => {
    mockAuthContext.login.mockResolvedValue({ success: true });
    
    renderLogin();
    
    fireEvent.change(screen.getByPlaceholderText('UTORid'), {
      target: { value: '  TestUser  ' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('testuser', 'password123');
    });
  });
}); 
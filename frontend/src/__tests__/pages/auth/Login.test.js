/**
 * Core User Flow: Email-based authentication and login workflow
 * Tests email login form submission, OTP verification, error handling, and navigation behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../../pages/auth/Login';
import authService from '../../../services/auth.service';

// Mock AuthContext with different states
const mockAuthContext = {
  emailLogin: jest.fn(),
  isAuthenticated: false,
  loading: false
};

const mockNavigate = jest.fn();

// Mock AuthService for email login functionality
jest.mock('../../../services/auth.service', () => ({
  __esModule: true,
  default: {
    requestEmailLogin: jest.fn(),
    isValidUofTEmail: jest.fn()
  }
}));

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

describe('Login - Email Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.loading = false;
    mockAuthContext.emailLogin = jest.fn();
    authService.requestEmailLogin = jest.fn();
    authService.isValidUofTEmail = jest.fn();
  });

  test('renders email login form with required fields', () => {
    renderLogin();
    
    expect(screen.getByTestId('animated-logo')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Enter your University of Toronto email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.email@mail.utoronto.ca')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send verification code/i })).toBeInTheDocument();
  });

  test('handles successful email submission', async () => {
    authService.isValidUofTEmail.mockReturnValue(true);
    authService.requestEmailLogin.mockResolvedValue({ message: 'Email sent' });
    
    renderLogin();
    
    // Fill in email
    fireEvent.change(screen.getByPlaceholderText('your.email@mail.utoronto.ca'), {
      target: { value: 'test@mail.utoronto.ca' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    
    await waitFor(() => {
      expect(authService.requestEmailLogin).toHaveBeenCalledWith('test@mail.utoronto.ca');
      expect(screen.getByText('Step 2: Enter verification code')).toBeInTheDocument();
    });
  });

  test('displays error message for failed OTP verification', async () => {
    authService.isValidUofTEmail.mockReturnValue(true);
    authService.requestEmailLogin.mockResolvedValue({ message: 'Email sent' });
    mockAuthContext.emailLogin.mockResolvedValue({ 
      success: false, 
      error: { message: 'Invalid verification code. Please check your code and try again.' }
    });
    
    renderLogin();
    
    // Fill email and proceed to OTP step
    fireEvent.change(screen.getByPlaceholderText('your.email@mail.utoronto.ca'), {
      target: { value: 'test@mail.utoronto.ca' }
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter verification code')).toBeInTheDocument();
    });
    
    // Fill OTP and submit
    fireEvent.change(screen.getByPlaceholderText('000000'), {
      target: { value: '123456' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /verify & login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid verification code/i)).toBeInTheDocument();
    });
  });

  test('validates email field before submission', async () => {
    authService.isValidUofTEmail.mockReturnValue(false);
    
    renderLogin();
    
    // Try to submit with invalid email
    fireEvent.change(screen.getByPlaceholderText('your.email@mail.utoronto.ca'), {
      target: { value: 'invalid@gmail.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/please use a valid university of toronto email/i)).toBeInTheDocument();
    });
    
    expect(authService.requestEmailLogin).not.toHaveBeenCalled();
  });

  test('validates empty email field', async () => {
    renderLogin();
    
    // Try to submit without filling email
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
    });
    
    expect(authService.requestEmailLogin).not.toHaveBeenCalled();
  });

  test('validates OTP field before submission', async () => {
    authService.isValidUofTEmail.mockReturnValue(true);
    authService.requestEmailLogin.mockResolvedValue({ message: 'Email sent' });
    
    renderLogin();
    
    // Fill email and proceed to OTP step
    fireEvent.change(screen.getByPlaceholderText('your.email@mail.utoronto.ca'), {
      target: { value: 'test@mail.utoronto.ca' }
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter verification code')).toBeInTheDocument();
    });
    
    // Try to submit without OTP
    fireEvent.click(screen.getByRole('button', { name: /verify & login/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter the verification code')).toBeInTheDocument();
    });
    
    expect(mockAuthContext.emailLogin).not.toHaveBeenCalled();
  });

  test('shows navigation link for account activation', () => {
    renderLogin();
    
    expect(screen.getByText('Need to activate your account?')).toBeInTheDocument();
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

  test('handles network error during email request', async () => {
    authService.isValidUofTEmail.mockReturnValue(true);
    authService.requestEmailLogin.mockRejectedValue(new Error('Network error occurred'));
    
    renderLogin();
    
    fireEvent.change(screen.getByPlaceholderText('your.email@mail.utoronto.ca'), {
      target: { value: 'test@mail.utoronto.ca' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });
  });

  test('handles successful complete login workflow', async () => {
    authService.isValidUofTEmail.mockReturnValue(true);
    authService.requestEmailLogin.mockResolvedValue({ message: 'Email sent' });
    mockAuthContext.emailLogin.mockResolvedValue({ success: true });
    
    renderLogin();
    
    // Step 1: Fill email and send verification code
    fireEvent.change(screen.getByPlaceholderText('your.email@mail.utoronto.ca'), {
      target: { value: 'test@mail.utoronto.ca' }
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter verification code')).toBeInTheDocument();
    });
    
    // Step 2: Fill OTP and verify
    fireEvent.change(screen.getByPlaceholderText('000000'), {
      target: { value: '123456' }
    });
    fireEvent.click(screen.getByRole('button', { name: /verify & login/i }));
    
    await waitFor(() => {
      expect(mockAuthContext.emailLogin).toHaveBeenCalledWith('test@mail.utoronto.ca', '123456');
    });
  });

  test('allows only numeric input for OTP field', async () => {
    authService.isValidUofTEmail.mockReturnValue(true);
    authService.requestEmailLogin.mockResolvedValue({ message: 'Email sent' });
    
    renderLogin();
    
    // Fill email and proceed to OTP step
    fireEvent.change(screen.getByPlaceholderText('your.email@mail.utoronto.ca'), {
      target: { value: 'test@mail.utoronto.ca' }
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter verification code')).toBeInTheDocument();
    });
    
    const otpInput = screen.getByPlaceholderText('000000');
    
    // Try to input non-numeric characters
    fireEvent.change(otpInput, {
      target: { value: 'abc123' }
    });
    
    // Should only contain numeric characters
    expect(otpInput.value).toBe('123');
  });

  test('shows back button and allows return to email step', async () => {
    authService.isValidUofTEmail.mockReturnValue(true);
    authService.requestEmailLogin.mockResolvedValue({ message: 'Email sent' });
    
    renderLogin();
    
    // Fill email and proceed to OTP step
    fireEvent.change(screen.getByPlaceholderText('your.email@mail.utoronto.ca'), {
      target: { value: 'test@mail.utoronto.ca' }
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter verification code')).toBeInTheDocument();
    });
    
    // Click back button
    fireEvent.click(screen.getByRole('button', { name: /back to email/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Step 1: Enter your University of Toronto email')).toBeInTheDocument();
    });
  });
}); 
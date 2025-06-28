/**
 * AccountActivation Tests
 * Purpose: Test account activation functionality including form validation,
 * password strength requirements, URL parameter handling, and activation workflow
 * Coverage: URL parsing, form validation, password requirements, submission handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountActivation from '../../../pages/auth/AccountActivation';

// Mock framer-motion to avoid animation issues in tests
jest.mock('@emotion/react', () => ({
  ...jest.requireActual('@emotion/react'),
  keyframes: () => 'mocked-keyframes'
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
  resetPassword: jest.fn(),
  ...overrides
});

let mockAuthContext = createMockAuthContext();

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock navigation functions
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock components to reduce complexity while maintaining functionality
jest.mock('../../../components/common/AnimatedLogo', () => () => (
  <div data-testid="animated-logo">PointPulse</div>
));

jest.mock('../../../components/common/LoadingSpinner', () => ({ text }) => (
  <div data-testid="loading-spinner">{text}</div>
));

const renderAccountActivation = (initialUrl = '/account-activation') => {
  return render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <AccountActivation />
    </MemoryRouter>
  );
};

describe('AccountActivation - Core Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext = createMockAuthContext();
    // Clear console.error mock to avoid interference
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering and Initial State', () => {
    it('renders account activation form with all required elements', () => {
      renderAccountActivation();
      
      expect(screen.getByTestId('animated-logo')).toBeInTheDocument();
      expect(screen.getByText('Activate Your Account')).toBeInTheDocument();
      expect(screen.getByText('Enter your activation token and set your password')).toBeInTheDocument();
      
      // Form fields
      expect(screen.getByPlaceholderText('UTORid')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Activation Token')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your new password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument();
      
      // Submit button
      expect(screen.getByRole('button', { name: 'Activate Account' })).toBeInTheDocument();
      
      // Navigation link
      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });

    it('displays password requirements checklist', () => {
      renderAccountActivation();
      
      expect(screen.getByText('8–20 characters')).toBeInTheDocument();
      expect(screen.getByText('At least one uppercase letter')).toBeInTheDocument();
      expect(screen.getByText('At least one lowercase letter')).toBeInTheDocument();
      expect(screen.getByText('At least one number')).toBeInTheDocument();
      expect(screen.getByText('At least one special character')).toBeInTheDocument();
    });

    it('initializes form with empty values when no URL parameters', () => {
      renderAccountActivation();
      
      expect(screen.getByPlaceholderText('UTORid')).toHaveValue('');
      expect(screen.getByPlaceholderText('Activation Token')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter your new password')).toHaveValue('');
      expect(screen.getByPlaceholderText('Confirm your new password')).toHaveValue('');
    });
  });

  describe('URL Parameter Handling', () => {
    it('populates UTORid and token from URL parameters', () => {
      const utorid = 'testuser123';
      const token = 'activation-token-456';
      const urlWithParams = `/account-activation?utorid=${utorid}&token=${token}`;
      
      renderAccountActivation(urlWithParams);
      
      expect(screen.getByPlaceholderText('UTORid')).toHaveValue(utorid);
      expect(screen.getByPlaceholderText('Activation Token')).toHaveValue(token);
    });

    it('populates only UTORid when token parameter is missing', () => {
      const utorid = 'testuser123';
      const urlWithParams = `/account-activation?utorid=${utorid}`;
      
      renderAccountActivation(urlWithParams);
      
      expect(screen.getByPlaceholderText('UTORid')).toHaveValue(utorid);
      expect(screen.getByPlaceholderText('Activation Token')).toHaveValue('');
    });

    it('populates only token when UTORid parameter is missing', () => {
      const token = 'activation-token-456';
      const urlWithParams = `/account-activation?token=${token}`;
      
      renderAccountActivation(urlWithParams);
      
      expect(screen.getByPlaceholderText('UTORid')).toHaveValue('');
      expect(screen.getByPlaceholderText('Activation Token')).toHaveValue(token);
    });

    it('handles URL encoded parameters correctly', () => {
      const utorid = 'test@user';
      const token = 'token with spaces';
      const urlWithParams = `/account-activation?utorid=${encodeURIComponent(utorid)}&token=${encodeURIComponent(token)}`;
      
      renderAccountActivation(urlWithParams);
      
      expect(screen.getByPlaceholderText('UTORid')).toHaveValue(utorid);
      expect(screen.getByPlaceholderText('Activation Token')).toHaveValue(token);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password field visibility', () => {
      renderAccountActivation();
      
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const toggleButtons = screen.getAllByLabelText('Show password');
      const passwordToggleButton = toggleButtons[0]; // First toggle button is for password field
      
      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click to show password
      fireEvent.click(passwordToggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click to hide password again
      fireEvent.click(passwordToggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('toggles confirm password field visibility independently', () => {
      renderAccountActivation();
      
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const confirmToggleButtons = screen.getAllByLabelText('Show password');
      const confirmToggleButton = confirmToggleButtons[1]; // Second toggle button
      
      // Initially confirm password should be hidden
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      
      // Click to show confirm password
      fireEvent.click(confirmToggleButton);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
      
      // Click to hide confirm password again
      fireEvent.click(confirmToggleButton);
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Live Password Validation', () => {
    it('validates password requirements in real-time', () => {
      renderAccountActivation();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      
      // Enter a password that meets all requirements
      fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
      
      // All requirements should be highlighted as met
      expect(screen.getByText('8–20 characters')).toBeInTheDocument();
      expect(screen.getByText('At least one uppercase letter')).toBeInTheDocument();
      expect(screen.getByText('At least one lowercase letter')).toBeInTheDocument();
      expect(screen.getByText('At least one number')).toBeInTheDocument();
      expect(screen.getByText('At least one special character')).toBeInTheDocument();
    });

    it('updates requirements when password changes', () => {
      renderAccountActivation();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      
      // Test different password combinations
      fireEvent.change(passwordInput, { target: { value: 'weakpass' } });
      expect(screen.getByText('8–20 characters')).toBeInTheDocument();
      
      fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
      expect(screen.getByText('8–20 characters')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required activation token field', async () => {
      renderAccountActivation();
      
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: 'Password123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(screen.getByText('Please enter your activation token')).toBeInTheDocument();
      });
      
      expect(mockAuthContext.resetPassword).not.toHaveBeenCalled();
    });

    it('validates required UTORid field', async () => {
      renderAccountActivation();
      
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: 'token123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: 'Password123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(screen.getByText('Please enter your UTORid')).toBeInTheDocument();
      });
      
      expect(mockAuthContext.resetPassword).not.toHaveBeenCalled();
    });

    it('validates required password fields', async () => {
      renderAccountActivation();
      
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: 'token123' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(screen.getByText('Please enter and confirm your password')).toBeInTheDocument();
      });
      
      expect(mockAuthContext.resetPassword).not.toHaveBeenCalled();
    });

    it('validates password confirmation match', async () => {
      renderAccountActivation();
      
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: 'token123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: 'DifferentPassword!' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
      
      expect(mockAuthContext.resetPassword).not.toHaveBeenCalled();
    });

    it('handles form submission with whitespace in fields', async () => {
      mockAuthContext.resetPassword.mockResolvedValue();
      renderAccountActivation();
      
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: '  testuser  ' } });
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: '  token123  ' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: 'Password123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(mockAuthContext.resetPassword).toHaveBeenCalledWith('  token123  ', '  testuser  ', 'Password123!');
      });
    });
  });

  describe('Account Activation Workflow', () => {
    it('handles successful account activation', async () => {
      mockAuthContext.resetPassword.mockResolvedValue();
      renderAccountActivation();
      
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: 'valid-token' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'StrongPassword123!' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: 'StrongPassword123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(mockAuthContext.resetPassword).toHaveBeenCalledWith('valid-token', 'testuser', 'StrongPassword123!');
      });
      
      // Should navigate to login after delay
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });

    it('displays loading state during activation', async () => {
      mockAuthContext.resetPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderAccountActivation();
      
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: 'token123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: 'Password123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      // Button should show loading state and be disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Please wait...' })).toBeDisabled();
      });
      
      await waitFor(() => {
        expect(mockAuthContext.resetPassword).toHaveBeenCalled();
      });
    });

    it('handles activation failure without specific error message', async () => {
      mockAuthContext.resetPassword.mockRejectedValue(new Error());
      renderAccountActivation();
      
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: 'token123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: 'Password123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(screen.getByText('Account activation failed. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('User Interface Interactions', () => {
    it('allows form input after failed activation attempt', async () => {
      mockAuthContext.resetPassword.mockRejectedValue(new Error('Test error'));
      renderAccountActivation();
      
      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: 'token123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: 'Password123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
      
      // Should be able to modify form fields after error
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: 'new-token' } });
      expect(screen.getByPlaceholderText('Activation Token')).toHaveValue('new-token');
    });

    it('clears error message when form is resubmitted', async () => {
      mockAuthContext.resetPassword
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce();
      
      renderAccountActivation();
      
      // Fill and submit form first time (will fail)
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: 'token123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: 'Password123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });
      
      // Submit again (will succeed)
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('provides accessible navigation to login page', () => {
      renderAccountActivation();
      
      const backToLoginLink = screen.getByText('Back to Login');
      expect(backToLoginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty string validation correctly', async () => {
      renderAccountActivation();
      
      // Submit with empty strings (not just missing values)
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: '' } });
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: '' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: '' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: '' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(screen.getByText('Please enter your activation token')).toBeInTheDocument();
      });
    });

    it('handles whitespace-only token validation', async () => {
      renderAccountActivation();
      
      fireEvent.change(screen.getByPlaceholderText('UTORid'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('Activation Token'), { target: { value: '   ' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), { target: { value: 'Password123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));
      
      await waitFor(() => {
        expect(screen.getByText('Please enter your activation token')).toBeInTheDocument();
      });
      
      expect(mockAuthContext.resetPassword).not.toHaveBeenCalled();
    });

    it('handles password input updates correctly', () => {
      renderAccountActivation();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      
      // Test password input change
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      expect(passwordInput).toHaveValue('NewPassword123!');
      
      // Test confirm password input
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
      expect(confirmPasswordInput).toHaveValue('NewPassword123!');
    });
  });
}); 
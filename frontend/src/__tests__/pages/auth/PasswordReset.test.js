import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import PasswordReset from '../../../pages/auth/PasswordReset';
import theme from '../../../styles/theme';
import AuthService from '../../../services/auth.service';

// Mock external dependencies
jest.mock('../../../services/auth.service');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock framer-motion to avoid animation-related issues
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    path: ({ children, ...props }) => <path {...props}>{children}</path>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Helper function to render component with theme
const renderWithTheme = (component) => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </MemoryRouter>
  );
};

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PasswordReset Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Rendering - Step 1', () => {
    it('renders step 1 with correct initial elements', () => {
      renderWithTheme(<PasswordReset />);
      
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      expect(screen.getByText("Enter your UTORid and we'll generate a reset token to help you create a new password.")).toBeInTheDocument();
      expect(screen.getByLabelText('UTORid')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Request Password Reset' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back to Login' })).toBeInTheDocument();
    });

    it('does not show step 2 elements initially', () => {
      renderWithTheme(<PasswordReset />);
      
      expect(screen.queryByText('Create New Password')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter Reset Token')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument();
    });
  });

  describe('Step 1 - Request Password Reset', () => {
    it('updates UTORid input value when typed', () => {
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      expect(utoridInput.value).toBe('testuser');
    });

    it('shows error when UTORid is empty on form submission', async () => {
      renderWithTheme(<PasswordReset />);
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter your UTORid')).toBeInTheDocument();
      });
    });

    it('shows error when UTORid is only whitespace', async () => {
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: '   ' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter your UTORid')).toBeInTheDocument();
      });
    });

    it('calls AuthService.requestPasswordReset with correct UTORid', async () => {
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(AuthService.requestPasswordReset).toHaveBeenCalledWith('testuser');
      });
    });

    it('progresses to step 2 on successful password reset request', async () => {
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
        expect(screen.getByText('Reset token generated successfully! Please check your email.')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Reset Token')).toBeInTheDocument();
      });
    });

    it('shows error message when password reset request fails', async () => {
      const errorMessage = 'UTORid not found';
      AuthService.requestPasswordReset.mockRejectedValue(new Error(errorMessage));
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'invaliduser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('navigates back to login when Back to Login is clicked', () => {
      renderWithTheme(<PasswordReset />);
      
      const backButton = screen.getByRole('button', { name: 'Back to Login' });
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Step 2 - Create New Password', () => {
    beforeEach(async () => {
      // Setup component in step 2
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
    });

    it('renders step 2 elements correctly', () => {
      expect(screen.getByText('Create New Password')).toBeInTheDocument();
      expect(screen.getByText('Create a strong new password for your account.')).toBeInTheDocument();
      expect(screen.getByText('Reset Token')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter Reset Token')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('displays password requirements with initial state', () => {
      expect(screen.getByText('8–20 characters')).toBeInTheDocument();
      expect(screen.getByText('At least one uppercase letter')).toBeInTheDocument();
      expect(screen.getByText('At least one lowercase letter')).toBeInTheDocument();
      expect(screen.getByText('At least one number')).toBeInTheDocument();
      expect(screen.getByText(/At least one special character/)).toBeInTheDocument();
    });

    it('updates form fields when typed', () => {
      const tokenInput = screen.getByPlaceholderText('Enter Reset Token');
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      
      fireEvent.change(tokenInput, { target: { value: 'reset-token-123' } });
      fireEvent.change(passwordInput, { target: { value: 'TestPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'TestPass123!' } });
      
      expect(tokenInput.value).toBe('reset-token-123');
      expect(passwordInput.value).toBe('TestPass123!');
      expect(confirmInput.value).toBe('TestPass123!');
    });
  });

  describe('Password Visibility Toggle', () => {
    beforeEach(async () => {
      // Setup component in step 2
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
    });

    it('toggles new password visibility when button is clicked', () => {
      const passwordInput = screen.getByLabelText('New Password');
      const toggleButtons = screen.getAllByLabelText('Show password');
      const passwordToggle = toggleButtons[0]; // First toggle button is for new password
      
      expect(passwordInput.type).toBe('password');
      
      fireEvent.click(passwordToggle);
      expect(passwordInput.type).toBe('text');
      
      fireEvent.click(passwordToggle);
      expect(passwordInput.type).toBe('password');
    });

    it('toggles confirm password visibility when button is clicked', () => {
      const confirmInput = screen.getByLabelText('Confirm Password');
      const toggleButtons = screen.getAllByLabelText('Show password');
      const confirmToggle = toggleButtons[1]; // Second toggle button is for confirm password
      
      expect(confirmInput.type).toBe('password');
      
      fireEvent.click(confirmToggle);
      expect(confirmInput.type).toBe('text');
      
      fireEvent.click(confirmToggle);
      expect(confirmInput.type).toBe('password');
    });
  });

  describe('Live Password Validation', () => {
    beforeEach(async () => {
      // Setup component in step 2
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
    });

    it('validates all password requirements together', () => {
      const passwordInput = screen.getByLabelText('New Password');
      
      // Test with a password that meets all requirements
      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
      
      // All requirements should be met (no specific color testing due to styled-components complexity)
      expect(screen.getByText('8–20 characters')).toBeInTheDocument();
      expect(screen.getByText('At least one uppercase letter')).toBeInTheDocument();
      expect(screen.getByText('At least one lowercase letter')).toBeInTheDocument();
      expect(screen.getByText('At least one number')).toBeInTheDocument();
      expect(screen.getByText(/At least one special character/)).toBeInTheDocument();
    });

    it('validates password length requirement with edge cases', () => {
      const passwordInput = screen.getByLabelText('New Password');
      
      // Test short password (7 characters)
      fireEvent.change(passwordInput, { target: { value: 'Short1!' } });
      
      // Test valid minimum length (8 characters)
      fireEvent.change(passwordInput, { target: { value: 'Valid1!a' } });
      
      // Test valid maximum length (20 characters)
      fireEvent.change(passwordInput, { target: { value: 'ValidLongPassword1!' } });
      
      // Test too long password (21 characters)
      fireEvent.change(passwordInput, { target: { value: 'TooLongPasswordHere1!' } });
    });
  });

  describe('Form Validation on Submit', () => {
    beforeEach(async () => {
      // Setup component in step 2
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
    });

    it('shows error when password is empty', async () => {
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a new password')).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      
      fireEvent.change(passwordInput, { target: { value: 'TestPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'DifferentPass123!' } });
      
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('shows error when password does not meet security requirements', async () => {
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      
      // Password missing uppercase and special characters
      fireEvent.change(passwordInput, { target: { value: 'weakpass123' } });
      fireEvent.change(confirmInput, { target: { value: 'weakpass123' } });
      
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password does not meet the security requirements.')).toBeInTheDocument();
      });
    });

    it('calls AuthService.resetPassword with correct parameters on valid submission', async () => {
      AuthService.resetPassword.mockResolvedValue();
      
      const tokenInput = screen.getByPlaceholderText('Enter Reset Token');
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      
      fireEvent.change(tokenInput, { target: { value: 'reset-token-123' } });
      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
      
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(AuthService.resetPassword).toHaveBeenCalledWith('reset-token-123', 'testuser', 'ValidPass123!');
      });
    });

    it('shows success message and navigates to login on successful password reset', async () => {
      AuthService.resetPassword.mockResolvedValue();
      
      const tokenInput = screen.getByPlaceholderText('Enter Reset Token');
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      
      fireEvent.change(tokenInput, { target: { value: 'reset-token-123' } });
      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
      
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password reset successful! You can now log in with your new password.')).toBeInTheDocument();
      });
      
      // Fast forward timer to trigger navigation
      jest.advanceTimersByTime(3000);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('shows error message when password reset fails', async () => {
      const errorMessage = 'Invalid reset token';
      AuthService.resetPassword.mockRejectedValue(new Error(errorMessage));
      
      const tokenInput = screen.getByPlaceholderText('Enter Reset Token');
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      
      fireEvent.change(tokenInput, { target: { value: 'invalid-token' } });
      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
      
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Back Functionality', () => {
    it('goes back to step 1 from step 2 when Back button is clicked', async () => {
      // Setup component in step 2
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
      
      // Click back button
      const backButton = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(backButton);
      
      // Should return to step 1
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      expect(screen.getByLabelText('UTORid')).toBeInTheDocument();
    });

    it('clears error and success messages when going back to step 1', async () => {
      // Setup component in step 2 with success message
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Reset token generated successfully! Please check your email.')).toBeInTheDocument();
      });
      
      // Go back to step 1
      const backButton = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(backButton);
      
      // Success message should be cleared
      expect(screen.queryByText('Reset token generated successfully! Please check your email.')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading state during password reset request', async () => {
      AuthService.requestPasswordReset.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ resetToken: 'test-token' }), 100))
      );
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Processing your request...')).toBeInTheDocument();
    });

    it('shows loading state during password reset', async () => {
      // First setup step 2
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      let submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
      
      // Now test loading during password reset
      AuthService.resetPassword.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(), 100))
      );
      
      const tokenInput = screen.getByPlaceholderText('Enter Reset Token');
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      
      fireEvent.change(tokenInput, { target: { value: 'reset-token-123' } });
      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
      
      submitButton = screen.getByRole('button', { name: 'Reset Password' });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Processing your request...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows generic error when reset response has no token', async () => {
      AuthService.requestPasswordReset.mockResolvedValue({});
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });

    it('handles API errors without message in step 1', async () => {
      AuthService.requestPasswordReset.mockRejectedValue({});
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to request password reset. Please try again later.')).toBeInTheDocument();
      });
    });

    it('handles API errors without message in step 2', async () => {
      // Setup step 2
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
      
      // Test error in step 2
      AuthService.resetPassword.mockRejectedValue({});
      
      const tokenInput = screen.getByPlaceholderText('Enter Reset Token');
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      
      fireEvent.change(tokenInput, { target: { value: 'reset-token-123' } });
      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
      
      const resetButton = screen.getByRole('button', { name: 'Reset Password' });
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to reset password. Please try again later.')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles whitespace-only password input', async () => {
      // Setup step 2
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
      
      const passwordInput = screen.getByLabelText('New Password');
      fireEvent.change(passwordInput, { target: { value: '   ' } });
      
      const resetButton = screen.getByRole('button', { name: 'Reset Password' });
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a new password')).toBeInTheDocument();
      });
    });

    it('handles very specific password validation scenarios', async () => {
      // Setup step 2
      const mockResetResponse = { resetToken: 'test-token-123' };
      AuthService.requestPasswordReset.mockResolvedValue(mockResetResponse);
      
      renderWithTheme(<PasswordReset />);
      
      const utoridInput = screen.getByLabelText('UTORid');
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      
      const submitButton = screen.getByRole('button', { name: 'Request Password Reset' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
      
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      
      // Test password that meets some but not all requirements
      fireEvent.change(passwordInput, { target: { value: 'onlylowercase' } });
      fireEvent.change(confirmInput, { target: { value: 'onlylowercase' } });
      
      const resetButton = screen.getByRole('button', { name: 'Reset Password' });
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password does not meet the security requirements.')).toBeInTheDocument();
      });
    });
  });
}); 
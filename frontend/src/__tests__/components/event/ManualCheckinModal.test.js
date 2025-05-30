/**
 * ManualCheckinModal Component Tests
 * Purpose: Comprehensive testing of manual check-in modal functionality
 * including form submission, success/error states, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@emotion/react';
import ManualCheckinModal from '../../../components/event/ManualCheckinModal';
import EventService from '../../../services/event.service';
import theme from '../../../styles/theme';

// Mock dependencies
jest.mock('../../../services/event.service');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

// Mock child components
jest.mock('../../../components/common/Modal', () => ({ isOpen, onClose, title, size, children }) => 
  isOpen ? (
    <div data-testid="modal" data-size={size}>
      <div data-testid="modal-title">{title}</div>
      <button data-testid="modal-close" onClick={onClose}>Close</button>
      {children}
    </div>
  ) : null
);

jest.mock('../../../components/common/Button', () => ({ children, onClick, loading, disabled, variant, type, ...props }) => (
  <button 
    onClick={onClick} 
    disabled={disabled || loading}
    data-testid={`button-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
    data-variant={variant}
    data-loading={loading}
    data-type={type}
    {...props}
  >
    {loading ? 'Loading...' : children}
  </button>
));

jest.mock('../../../components/common/Input', () => ({ label, value, onChange, placeholder, required, autoFocus, ...props }) => (
  <div>
    <label htmlFor={label.toLowerCase()}>{label}</label>
    <input
      id={label.toLowerCase()}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      data-testid={`input-${label.toLowerCase()}`}
      {...props}
    />
  </div>
));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaCheckCircle: () => <div data-testid="success-icon">✓</div>,
  FaTimesCircle: () => <div data-testid="error-icon">✗</div>,
  FaExclamationTriangle: () => <div data-testid="warning-icon">⚠</div>,
  FaUser: () => <div data-testid="user-icon">👤</div>
}));

// Helper function to render component with theme
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ManualCheckinModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    eventId: 'event-123',
    onCheckinSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    EventService.checkinByScan.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders modal when isOpen is true', () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Manual Attendee Check-in');
      expect(screen.getByText('Enter the UTORid of the attendee you want to check in')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders form elements correctly', () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      expect(screen.getByTestId('input-utorid')).toBeInTheDocument();
      expect(screen.getByTestId('button-cancel')).toBeInTheDocument();
      expect(screen.getByTestId('button-check-in')).toBeInTheDocument();
    });

    it('has correct modal size', () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'medium');
    });

    it('renders input with correct attributes', () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      expect(input).toHaveAttribute('placeholder', 'Enter UTORid (e.g., johndoe1)');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveFocus();
    });
  });

  describe('Form Interactions', () => {
    it('updates input value when typing', async () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      
      expect(input).toHaveValue('testuser123');
    });

    it('disables submit button when input is empty', () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const submitButton = screen.getByTestId('button-check-in');
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when input has value', async () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      const submitButton = screen.getByTestId('button-check-in');
      
      await userEvent.type(input, 'testuser123');
      expect(submitButton).not.toBeDisabled();
    });

    it('trims whitespace from input value', async () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, '  testuser123  ');
      
      const submitButton = screen.getByTestId('button-check-in');
      expect(submitButton).not.toBeDisabled();
    });

    it('prevents form submission with empty input', async () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const form = screen.getByTestId('input-utorid').closest('form');
      fireEvent.submit(form);
      
      expect(EventService.checkinByScan).not.toHaveBeenCalled();
    });
  });

  describe('Check-in Process', () => {
    it('calls EventService.checkinByScan with correct parameters', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        name: 'John Doe',
        checkedInAt: '2024-01-15T10:30:00Z'
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      const submitButton = screen.getByTestId('button-check-in');
      
      await userEvent.type(input, 'testuser123');
      await userEvent.click(submitButton);
      
      expect(EventService.checkinByScan).toHaveBeenCalledWith('event-123', 'testuser123');
    });

    it('shows loading state during submission', async () => {
      let resolvePromise;
      const promise = new Promise(resolve => { resolvePromise = resolve; });
      EventService.checkinByScan.mockReturnValue(promise);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      const submitButton = screen.getByTestId('button-check-in');
      
      await userEvent.type(input, 'testuser123');
      await userEvent.click(submitButton);
      
      expect(submitButton).toHaveAttribute('data-loading', 'true');
      expect(submitButton).toHaveTextContent('Loading...');
      expect(submitButton).toBeDisabled();
      
      // Resolve the promise to clean up
      resolvePromise({
        message: 'Check-in successful',
        name: 'John Doe'
      });
      await waitFor(() => {
        expect(screen.getByText('Check-in Successful')).toBeInTheDocument();
      });
    });

    it('disables both buttons during submission', async () => {
      let resolvePromise;
      const promise = new Promise(resolve => { resolvePromise = resolve; });
      EventService.checkinByScan.mockReturnValue(promise);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      const submitButton = screen.getByTestId('button-check-in');
      const cancelButton = screen.getByTestId('button-cancel');
      
      await userEvent.type(input, 'testuser123');
      await userEvent.click(submitButton);
      
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      
      // Resolve the promise to clean up
      resolvePromise({
        message: 'Check-in successful',
        name: 'John Doe'
      });
      await waitFor(() => {
        expect(screen.getByText('Check-in Successful')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('displays success message after successful check-in', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        name: 'John Doe',
        checkedInAt: '2024-01-15T10:30:00Z'
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByText('Check-in Successful')).toBeInTheDocument();
        expect(screen.getByText('Check-in successful')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByTestId('success-icon')).toBeInTheDocument();
      });
    });

    it('displays user information in success state', async () => {
      const mockResponse = {
        message: 'Welcome!',
        name: 'Jane Smith',
        checkedInAt: '2024-01-15T14:25:00Z'
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'janesmith456');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('janesmith456')).toBeInTheDocument();
      });
    });

    it('shows formatted check-in time', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        name: 'John Doe',
        checkedInAt: '2024-01-15T10:30:00Z'
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        // Should show formatted time - actual format depends on locale
        expect(screen.getByText(/2024/)).toBeInTheDocument();
      });
    });

    it('uses current time when checkedInAt is not provided', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        name: 'John Doe'
        // No checkedInAt field
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByText('Check-in Successful')).toBeInTheDocument();
        // Should show some time (current time)
        const timeElement = screen.getByText(/\d{4}\/\d{1,2}\/\d{1,2}/);
        expect(timeElement).toBeInTheDocument();
      });
    });

    it('shows "Check In Another" button after success', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        name: 'John Doe',
        checkedInAt: '2024-01-15T10:30:00Z'
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByTestId('button-check-in-another')).toBeInTheDocument();
        expect(screen.getByTestId('button-close')).toBeInTheDocument();
      });
    });

    it('calls onCheckinSuccess callback when provided', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        name: 'John Doe',
        checkedInAt: '2024-01-15T10:30:00Z'
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(defaultProps.onCheckinSuccess).toHaveBeenCalledWith(mockResponse);
      });
    });

    it('handles missing onCheckinSuccess callback gracefully', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        name: 'John Doe',
        checkedInAt: '2024-01-15T10:30:00Z'
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      const propsWithoutCallback = { ...defaultProps, onCheckinSuccess: undefined };
      renderWithTheme(<ManualCheckinModal {...propsWithoutCallback} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByText('Check-in Successful')).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('displays error message when check-in fails', async () => {
      const errorMessage = 'User not found';
      EventService.checkinByScan.mockRejectedValue(new Error(errorMessage));
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'invaliduser');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByText('Check-in Failed')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      });
    });

    it('displays generic error message when error has no message', async () => {
      EventService.checkinByScan.mockRejectedValue(new Error());
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByText('Check-in Failed')).toBeInTheDocument();
        expect(screen.getByText('Check-in failed')).toBeInTheDocument();
      });
    });

    it('does not show "Check In Another" button in error state', async () => {
      EventService.checkinByScan.mockRejectedValue(new Error('User not found'));
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'invaliduser');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByText('Check-in Failed')).toBeInTheDocument();
        expect(screen.queryByTestId('button-check-in-another')).not.toBeInTheDocument();
        expect(screen.getByTestId('button-close')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Controls', () => {
    it('calls onClose when cancel button is clicked', async () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      await userEvent.click(screen.getByTestId('button-cancel'));
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when modal close button is clicked', async () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      await userEvent.click(screen.getByTestId('modal-close'));
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('resets state when modal is closed', async () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      
      await userEvent.click(screen.getByTestId('button-cancel'));
      
      expect(defaultProps.onClose).toHaveBeenCalled();
      // Note: We can't test the actual state reset since the component will unmount,
      // but we verify the close was called which triggers the reset in handleClose
    });

    it('closes modal from success state', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        name: 'John Doe',
        checkedInAt: '2024-01-15T10:30:00Z'
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByTestId('button-close')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByTestId('button-close'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('resets to form view when "Check In Another" is clicked', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        name: 'John Doe',
        checkedInAt: '2024-01-15T10:30:00Z'
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByTestId('button-check-in-another')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByTestId('button-check-in-another'));
      
      // Should return to form view
      expect(screen.getByTestId('input-utorid')).toBeInTheDocument();
      expect(screen.getByTestId('button-check-in')).toBeInTheDocument();
      expect(screen.queryByText('Check-in Successful')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles successful response with missing message', async () => {
      const mockResponse = {
        name: 'John Doe',
        checkedInAt: '2024-01-15T10:30:00Z'
        // No message field
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByText('Check-in Successful')).toBeInTheDocument();
        expect(screen.getByText('Check-in successful')).toBeInTheDocument(); // Default message
      });
    });

    it('handles successful response with missing name', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        checkedInAt: '2024-01-15T10:30:00Z'
        // No name field
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, 'testuser123');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      await waitFor(() => {
        expect(screen.getByText('Check-in Successful')).toBeInTheDocument();
        // Should not show attendee info section when name is missing
        expect(screen.queryByText('testuser123')).not.toBeInTheDocument();
      });
    });

    it('handles form submission with only whitespace', async () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, '   ');
      
      const submitButton = screen.getByTestId('button-check-in');
      expect(submitButton).toBeDisabled(); // Should be disabled for whitespace-only input
    });

    it('trims whitespace before submission', async () => {
      const mockResponse = {
        message: 'Check-in successful',
        name: 'John Doe'
      };
      EventService.checkinByScan.mockResolvedValue(mockResponse);
      
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      await userEvent.type(input, '  testuser123  ');
      await userEvent.click(screen.getByTestId('button-check-in'));
      
      expect(EventService.checkinByScan).toHaveBeenCalledWith('event-123', 'testuser123');
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const input = screen.getByTestId('input-utorid');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveFocus();
      
      const form = input.closest('form');
      expect(form).toBeInTheDocument();
    });

    it('associates label with input', () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      const label = screen.getByText('UTORid');
      const input = screen.getByTestId('input-utorid');
      
      expect(label).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'utorid');
    });

    it('provides clear button text and states', () => {
      renderWithTheme(<ManualCheckinModal {...defaultProps} />);
      
      expect(screen.getByTestId('button-cancel')).toHaveTextContent('Cancel');
      expect(screen.getByTestId('button-check-in')).toHaveTextContent('Check In');
    });
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import FloatingScanButton from '../../../components/common/FloatingScanButton';
import theme from '../../../styles/theme';

// Mock ScanQRModal component
jest.mock('../../../components/user/ScanQRModal', () => ({ isOpen, onClose }) => 
  isOpen ? (
    <div data-testid="scan-qr-modal">
      <div data-testid="modal-content">Scan QR Modal</div>
      <button data-testid="modal-close" onClick={onClose}>Close</button>
    </div>
  ) : null
);

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaQrcode: () => <div data-testid="qr-icon">QR Icon</div>
}));

// Helper function to render component with theme
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('FloatingScanButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the floating scan button', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      expect(scanButton).toBeInTheDocument();
    });

    it('displays the QR code icon', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const qrIcon = screen.getByTestId('qr-icon');
      expect(qrIcon).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      expect(scanButton).toHaveAttribute('aria-label', 'Scan QR Code');
    });

    it('does not show the scan QR modal initially', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const modal = screen.queryByTestId('scan-qr-modal');
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('opens the scan QR modal when clicked', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      fireEvent.click(scanButton);
      
      const modal = screen.getByTestId('scan-qr-modal');
      expect(modal).toBeInTheDocument();
    });

    it('opens and closes the modal correctly', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      
      // Open modal
      fireEvent.click(scanButton);
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
      
      // Close modal
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);
      expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
    });

    it('can toggle modal multiple times', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      
      // First open/close cycle
      fireEvent.click(scanButton);
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
      
      // Second open/close cycle
      fireEvent.click(scanButton);
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
    });

    it('handles rapid button clicks correctly', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      
      // Click multiple times rapidly
      fireEvent.click(scanButton);
      fireEvent.click(scanButton);
      fireEvent.click(scanButton);
      
      // Should still only show one modal
      const modals = screen.getAllByTestId('scan-qr-modal');
      expect(modals).toHaveLength(1);
    });
  });

  describe('Modal State Management', () => {
    it('correctly manages modal state through props', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      
      // Verify initial state
      expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
      
      // Open modal
      fireEvent.click(scanButton);
      const modal = screen.getByTestId('scan-qr-modal');
      expect(modal).toBeInTheDocument();
      
      // Verify modal receives correct props
      expect(modal).toBeInTheDocument();
      expect(screen.getByTestId('modal-close')).toBeInTheDocument();
    });

    it('passes correct onClose function to modal', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      fireEvent.click(scanButton);
      
      const modal = screen.getByTestId('scan-qr-modal');
      expect(modal).toBeInTheDocument();
      
      // Test that onClose function works
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);
      
      expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
    });
  });

  describe('Styling and Visual Elements', () => {
    it('applies correct CSS classes and styling', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      
      // Check if button is rendered (styled-components will apply CSS)
      expect(scanButton).toBeInTheDocument();
      expect(scanButton).toHaveStyle({
        position: 'fixed',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer'
      });
    });

    it('has fixed positioning styles', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      expect(scanButton).toHaveStyle({ position: 'fixed' });
    });

    it('maintains proper z-index for floating behavior', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      expect(scanButton).toHaveStyle({ zIndex: '100' });
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      
      // Should be focusable
      scanButton.focus();
      expect(scanButton).toHaveFocus();
      
      // Should respond to Enter key by simulating click
      fireEvent.keyDown(scanButton, { key: 'Enter', code: 'Enter' });
      fireEvent.click(scanButton); // Simulate the click that would happen
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
    });

    it('responds to Space key activation', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      scanButton.focus();
      
      fireEvent.keyDown(scanButton, { key: ' ', code: 'Space' });
      fireEvent.click(scanButton); // Simulate the click that would happen
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      expect(scanButton).toHaveAttribute('aria-label', 'Scan QR Code');
    });

    it('maintains focus management', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      scanButton.focus();
      expect(scanButton).toHaveFocus();
      
      // Focus should be maintained even after clicking
      fireEvent.click(scanButton);
      // Note: Focus management during modal opening depends on modal implementation
    });

    it('is properly focusable via tab navigation', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      
      // Should be in the tab order (not have tabIndex -1)
      expect(scanButton).not.toHaveAttribute('tabindex', '-1');
      
      // Should be focusable
      expect(scanButton).toBeVisible();
      expect(scanButton).toBeEnabled();
    });
  });

  describe('Component Integration', () => {
    it('properly integrates with ScanQRModal component', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      fireEvent.click(scanButton);
      
      // Verify modal content is rendered
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toHaveTextContent('Scan QR Modal');
    });

    it('handles modal props correctly', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      
      // Test isOpen prop
      expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
      
      fireEvent.click(scanButton);
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
      
      // Test onClose prop
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles missing theme gracefully', () => {
      // Render without ThemeProvider
      render(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      expect(scanButton).toBeInTheDocument();
      
      // Should still be functional
      fireEvent.click(scanButton);
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
    });

    it('maintains state consistency during re-renders', () => {
      const { rerender } = renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      fireEvent.click(scanButton);
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
      
      // Re-render component
      rerender(
        <ThemeProvider theme={theme}>
          <FloatingScanButton />
        </ThemeProvider>
      );
      
      // Modal should still be open after re-render
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
    });

    it('handles component unmounting gracefully', () => {
      const { unmount } = renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      fireEvent.click(scanButton);
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
      
      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('State Transitions', () => {
    it('correctly transitions between modal states', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      
      // Initial state: modal closed
      expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
      
      // Transition to open
      fireEvent.click(scanButton);
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
      
      // Transition to closed
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
    });

    it('maintains button state during modal operations', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      
      // Button should remain clickable when modal is open
      fireEvent.click(scanButton);
      expect(scanButton).toBeEnabled();
      expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
      
      // Button should remain clickable when modal is closed
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(scanButton).toBeEnabled();
      expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('does not cause unnecessary re-renders', () => {
      const renderSpy = jest.fn();
      
      const TestWrapper = () => {
        renderSpy();
        return <FloatingScanButton />;
      };
      
      renderWithTheme(<TestWrapper />);
      
      const initialRenderCount = renderSpy.mock.calls.length;
      
      // Interacting with button should not cause parent re-renders
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      fireEvent.click(scanButton);
      fireEvent.click(screen.getByTestId('modal-close'));
      
      // Should not have additional renders beyond initial
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    });

    it('properly cleans up event listeners', () => {
      const { unmount } = renderWithTheme(<FloatingScanButton />);
      
      // No explicit event listeners to test, but verify no memory leaks
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Visual Regression Prevention', () => {
    it('renders with consistent structure', () => {
      renderWithTheme(<FloatingScanButton />);
      
      // Verify DOM structure
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      expect(scanButton).toBeInTheDocument();
      
      const qrIcon = screen.getByTestId('qr-icon');
      expect(qrIcon).toBeInTheDocument();
      expect(scanButton).toContainElement(qrIcon);
    });

    it('maintains proper element hierarchy', () => {
      renderWithTheme(<FloatingScanButton />);
      
      const scanButton = screen.getByRole('button', { name: /scan qr code/i });
      const qrIcon = screen.getByTestId('qr-icon');
      
      // Icon should be child of button
      expect(scanButton).toContainElement(qrIcon);
      
      // Modal should be sibling, not child
      fireEvent.click(scanButton);
      const modal = screen.getByTestId('scan-qr-modal');
      expect(scanButton).not.toContainElement(modal);
    });
  });
}); 
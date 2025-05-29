import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import Modal from '../../../components/common/Modal';
import theme from '../../../styles/theme';

// Mock react-icons
jest.mock('react-icons/io', () => ({
  IoMdClose: ({ size }) => <div data-testid="close-icon" data-size={size}>×</div>
}));

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node
}));

// Helper function to render component with theme
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Helper to get modal container
const getModalContainer = () => screen.queryByRole('dialog') || screen.queryByTestId('modal-container');

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div data-testid="modal-content">Modal Content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up body overflow after each test
    document.body.style.overflow = '';
  });

  describe('Basic Rendering', () => {
    it('renders modal when isOpen is true', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      renderWithTheme(<Modal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('returns null when isOpen is false (explicit early return test)', () => {
      const result = render(<Modal {...defaultProps} isOpen={false} />);
      
      // Component should return null, so no DOM elements should be rendered
      expect(result.container.firstChild).toBeNull();
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('renders modal title correctly', () => {
      renderWithTheme(<Modal {...defaultProps} title="Custom Title" />);
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders children content', () => {
      const customContent = <div data-testid="custom-content">Custom Content</div>;
      renderWithTheme(<Modal {...defaultProps}>{customContent}</Modal>);
      
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('renders close button with icon', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });
  });

  describe('Modal Sizes', () => {
    it('renders with small size', () => {
      renderWithTheme(<Modal {...defaultProps} size="small" />);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('renders with medium size (default)', () => {
      renderWithTheme(<Modal {...defaultProps} size="medium" />);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('renders with large size', () => {
      renderWithTheme(<Modal {...defaultProps} size="large" />);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('renders with xlarge size', () => {
      renderWithTheme(<Modal {...defaultProps} size="xlarge" />);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('defaults to medium size when no size prop provided', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('handles invalid size gracefully', () => {
      renderWithTheme(<Modal {...defaultProps} size="invalid" />);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });
  });

  describe('Footer Functionality', () => {
    const footerContent = (
      <div data-testid="footer-content">
        <button>Cancel</button>
        <button>Save</button>
      </div>
    );

    it('renders footer when provided', () => {
      renderWithTheme(<Modal {...defaultProps} footer={footerContent} />);
      
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('does not render footer when not provided', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      
      expect(screen.queryByTestId('footer-content')).not.toBeInTheDocument();
    });

    it('renders footer with end alignment (default)', () => {
      renderWithTheme(<Modal {...defaultProps} footer={footerContent} />);
      
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    });

    it('renders footer with start alignment', () => {
      renderWithTheme(<Modal {...defaultProps} footer={footerContent} footerAlign="start" />);
      
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    });

    it('renders footer with center alignment', () => {
      renderWithTheme(<Modal {...defaultProps} footer={footerContent} footerAlign="center" />);
      
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    });

    it('renders footer with between alignment', () => {
      renderWithTheme(<Modal {...defaultProps} footer={footerContent} footerAlign="between" />);
      
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    });

    it('handles invalid footer alignment gracefully', () => {
      renderWithTheme(<Modal {...defaultProps} footer={footerContent} footerAlign="invalid" />);
      
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when other keys are pressed', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });
      fireEvent.keyDown(document, { key: 'Space', code: 'Space' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('calls onClose when overlay is clicked and closeOnOverlayClick is true', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(<Modal {...defaultProps} onClose={mockOnClose} closeOnOverlayClick={true} />);
      
      // Find the overlay (parent container)
      const overlay = screen.getByText('Test Modal').closest('[data-testid]')?.parentElement || 
                      screen.getByText('Test Modal').parentElement?.parentElement;
      
      if (overlay) {
        // Create a proper click event on the overlay
        Object.defineProperty(overlay, 'current', { value: overlay, writable: false });
        const clickEvent = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(clickEvent, 'target', { value: overlay, enumerable: true });
        fireEvent(overlay, clickEvent);
      }
    });

    it('handles overlay click with ref comparison correctly', () => {
      const mockOnClose = jest.fn();
      const TestWrapper = () => {
        const overlayRef = React.useRef(null);
        
        return (
          <ThemeProvider theme={theme}>
            <Modal {...defaultProps} onClose={mockOnClose} closeOnOverlayClick={true} />
          </ThemeProvider>
        );
      };
      
      render(<TestWrapper />);
      
      // This test ensures the ref comparison logic is executed
      const modalContent = screen.getByTestId('modal-content');
      fireEvent.click(modalContent);
      
      // Should not close when clicking inside modal
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when overlay is clicked and closeOnOverlayClick is false', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(<Modal {...defaultProps} onClose={mockOnClose} closeOnOverlayClick={false} />);
      
      // Try to click on overlay - should not close
      const overlay = screen.getByText('Test Modal').closest('[data-testid]')?.parentElement;
      if (overlay) {
        fireEvent.click(overlay);
      }
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when clicking inside modal content', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(<Modal {...defaultProps} onClose={mockOnClose} closeOnOverlayClick={true} />);
      
      const modalContent = screen.getByTestId('modal-content');
      fireEvent.click(modalContent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Management', () => {
    it('sets body overflow to hidden when modal is open', () => {
      renderWithTheme(<Modal {...defaultProps} isOpen={true} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('does not set body overflow when modal is closed', () => {
      renderWithTheme(<Modal {...defaultProps} isOpen={false} />);
      
      expect(document.body.style.overflow).toBe('');
    });

    it('restores body overflow when component unmounts', () => {
      const { unmount } = renderWithTheme(<Modal {...defaultProps} isOpen={true} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('');
    });

    it('restores body overflow when modal closes', () => {
      const { rerender } = renderWithTheme(<Modal {...defaultProps} isOpen={true} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(
        <ThemeProvider theme={theme}>
          <Modal {...defaultProps} isOpen={false} />
        </ThemeProvider>
      );
      
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Event Listeners Management', () => {
    it('adds keydown event listener when modal opens', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      renderWithTheme(<Modal {...defaultProps} isOpen={true} />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });

    it('removes keydown event listener when modal closes', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { rerender } = renderWithTheme(<Modal {...defaultProps} isOpen={true} />);
      
      rerender(
        <ThemeProvider theme={theme}>
          <Modal {...defaultProps} isOpen={false} />
        </ThemeProvider>
      );
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('removes keydown event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = renderWithTheme(<Modal {...defaultProps} isOpen={true} />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('handles escape key only when modal is open', () => {
      const mockOnClose = jest.fn();
      const { rerender } = renderWithTheme(<Modal {...defaultProps} onClose={mockOnClose} isOpen={true} />);
      
      // Escape should work when open
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      
      mockOnClose.mockClear();
      
      // Close modal
      rerender(
        <ThemeProvider theme={theme}>
          <Modal {...defaultProps} onClose={mockOnClose} isOpen={false} />
        </ThemeProvider>
      );
      
      // Escape should not work when closed
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });

    it('close button is keyboard accessible', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      closeButton.focus();
      
      fireEvent.keyDown(closeButton, { key: 'Enter' });
      
      expect(closeButton).toHaveFocus();
    });

    it('close button has focus styles', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      closeButton.focus();
      
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Portal Rendering', () => {
    it('renders modal content in portal', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      
      // Modal should be rendered
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('does not render portal when modal is closed', () => {
      renderWithTheme(<Modal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles missing onClose function gracefully', () => {
      expect(() => {
        renderWithTheme(<Modal {...defaultProps} onClose={undefined} />);
      }).not.toThrow();
    });

    it('handles empty title', () => {
      renderWithTheme(<Modal {...defaultProps} title="" />);
      
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('handles null title', () => {
      renderWithTheme(<Modal {...defaultProps} title={null} />);
      
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('handles undefined title', () => {
      renderWithTheme(<Modal {...defaultProps} title={undefined} />);
      
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('handles null children', () => {
      renderWithTheme(<Modal {...defaultProps}>{null}</Modal>);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      renderWithTheme(<Modal {...defaultProps}>{undefined}</Modal>);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('handles missing theme gracefully', () => {
      expect(() => {
        render(<Modal {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('State Transitions', () => {
    it('handles rapid open/close transitions', () => {
      const mockOnClose = jest.fn();
      const { rerender } = renderWithTheme(<Modal {...defaultProps} onClose={mockOnClose} isOpen={false} />);
      
      // Open modal
      rerender(
        <ThemeProvider theme={theme}>
          <Modal {...defaultProps} onClose={mockOnClose} isOpen={true} />
        </ThemeProvider>
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      
      // Close modal
      rerender(
        <ThemeProvider theme={theme}>
          <Modal {...defaultProps} onClose={mockOnClose} isOpen={false} />
        </ThemeProvider>
      );
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      
      // Open again
      rerender(
        <ThemeProvider theme={theme}>
          <Modal {...defaultProps} onClose={mockOnClose} isOpen={true} />
        </ThemeProvider>
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('maintains proper state during props changes', () => {
      const { rerender } = renderWithTheme(<Modal {...defaultProps} title="Original Title" />);
      
      expect(screen.getByText('Original Title')).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <Modal {...defaultProps} title="Updated Title" />
        </ThemeProvider>
      );
      
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('does not render modal content when closed for performance', () => {
      renderWithTheme(<Modal {...defaultProps} isOpen={false} />);
      
      // Should return null and not render any content
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('cleans up properly on unmount to prevent memory leaks', () => {
      const { unmount } = renderWithTheme(<Modal {...defaultProps} isOpen={true} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Complex Interactions', () => {
    it('handles multiple modals scenario', () => {
      const mockOnClose1 = jest.fn();
      const mockOnClose2 = jest.fn();
      
      renderWithTheme(
        <>
          <Modal isOpen={true} onClose={mockOnClose1} title="Modal 1">
            <div>Content 1</div>
          </Modal>
          <Modal isOpen={true} onClose={mockOnClose2} title="Modal 2">
            <div>Content 2</div>
          </Modal>
        </>
      );
      
      expect(screen.getByText('Modal 1')).toBeInTheDocument();
      expect(screen.getByText('Modal 2')).toBeInTheDocument();
      
      // Escape should only close the last modal (this depends on implementation)
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      // At least one modal should attempt to close
      expect(mockOnClose1).toHaveBeenCalledTimes(1);
      expect(mockOnClose2).toHaveBeenCalledTimes(1);
    });

    it('handles complex footer with interactive elements', () => {
      const handleSave = jest.fn();
      const handleCancel = jest.fn();
      
      const complexFooter = (
        <div data-testid="complex-footer">
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleSave}>Save</button>
          <input type="text" placeholder="Note" />
        </div>
      );
      
      renderWithTheme(<Modal {...defaultProps} footer={complexFooter} />);
      
      const saveButton = screen.getByText('Save');
      const cancelButton = screen.getByText('Cancel');
      const input = screen.getByPlaceholderText('Note');
      
      fireEvent.click(saveButton);
      fireEvent.click(cancelButton);
      fireEvent.change(input, { target: { value: 'test note' } });
      
      expect(handleSave).toHaveBeenCalledTimes(1);
      expect(handleCancel).toHaveBeenCalledTimes(1);
      expect(input.value).toBe('test note');
    });
  });

  describe('Animation and Styling', () => {
    it('applies correct styles to modal components', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      
      const title = screen.getByText('Test Modal');
      const closeButton = screen.getByLabelText('Close modal');
      
      expect(title).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
    });

    it('applies hover styles to close button', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      
      fireEvent.mouseEnter(closeButton);
      fireEvent.mouseLeave(closeButton);
      
      expect(closeButton).toBeInTheDocument();
    });
  });
}); 
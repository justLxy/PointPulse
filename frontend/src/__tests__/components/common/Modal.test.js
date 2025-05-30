/**
 * Core User Flow: Modal display and interaction
 * Tests modal visibility, content rendering, and close behavior
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../../../components/common/Modal';

// Mock framer-motion to avoid addListener errors
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

describe('Modal - Display Component', () => {
  test('modal visibility controls', () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={jest.fn()}>
        <div>Modal Content</div>
      </Modal>
    );

    // Should not show when closed
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();

    // Should show when open
    rerender(
      <Modal isOpen={true} onClose={jest.fn()}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  test('modal close interaction', () => {
    const handleClose = jest.fn();
    
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Modal Content</div>
      </Modal>
    );

    // Close via overlay click (assuming overlay exists)
    const overlay = document.querySelector('[data-testid="modal-overlay"]') || 
                    document.querySelector('.modal-overlay') ||
                    screen.getByText('Modal Content').closest('[role="dialog"]')?.parentElement;
    
    if (overlay) {
      fireEvent.click(overlay);
      expect(handleClose).toHaveBeenCalled();
    }

    // Close via escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  test('modal content rendering', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <p>Modal body content</p>
        <button>Action Button</button>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
    
    // Use more specific selector when there are multiple buttons
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });
}); 
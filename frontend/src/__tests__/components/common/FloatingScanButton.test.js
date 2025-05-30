/**
 * Core User Flow: Floating scan button interaction
 * Tests button visibility, click handling, and basic functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock ScanQRModal to avoid emotion styled issues
jest.mock('../../../components/user/ScanQRModal', () => ({ isOpen, onClose }) => 
  isOpen ? (
    <div data-testid="scan-qr-modal">
      <button onClick={onClose}>Close Modal</button>
    </div>
  ) : null
);

// Mock icons to avoid import issues
jest.mock('react-icons/fa', () => ({
  FaQrcode: () => <span data-testid="qr-icon">📱</span>,
}));

// Mock framer-motion to avoid complex animation testing
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}));

import FloatingScanButton from '../../../components/common/FloatingScanButton';

describe('FloatingScanButton - Action Button', () => {
  test('renders button and handles click interaction', () => {
    render(<FloatingScanButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('qr-icon')).toBeInTheDocument();
    
    // Test click functionality - should open modal
    fireEvent.click(button);
    expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
  });

  test('handles modal open/close cycle', () => {
    render(<FloatingScanButton />);
    
    const button = screen.getByRole('button');
    
    // Initially modal should be closed
    expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
    
    // Click to open modal
    fireEvent.click(button);
    expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
    
    // Click close button in modal
    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
  });

  test('handles multiple interactions gracefully', () => {
    render(<FloatingScanButton />);
    
    const button = screen.getByRole('button');
    
    // Multiple clicks should work fine
    fireEvent.click(button);
    expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('scan-qr-modal')).not.toBeInTheDocument();
    
    fireEvent.click(button);
    expect(screen.getByTestId('scan-qr-modal')).toBeInTheDocument();
  });
}); 
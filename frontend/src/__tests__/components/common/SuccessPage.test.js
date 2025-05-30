/**
 * Core User Flow: Success page display and interaction
 * Tests success page rendering, content display, and action button functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SuccessPage from '../../../components/common/SuccessPage';

// Mock theme to avoid styled-components issues
jest.mock('../../../styles/theme', () => ({
  colors: {
    primary: { main: '#007bff' },
    success: { main: '#28a745' },
    text: { primary: '#212529' },
    background: { paper: '#ffffff' },
    border: { light: '#e9ecef' }
  },
  spacing: { md: '16px', lg: '24px' },
  radius: { md: '8px' },
  typography: {
    fontSize: { md: '16px', lg: '18px' },
    fontWeights: { medium: 500, bold: 700 }
  }
}));

// Mock Button component to simplify testing
jest.mock('../../../components/common/Button', () => ({ children, onClick }) => (
  <button onClick={onClick}>{children}</button>
));

describe('SuccessPage - Display Component', () => {
  test('renders basic success page with default content', () => {
    const handleClick = jest.fn();
    
    render(<SuccessPage onButtonClick={handleClick} />);
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Your operation was completed successfully.')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
    
    // Test button interaction
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  test('renders with custom content and details', () => {
    const mockDetails = [
      { label: 'Transaction ID', value: 'TXN-123456' },
      { label: 'Amount', value: '$100.00' }
    ];
    
    render(
      <SuccessPage 
        title="Payment Successful"
        description="Your payment has been processed."
        details={mockDetails}
        buttonText="Go to Dashboard"
      />
    );
    
    expect(screen.getByText('Payment Successful')).toBeInTheDocument();
    expect(screen.getByText('Your payment has been processed.')).toBeInTheDocument();
    expect(screen.getByText('Transaction ID')).toBeInTheDocument();
    expect(screen.getByText('TXN-123456')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
  });

  test('handles details with icons and total amounts', () => {
    const TestIcon = () => <span data-testid="test-icon">💳</span>;
    const detailsWithIcons = [
      { label: 'Card', value: '**** 1234', icon: <TestIcon /> }
    ];
    const total = { label: 'Total Earned', value: '+$150.00', isPositive: true };
    
    render(
      <SuccessPage 
        details={detailsWithIcons}
        total={total}
        cardTitle="Transaction Details"
      />
    );
    
    expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('**** 1234')).toBeInTheDocument();
    expect(screen.getByText('Total Earned')).toBeInTheDocument();
    expect(screen.getByText('+$150.00')).toBeInTheDocument();
  });

  test('handles empty states and edge cases', () => {
    const { rerender } = render(<SuccessPage details={[]} />);
    
    // No details should not show card
    expect(screen.queryByText('Details')).not.toBeInTheDocument();
    
    // Empty strings should hide default content
    rerender(<SuccessPage title="" description="" buttonText="" />);
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
    expect(screen.queryByText('Your operation was completed successfully.')).not.toBeInTheDocument();
  });

  test('handles custom icon and complex interactions', () => {
    const CustomIcon = () => <span data-testid="custom-icon">✓</span>;
    const handleClick = jest.fn();
    
    render(
      <SuccessPage 
        icon={<CustomIcon />}
        onButtonClick={handleClick}
        buttonText="Custom Action"
      />
    );
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    
    // Multiple clicks should work
    const button = screen.getByText('Custom Action');
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
}); 
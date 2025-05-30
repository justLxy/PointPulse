/**
 * Core User Flow: Button component interaction and state management
 * Validates click handling, disabled states, loading states, and basic functionality
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@emotion/react';
import Button from '../../../components/common/Button';

jest.mock('react-icons/fa', () => ({
  FaSpinner: () => <span data-testid="spinner">⏳</span>
}));

const mockTheme = {
  colors: {
    primary: { main: '#3498db', dark: '#2980b9', contrastText: '#ffffff' },
    secondary: { main: '#6c757d', dark: '#545b62', contrastText: '#ffffff' },
    accent: { main: '#e74c3c', dark: '#c0392b', contrastText: '#ffffff' },
    error: { main: '#dc3545', dark: '#bd2130', contrastText: '#ffffff' }
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  typography: { fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, fontWeights: { medium: 500 } },
  radius: { md: '8px' },
  transitions: { quick: '0.2s ease' }
};

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

describe('Button - Interactive Component', () => {
  test('basic button functionality and click handling', async () => {
    const handleClick = jest.fn();
    
    render(
      <TestWrapper>
        <Button onClick={handleClick}>Click Me</Button>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
    
    // Test click interaction
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Test multiple clicks
    fireEvent.click(button);
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  test('disabled state prevents interaction', async () => {
    const handleClick = jest.fn();
    
    render(
      <TestWrapper>
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    // Disabled button should not respond to clicks
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('loading state shows spinner and prevents interaction', async () => {
    const handleClick = jest.fn();
    
    render(
      <TestWrapper>
        <Button onClick={handleClick} loading>
          Loading Button
        </Button>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    
    // Loading button should not respond to clicks
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('button variants and sizes render correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <Button variant="primary">Primary</Button>
      </TestWrapper>
    );
    expect(screen.getByText('Primary')).toBeInTheDocument();

    // Test different variants
    const variants = ['secondary', 'accent', 'outlined', 'danger', 'text'];
    variants.forEach(variant => {
      rerender(
        <TestWrapper>
          <Button variant={variant}>{variant} Button</Button>
        </TestWrapper>
      );
      expect(screen.getByText(`${variant} Button`)).toBeInTheDocument();
    });

    // Test different sizes
    const sizes = ['sm', 'md', 'lg'];
    sizes.forEach(size => {
      rerender(
        <TestWrapper>
          <Button size={size}>{size} Size</Button>
        </TestWrapper>
      );
      expect(screen.getByText(`${size} Size`)).toBeInTheDocument();
    });
  });

  test('form submission interaction', async () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());
    
    render(
      <TestWrapper>
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    
    // Test form submission via click
    fireEvent.click(button);
    expect(handleSubmit).toHaveBeenCalled();
  });

  test('handles edge cases and accessibility', async () => {    
    // Button with complex children
    const { rerender } = render(
      <TestWrapper>
        <Button>
          <span>Icon</span>
          Text Content
        </Button>
      </TestWrapper>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text Content')).toBeInTheDocument();

    // Empty button
    rerender(
      <TestWrapper>
        <Button />
      </TestWrapper>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('async click handling and state changes', () => {
    const asyncClick = jest.fn(() => Promise.resolve());
    
    const { rerender } = render(
      <TestWrapper>
        <Button onClick={asyncClick}>Async Button</Button>
      </TestWrapper>
    );
    
    // Normal state
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    
    // Trigger async operation
    fireEvent.click(button);
    expect(asyncClick).toHaveBeenCalled();
    
    // Test loading state
    rerender(
      <TestWrapper>
        <Button onClick={asyncClick} loading>
          Processing...
        </Button>
      </TestWrapper>
    );
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument(); // Default loading text
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
}); 
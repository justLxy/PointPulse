/**
 * Core User Flow: Card component interaction
 * Tests basic rendering and click handling for interactive cards
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import Card from '../../../components/common/Card';

const mockTheme = {
  colors: { background: { paper: '#ffffff' }, border: { light: '#e0e0e0' } },
  spacing: { md: '1rem' },
  typography: { fontSize: { sm: '0.875rem' } },
  radius: { lg: '12px' },
  shadows: { sm: '0 1px 3px rgba(0, 0, 0, 0.12)' }
};

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

describe('Card - Basic UI Component', () => {
  test('renders content and handles basic interaction', () => {
    const handleClick = jest.fn();
    
    render(
      <TestWrapper>
        <Card interactive onClick={handleClick}>
          Card Content
        </Card>
      </TestWrapper>
    );
    
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    
    // Test interactive click
    fireEvent.click(screen.getByText('Card Content'));
    expect(handleClick).toHaveBeenCalled();
  });

  test('renders without interaction when not interactive', () => {
    render(
      <TestWrapper>
        <Card>Static Card</Card>
      </TestWrapper>
    );
    
    expect(screen.getByText('Static Card')).toBeInTheDocument();
    // Non-interactive cards just need to render
  });

  test('handles complex content and multiple cards', () => {
    render(
      <TestWrapper>
        <Card>
          <div>Header</div>
          <div>Body Content</div>
          <button>Action</button>
        </Card>
      </TestWrapper>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
}); 
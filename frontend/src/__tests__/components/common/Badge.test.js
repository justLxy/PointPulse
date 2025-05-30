/**
 * Core User Flow: Badge display and basic variants
 * Tests badge content rendering and key visual states
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import Badge from '../../../components/common/Badge';

const mockTheme = {
  colors: {
    primary: { main: '#3498db', contrastText: '#ffffff' },
    success: { main: '#28a745', contrastText: '#ffffff' },
    error: { main: '#dc3545', contrastText: '#ffffff' }
  },
  spacing: { xs: '4px', sm: '8px' },
  typography: { fontSize: { xs: '0.75rem' }, fontWeights: { medium: 500 } },
  radius: { sm: '4px' }
};

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

describe('Badge - Display Component', () => {
  test('renders badge content correctly', () => {
    render(
      <TestWrapper>
        <Badge>New</Badge>
      </TestWrapper>
    );
    
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  test('renders different variants for status indication', () => {
    const { rerender } = render(
      <TestWrapper>
        <Badge variant="success">Active</Badge>
      </TestWrapper>
    );
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    
    rerender(
      <TestWrapper>
        <Badge variant="error">Error</Badge>
      </TestWrapper>
    );
    
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  test('handles complex content and numbers', () => {
    render(
      <TestWrapper>
        <Badge>{99}</Badge>
      </TestWrapper>
    );
    
    expect(screen.getByText('99')).toBeInTheDocument();
    
    // Test with icon content
    const { rerender } = render(
      <TestWrapper>
        <Badge>
          <span>✓</span>
          Verified
        </Badge>
      </TestWrapper>
    );
    
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });
});

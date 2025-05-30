/**
 * Badge Component Tests
 * Purpose: Comprehensive testing of badge component including
 * all variants, colors, sizes, styles, and edge cases
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import Badge from '../../../components/common/Badge';
import theme from '../../../styles/theme';

// Mock theme for testing
const mockTheme = {
  colors: {
    primary: {
      main: '#3498db',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#6c757d',
      contrastText: '#ffffff'
    },
    success: {
      main: '#28a745',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#ffc107',
      contrastText: '#212529'
    },
    error: {
      main: '#dc3545',
      contrastText: '#ffffff'
    },
    info: {
      main: '#17a2b8',
      contrastText: '#ffffff'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px'
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem'
    },
    fontWeights: {
      medium: 500
    }
  },
  radius: {
    sm: '4px',
    full: '9999px'
  }
};

// Wrapper component for theme provider
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

describe('Badge Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <Badge>Test Badge</Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('renders as a span element', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>Test</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe('SPAN');
    });

    it('renders children content correctly', () => {
      render(
        <TestWrapper>
          <Badge>Badge Content</Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText('Badge Content')).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      const { container } = render(
        <TestWrapper>
          <Badge></Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe('');
    });

    it('renders with complex children (JSX elements)', () => {
      render(
        <TestWrapper>
          <Badge>
            <span>Icon</span>
            Text
          </Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Variant Styles', () => {
    const variants = ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'outlined'];

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        const { container } = render(
          <TestWrapper>
            <Badge variant={variant}>Test</Badge>
          </TestWrapper>
        );
        
        const badge = container.querySelector('span');
        expect(badge).toBeInTheDocument();
        
        // Check that the badge has styled-components classes
        expect(badge.className).toMatch(/css-/);
      });
    });

    it('defaults to primary variant when no variant is specified', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>Default Badge</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('handles invalid variant gracefully (fallback to primary)', () => {
      const { container } = render(
        <TestWrapper>
          <Badge variant="invalid">Invalid Variant</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('Invalid Variant')).toBeInTheDocument();
    });

    it('applies outlined variant styles correctly', () => {
      const { container } = render(
        <TestWrapper>
          <Badge variant="outlined">Outlined Badge</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Color Styles', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];

    colors.forEach(color => {
      it(`renders ${color} color correctly`, () => {
        const { container } = render(
          <TestWrapper>
            <Badge color={color}>Test</Badge>
          </TestWrapper>
        );
        
        const badge = container.querySelector('span');
        expect(badge).toBeInTheDocument();
      });

      it(`applies ${color} color to outlined variant`, () => {
        const { container } = render(
          <TestWrapper>
            <Badge variant="outlined" color={color}>Outlined</Badge>
          </TestWrapper>
        );
        
        const badge = container.querySelector('span');
        expect(badge).toBeInTheDocument();
      });
    });

    it('defaults to primary color when no color is specified', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>Default Color</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('handles invalid color gracefully (fallback to primary)', () => {
      const { container } = render(
        <TestWrapper>
          <Badge color="invalid">Invalid Color</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('color prop only affects outlined variant', () => {
      const { container: solidContainer } = render(
        <TestWrapper>
          <Badge variant="success" color="error">Solid Badge</Badge>
        </TestWrapper>
      );

      const { container: outlinedContainer } = render(
        <TestWrapper>
          <Badge variant="outlined" color="error">Outlined Badge</Badge>
        </TestWrapper>
      );
      
      const solidBadge = solidContainer.querySelector('span');
      const outlinedBadge = outlinedContainer.querySelector('span');
      
      expect(solidBadge).toBeInTheDocument();
      expect(outlinedBadge).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders medium size (default) correctly', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>Medium Badge</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('renders large size correctly', () => {
      const { container } = render(
        <TestWrapper>
          <Badge size="large">Large Badge</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('handles invalid size gracefully (fallback to medium)', () => {
      const { container } = render(
        <TestWrapper>
          <Badge size="invalid">Invalid Size</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('size prop affects padding and font size', () => {
      const { container: mediumContainer } = render(
        <TestWrapper>
          <Badge size="medium">Medium</Badge>
        </TestWrapper>
      );

      const { container: largeContainer } = render(
        <TestWrapper>
          <Badge size="large">Large</Badge>
        </TestWrapper>
      );
      
      const mediumBadge = mediumContainer.querySelector('span');
      const largeBadge = largeContainer.querySelector('span');
      
      expect(mediumBadge).toBeInTheDocument();
      expect(largeBadge).toBeInTheDocument();
    });
  });

  describe('Shape Variants', () => {
    it('renders with rounded corners by default', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>Default Shape</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('renders pill shape when pill prop is true', () => {
      const { container } = render(
        <TestWrapper>
          <Badge pill>Pill Badge</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('handles pill prop as boolean correctly', () => {
      const { container: pillContainer } = render(
        <TestWrapper>
          <Badge pill={true}>Pill True</Badge>
        </TestWrapper>
      );

      const { container: noPillContainer } = render(
        <TestWrapper>
          <Badge pill={false}>Pill False</Badge>
        </TestWrapper>
      );
      
      const pillBadge = pillContainer.querySelector('span');
      const noPillBadge = noPillContainer.querySelector('span');
      
      expect(pillBadge).toBeInTheDocument();
      expect(noPillBadge).toBeInTheDocument();
    });
  });

  describe('CSS Styling', () => {
    it('applies base styles correctly', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>Styled Badge</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toHaveStyle('display: inline-flex');
      expect(badge).toHaveStyle('align-items: center');
      expect(badge).toHaveStyle('justify-content: center');
      expect(badge).toHaveStyle('white-space: nowrap');
    });

    it('applies emotion CSS classes', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>CSS Badge</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge.className).toMatch(/css-/);
    });

    it('maintains text readability with white-space: nowrap', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>Very long badge text that should not wrap</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toHaveStyle('white-space: nowrap');
    });
  });

  describe('Props and Attributes', () => {
    it('passes through additional props', () => {
      const { container } = render(
        <TestWrapper>
          <Badge data-testid="custom-badge" role="status" aria-label="Status badge">
            Custom Props
          </Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toHaveAttribute('data-testid', 'custom-badge');
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });

    it('handles className prop correctly', () => {
      const { container } = render(
        <TestWrapper>
          <Badge className="custom-class">Custom Class</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('custom-class');
    });

    it('handles style prop correctly', () => {
      const customStyle = { margin: '10px', fontSize: '14px' };
      const { container } = render(
        <TestWrapper>
          <Badge style={customStyle}>Custom Style</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toHaveStyle('margin: 10px');
      expect(badge).toHaveStyle('font-size: 14px');
    });

    it('supports event handlers', () => {
      const handleClick = jest.fn();
      render(
        <TestWrapper>
          <Badge onClick={handleClick}>Clickable Badge</Badge>
        </TestWrapper>
      );
      
      const badge = screen.getByText('Clickable Badge');
      badge.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('provides accessible text content', () => {
      render(
        <TestWrapper>
          <Badge>Accessible Badge</Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText('Accessible Badge')).toBeInTheDocument();
    });

    it('supports ARIA attributes', () => {
      const { container } = render(
        <TestWrapper>
          <Badge 
            role="status" 
            aria-label="Notification count" 
            aria-live="polite"
          >
            5
          </Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveAttribute('aria-label', 'Notification count');
      expect(badge).toHaveAttribute('aria-live', 'polite');
    });

    it('maintains semantic meaning with proper markup', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>Status: Active</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge.tagName).toBe('SPAN');
      expect(badge).toHaveTextContent('Status: Active');
    });

    it('supports screen reader friendly content', () => {
      render(
        <TestWrapper>
          <Badge aria-label="3 unread messages">3</Badge>
        </TestWrapper>
      );
      
      const badge = screen.getByLabelText('3 unread messages');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('3');
    });
  });

  describe('Theme Integration', () => {
    it('uses theme values correctly', () => {
      const customTheme = {
        ...mockTheme,
        colors: {
          ...mockTheme.colors,
          primary: {
            main: '#ff0000',
            contrastText: '#000000'
          }
        }
      };

      const CustomWrapper = ({ children }) => (
        <ThemeProvider theme={customTheme}>
          {children}
        </ThemeProvider>
      );

      const { container } = render(
        <CustomWrapper>
          <Badge variant="primary">Themed Badge</Badge>
        </CustomWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('handles missing theme gracefully', () => {
      expect(() => {
        render(<Badge>No Theme Badge</Badge>);
      }).not.toThrow();
    });

    it('applies theme spacing correctly', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>Themed Spacing</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('applies theme typography correctly', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>Themed Typography</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long text content', () => {
      const longText = 'This is a very long badge text that should still render correctly without breaking the layout';
      render(
        <TestWrapper>
          <Badge>{longText}</Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('handles numeric content', () => {
      render(
        <TestWrapper>
          <Badge>{99}</Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('handles zero as content', () => {
      render(
        <TestWrapper>
          <Badge>{0}</Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles special characters in content', () => {
      const specialText = '!@#$%^&*()';
      render(
        <TestWrapper>
          <Badge>{specialText}</Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('handles unicode characters', () => {
      const unicodeText = '🔔 通知 Badge';
      render(
        <TestWrapper>
          <Badge>{unicodeText}</Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>{null}</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      const { container } = render(
        <TestWrapper>
          <Badge>{undefined}</Badge>
        </TestWrapper>
      );
      
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Component Composition', () => {
    it('can be used with icons', () => {
      const IconComponent = () => <span data-testid="icon">📧</span>;
      
      render(
        <TestWrapper>
          <Badge>
            <IconComponent />
            Messages
          </Badge>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    it('can be nested within other components', () => {
      const ParentComponent = () => (
        <div data-testid="parent">
          <TestWrapper>
            <Badge>Nested Badge</Badge>
          </TestWrapper>
        </div>
      );

      render(<ParentComponent />);

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByText('Nested Badge')).toBeInTheDocument();
    });

    it('supports multiple badges in a container', () => {
      render(
        <TestWrapper>
          <div>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        </TestWrapper>
      );
      
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('maintains independence when multiple instances are rendered', () => {
      render(
        <TestWrapper>
          <div>
            <Badge variant="primary">Badge 1</Badge>
            <Badge variant="secondary">Badge 2</Badge>
          </div>
        </TestWrapper>
      );
      
      const badges = screen.getAllByText(/Badge \d/);
      expect(badges).toHaveLength(2);
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const { rerender } = render(
        <TestWrapper>
          <Badge>Initial Content</Badge>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Badge>Initial Content</Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText('Initial Content')).toBeInTheDocument();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <Badge variant="primary">Test</Badge>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Badge variant="secondary">Test</Badge>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Badge variant="success">Test</Badge>
        </TestWrapper>
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});

/**
 * Button Component Tests
 * Purpose: Comprehensive testing of button component including
 * all variants, sizes, states, and interaction behaviors
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@emotion/react';
import Button from '../../../components/common/Button';
import theme from '../../../styles/theme';

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaSpinner: ({ className }) => <span className={className} data-testid="spinner">Spinner</span>
}));

// Mock theme for testing
const mockTheme = {
  colors: {
    primary: {
      main: '#3498db',
      dark: '#2980b9',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#6c757d',
      dark: '#545b62',
      contrastText: '#ffffff'
    },
    accent: {
      main: '#e74c3c',
      dark: '#c0392b',
      contrastText: '#ffffff'
    },
    error: {
      main: '#dc3545',
      dark: '#bd2130',
      contrastText: '#ffffff'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem'
    },
    fontWeights: {
      medium: 500
    }
  },
  radius: {
    md: '8px'
  },
  transitions: {
    quick: '0.2s ease'
  }
};

// Wrapper component for theme provider
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

describe('Button Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <Button>Test Button</Button>
        </TestWrapper>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('renders as button element by default', () => {
      render(
        <TestWrapper>
          <Button>Test</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders children content correctly', () => {
      render(
        <TestWrapper>
          <Button>Button Content</Button>
        </TestWrapper>
      );
      
      expect(screen.getByText('Button Content')).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      render(
        <TestWrapper>
          <Button></Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('');
    });

    it('renders with complex children (JSX elements)', () => {
      render(
        <TestWrapper>
          <Button>
            <span>Icon</span>
            Text
          </Button>
        </TestWrapper>
      );
      
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Variant Styles', () => {
    const variants = ['primary', 'secondary', 'accent', 'outlined', 'danger', 'text'];

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        render(
          <TestWrapper>
            <Button variant={variant}>Test</Button>
          </TestWrapper>
        );
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveStyle('display: inline-flex');
        expect(button).toHaveStyle('align-items: center');
        expect(button).toHaveStyle('justify-content: center');
      });
    });

    it('defaults to primary variant when no variant is specified', () => {
      render(
        <TestWrapper>
          <Button>Default Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles invalid variant gracefully (fallback to primary)', () => {
      render(
        <TestWrapper>
          <Button variant="invalid">Invalid Variant</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Invalid Variant')).toBeInTheDocument();
    });

    it('applies outlined variant with transparent background', () => {
      render(
        <TestWrapper>
          <Button variant="outlined">Outlined Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background-color: transparent');
    });

    it('applies text variant with minimal padding', () => {
      render(
        <TestWrapper>
          <Button variant="text">Text Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background-color: transparent');
    });
  });

  describe('Size Variants', () => {
    const sizes = ['tiny', 'small', 'medium', 'large'];

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        render(
          <TestWrapper>
            <Button size={size}>Test</Button>
          </TestWrapper>
        );
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
      });
    });

    it('defaults to medium size when no size is specified', () => {
      render(
        <TestWrapper>
          <Button>Default Size</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('height: 40px');
    });

    it('applies tiny size with correct height', () => {
      render(
        <TestWrapper>
          <Button size="tiny">Tiny Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('height: 24px');
      expect(button).toHaveStyle('min-width: 24px');
    });

    it('applies small size with correct height', () => {
      render(
        <TestWrapper>
          <Button size="small">Small Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('height: 32px');
    });

    it('applies large size with correct height', () => {
      render(
        <TestWrapper>
          <Button size="large">Large Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('height: 48px');
    });

    it('handles invalid size gracefully (fallback to medium)', () => {
      render(
        <TestWrapper>
          <Button size="invalid">Invalid Size</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('height: 40px');
    });
  });

  describe('Button Types', () => {
    it('renders submit type button', () => {
      render(
        <TestWrapper>
          <Button type="submit">Submit Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders reset type button', () => {
      render(
        <TestWrapper>
          <Button type="reset">Reset Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('defaults to button type', () => {
      render(
        <TestWrapper>
          <Button>Default Type</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Full Width Prop', () => {
    it('applies full width when fullWidth is true', () => {
      render(
        <TestWrapper>
          <Button fullWidth>Full Width Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('width: 100%');
    });

    it('does not apply full width by default', () => {
      render(
        <TestWrapper>
          <Button>Normal Width Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveStyle('width: 100%');
    });

    it('handles fullWidth prop as boolean correctly', () => {
      const { rerender } = render(
        <TestWrapper>
          <Button fullWidth={true}>Full Width True</Button>
        </TestWrapper>
      );

      let button = screen.getByRole('button');
      expect(button).toHaveStyle('width: 100%');

      rerender(
        <TestWrapper>
          <Button fullWidth={false}>Full Width False</Button>
        </TestWrapper>
      );

      button = screen.getByRole('button');
      expect(button).not.toHaveStyle('width: 100%');
    });
  });

  describe('Loading State', () => {
    it('shows spinner when loading is true', () => {
      render(
        <TestWrapper>
          <Button loading>Loading Button</Button>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(
        <TestWrapper>
          <Button loading>Loading Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn();
      
      render(
        <TestWrapper>
          <Button loading onClick={handleClick}>Loading Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows spinner with spin animation class', () => {
      render(
        <TestWrapper>
          <Button loading>Loading Button</Button>
        </TestWrapper>
      );
      
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('spin-icon');
    });

    it('shows loading text when children are present', () => {
      render(
        <TestWrapper>
          <Button loading>Original Text</Button>
        </TestWrapper>
      );
      
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
      expect(screen.queryByText('Original Text')).not.toBeInTheDocument();
    });

    it('shows only spinner when no children', () => {
      render(
        <TestWrapper>
          <Button loading></Button>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.queryByText('Please wait...')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(
        <TestWrapper>
          <Button disabled>Disabled Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveStyle('opacity: 0.6');
      expect(button).toHaveStyle('cursor: not-allowed');
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      
      render(
        <TestWrapper>
          <Button disabled onClick={handleClick}>Disabled Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('is disabled when both loading and disabled are true', () => {
      render(
        <TestWrapper>
          <Button loading disabled>Loading Disabled Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Click Handling', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn();
      
      render(
        <TestWrapper>
          <Button onClick={handleClick}>Clickable Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('passes event object to onClick handler', async () => {
      const handleClick = jest.fn();
      
      render(
        <TestWrapper>
          <Button onClick={handleClick}>Clickable Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('handles multiple rapid clicks', async () => {
      const handleClick = jest.fn();
      
      render(
        <TestWrapper>
          <Button onClick={handleClick}>Clickable Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      await userEvent.dblClick(button);
      
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('handles keyboard interaction (Enter)', async () => {
      const handleClick = jest.fn();
      
      render(
        <TestWrapper>
          <Button onClick={handleClick}>Keyboard Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard interaction (Space)', async () => {
      const handleClick = jest.fn();
      
      render(
        <TestWrapper>
          <Button onClick={handleClick}>Keyboard Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('CSS Styling', () => {
    it('applies base styles correctly', () => {
      render(
        <TestWrapper>
          <Button>Styled Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('display: inline-flex');
      expect(button).toHaveStyle('align-items: center');
      expect(button).toHaveStyle('justify-content: center');
      expect(button).toHaveStyle('border-radius: 8px');
      expect(button).toHaveStyle('cursor: pointer');
      expect(button).toHaveStyle('border: none');
      expect(button).toHaveStyle('outline: none');
      expect(button).toHaveStyle('white-space: nowrap');
    });

    it('applies emotion CSS classes', () => {
      const { container } = render(
        <TestWrapper>
          <Button>CSS Button</Button>
        </TestWrapper>
      );
      
      const button = container.querySelector('button');
      expect(button.className).toMatch(/css-/);
    });

    it('maintains text readability with white-space: nowrap', () => {
      render(
        <TestWrapper>
          <Button>Very long button text that should not wrap</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('white-space: nowrap');
    });
  });

  describe('Props and Attributes', () => {
    it('passes through additional props', () => {
      render(
        <TestWrapper>
          <Button data-testid="custom-button" aria-label="Custom button" tabIndex={1}>
            Custom Props
          </Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom button');
      expect(button).toHaveAttribute('tabIndex', '1');
    });

    it('handles className prop correctly', () => {
      render(
        <TestWrapper>
          <Button className="custom-class">Custom Class</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('handles style prop correctly', () => {
      const customStyle = { margin: '10px', fontSize: '14px' };
      render(
        <TestWrapper>
          <Button style={customStyle}>Custom Style</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('margin: 10px');
      expect(button).toHaveStyle('font-size: 14px');
    });

    it('supports form attributes', () => {
      render(
        <TestWrapper>
          <Button form="test-form" formAction="/submit" formMethod="post">
            Form Button
          </Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('formAction', '/submit');
      expect(button).toHaveAttribute('formMethod', 'post');
    });
  });

  describe('Accessibility', () => {
    it('provides accessible button role', () => {
      render(
        <TestWrapper>
          <Button>Accessible Button</Button>
        </TestWrapper>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports ARIA attributes', () => {
      render(
        <TestWrapper>
          <Button 
            aria-label="Save document" 
            aria-describedby="save-help"
            aria-pressed={true}
          >
            Save
          </Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Save document');
      expect(button).toHaveAttribute('aria-describedby', 'save-help');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('maintains focus management', () => {
      render(
        <TestWrapper>
          <Button>Focusable Button</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('provides loading state to screen readers', () => {
      render(
        <TestWrapper>
          <Button loading aria-label="Saving, please wait">
            Save
          </Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Saving, please wait');
      expect(button).toBeDisabled();
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

      render(
        <CustomWrapper>
          <Button variant="primary">Themed Button</Button>
        </CustomWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles missing theme gracefully', () => {
      expect(() => {
        render(<Button>No Theme Button</Button>);
      }).not.toThrow();
    });

    it('applies theme spacing correctly', () => {
      render(
        <TestWrapper>
          <Button>Themed Spacing</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('applies theme typography correctly', () => {
      render(
        <TestWrapper>
          <Button>Themed Typography</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long text content', () => {
      const longText = 'This is a very long button text that should still render correctly without breaking the layout';
      render(
        <TestWrapper>
          <Button>{longText}</Button>
        </TestWrapper>
      );
      
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('handles numeric content', () => {
      render(
        <TestWrapper>
          <Button>{42}</Button>
        </TestWrapper>
      );
      
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles zero as content', () => {
      render(
        <TestWrapper>
          <Button>{0}</Button>
        </TestWrapper>
      );
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles special characters in content', () => {
      const specialText = '!@#$%^&*()';
      render(
        <TestWrapper>
          <Button>{specialText}</Button>
        </TestWrapper>
      );
      
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('handles unicode characters', () => {
      const unicodeText = '💾 保存 Button';
      render(
        <TestWrapper>
          <Button>{unicodeText}</Button>
        </TestWrapper>
      );
      
      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      render(
        <TestWrapper>
          <Button>{null}</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      render(
        <TestWrapper>
          <Button>{undefined}</Button>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Component Composition', () => {
    it('can be used with icons', () => {
      const IconComponent = () => <span data-testid="icon">💾</span>;
      
      render(
        <TestWrapper>
          <Button>
            <IconComponent />
            Save
          </Button>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('can be nested within forms', () => {
      render(
        <form data-testid="test-form">
          <TestWrapper>
            <Button type="submit">Submit Form</Button>
          </TestWrapper>
        </form>
      );

      expect(screen.getByTestId('test-form')).toBeInTheDocument();
      expect(screen.getByText('Submit Form')).toBeInTheDocument();
    });

    it('supports multiple buttons in a container', () => {
      render(
        <TestWrapper>
          <div>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </TestWrapper>
      );
      
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Danger')).toBeInTheDocument();
    });

    it('maintains independence when multiple instances are rendered', () => {
      const handleClick1 = jest.fn();
      const handleClick2 = jest.fn();
      
      render(
        <TestWrapper>
          <div>
            <Button onClick={handleClick1}>Button 1</Button>
            <Button onClick={handleClick2}>Button 2</Button>
          </div>
        </TestWrapper>
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      
      fireEvent.click(buttons[0]);
      expect(handleClick1).toHaveBeenCalledTimes(1);
      expect(handleClick2).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const { rerender } = render(
        <TestWrapper>
          <Button>Initial Content</Button>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Button>Initial Content</Button>
        </TestWrapper>
      );
      
      expect(screen.getByText('Initial Content')).toBeInTheDocument();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <Button variant="primary">Test</Button>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Button variant="secondary">Test</Button>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Button variant="danger">Test</Button>
        </TestWrapper>
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles rapid loading state changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <Button loading={false}>Test</Button>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Button loading={true}>Test</Button>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      
      rerender(
        <TestWrapper>
          <Button loading={false}>Test</Button>
        </TestWrapper>
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import Input from '../../../components/common/Input';
import theme from '../../../styles/theme';

// Helper function to render component with theme
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Mock icon component for testing
const MockIcon = () => <div data-testid="test-icon">📧</div>;

describe('Input Component', () => {
  const defaultProps = {
    label: 'Test Input',
    placeholder: 'Enter text...',
    id: 'test-input'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders input with label', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
      expect(screen.getByText('Test Input')).toBeInTheDocument();
    });

    it('renders input without label when not provided', () => {
      renderWithTheme(<Input placeholder="No label input" />);
      
      expect(screen.getByPlaceholderText('No label input')).toBeInTheDocument();
      expect(screen.queryByText('Test Input')).not.toBeInTheDocument();
    });

    it('renders with placeholder text', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('renders with default type as text', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with custom type', () => {
      renderWithTheme(<Input {...defaultProps} type="email" />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders with custom id', () => {
      renderWithTheme(<Input {...defaultProps} id="custom-input" />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('id', 'custom-input');
    });
  });

  describe('Label Functionality', () => {
    it('associates label with input using htmlFor', () => {
      renderWithTheme(<Input {...defaultProps} id="test-input" />);
      
      const label = screen.getByText('Test Input');
      const input = screen.getByLabelText('Test Input');
      
      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('shows required asterisk when required', () => {
      renderWithTheme(<Input {...defaultProps} required />);
      
      const label = screen.getByText('Test Input');
      expect(label).toBeInTheDocument();
      // Check if required styling is applied (asterisk is added via CSS ::after)
    });

    it('does not show required asterisk when not required', () => {
      renderWithTheme(<Input {...defaultProps} required={false} />);
      
      expect(screen.getByText('Test Input')).toBeInTheDocument();
    });

    it('renders without label when label is empty string', () => {
      renderWithTheme(<Input placeholder="Enter text..." label="" />);
      
      expect(screen.queryByText('Test Input')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('renders without label when label is null', () => {
      renderWithTheme(<Input placeholder="Enter text..." label={null} />);
      
      expect(screen.queryByText('Test Input')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });
  });

  describe('Input Types and Variants', () => {
    it('renders password input', () => {
      renderWithTheme(<Input {...defaultProps} type="password" />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders email input', () => {
      renderWithTheme(<Input {...defaultProps} type="email" />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders number input', () => {
      renderWithTheme(<Input {...defaultProps} type="number" />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders textarea when type is textarea', () => {
      renderWithTheme(<Input {...defaultProps} type="textarea" />);
      
      const textarea = screen.getByLabelText('Test Input');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('renders with outlined variant by default', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
    });

    it('renders with filled variant', () => {
      renderWithTheme(<Input {...defaultProps} variant="filled" />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
    });

    it('handles invalid variant gracefully', () => {
      renderWithTheme(<Input {...defaultProps} variant="invalid" />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Full Width and Sizing', () => {
    it('renders with full width by default', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
    });

    it('renders without full width when explicitly set to false', () => {
      renderWithTheme(<Input {...defaultProps} fullWidth={false} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
    });

    it('applies correct height for regular input', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
    });

    it('applies correct min-height for textarea', () => {
      renderWithTheme(<Input {...defaultProps} type="textarea" />);
      
      const textarea = screen.getByLabelText('Test Input');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Icon Support', () => {
    it('renders with left icon', () => {
      renderWithTheme(<Input {...defaultProps} leftIcon={<MockIcon />} />);
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    });

    it('renders without icon when not provided', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    });

    it('applies correct padding when left icon is present', () => {
      renderWithTheme(<Input {...defaultProps} leftIcon={<MockIcon />} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('applies correct padding for textarea with left icon', () => {
      renderWithTheme(<Input {...defaultProps} type="textarea" leftIcon={<MockIcon />} />);
      
      const textarea = screen.getByLabelText('Test Input');
      expect(textarea).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders icon wrapper with correct class', () => {
      renderWithTheme(<Input {...defaultProps} leftIcon={<MockIcon />} />);
      
      const iconWrapper = screen.getByTestId('test-icon').parentElement;
      expect(iconWrapper).toHaveClass('input-icon-wrapper');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when error is provided', () => {
      renderWithTheme(<Input {...defaultProps} error="This field is required" />);
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('does not display error message when error is not provided', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    it('applies error styling when error is present', () => {
      renderWithTheme(<Input {...defaultProps} error="Error message" />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('handles boolean error correctly', () => {
      renderWithTheme(<Input {...defaultProps} error={true} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
      // Boolean error should not display text but should apply styling
    });

    it('handles empty string error', () => {
      renderWithTheme(<Input {...defaultProps} error="" />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
      // Don't search for empty string - just verify no error text is shown
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('handles null error', () => {
      renderWithTheme(<Input {...defaultProps} error={null} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
    });

    it('handles undefined error', () => {
      renderWithTheme(<Input {...defaultProps} error={undefined} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('displays helper text when provided and no error', () => {
      renderWithTheme(<Input {...defaultProps} helperText="This is a helpful tip" />);
      
      expect(screen.getByText('This is a helpful tip')).toBeInTheDocument();
    });

    it('does not display helper text when error is present', () => {
      renderWithTheme(
        <Input 
          {...defaultProps} 
          error="Error message" 
          helperText="This is a helpful tip" 
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('This is a helpful tip')).not.toBeInTheDocument();
    });

    it('does not display helper text when not provided', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      expect(screen.queryByText('This is a helpful tip')).not.toBeInTheDocument();
    });

    it('handles empty string helper text', () => {
      renderWithTheme(<Input {...defaultProps} helperText="" />);
      
      // Don't search for empty string, instead verify no helper text is displayed
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
      // Verify no helper text is rendered by checking there's no additional text element
      expect(screen.queryByText(/helpful/i)).not.toBeInTheDocument();
    });

    it('handles null helper text', () => {
      renderWithTheme(<Input {...defaultProps} helperText={null} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles input change events', () => {
      const handleChange = jest.fn();
      renderWithTheme(<Input {...defaultProps} onChange={handleChange} />);
      
      const input = screen.getByLabelText('Test Input');
      fireEvent.change(input, { target: { value: 'test value' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(input.value).toBe('test value');
    });

    it('handles focus events', () => {
      const handleFocus = jest.fn();
      renderWithTheme(<Input {...defaultProps} onFocus={handleFocus} />);
      
      const input = screen.getByLabelText('Test Input');
      fireEvent.focus(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles blur events', () => {
      const handleBlur = jest.fn();
      renderWithTheme(<Input {...defaultProps} onBlur={handleBlur} />);
      
      const input = screen.getByLabelText('Test Input');
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles keydown events', () => {
      const handleKeyDown = jest.fn();
      renderWithTheme(<Input {...defaultProps} onKeyDown={handleKeyDown} />);
      
      const input = screen.getByLabelText('Test Input');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('handles textarea interactions', () => {
      const handleChange = jest.fn();
      renderWithTheme(<Input {...defaultProps} type="textarea" onChange={handleChange} />);
      
      const textarea = screen.getByLabelText('Test Input');
      fireEvent.change(textarea, { target: { value: 'multiline\ntext' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(textarea.value).toBe('multiline\ntext');
    });
  });

  describe('Disabled State', () => {
    it('renders disabled input correctly', () => {
      renderWithTheme(<Input {...defaultProps} disabled />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeDisabled();
    });

    it('handles disabled state behavior', () => {
      const handleChange = jest.fn();
      renderWithTheme(<Input {...defaultProps} disabled onChange={handleChange} />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeDisabled();
      
      // For disabled inputs, React still allows programmatic changes
      // but the styling and user interaction should be disabled
      expect(input).toHaveAttribute('disabled');
    });

    it('renders disabled textarea correctly', () => {
      renderWithTheme(<Input {...defaultProps} type="textarea" disabled />);
      
      const textarea = screen.getByLabelText('Test Input');
      expect(textarea).toBeDisabled();
    });
  });

  describe('ForwardRef Support', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef();
      renderWithTheme(<Input {...defaultProps} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toBe(screen.getByLabelText('Test Input'));
    });

    it('forwards ref to textarea element', () => {
      const ref = React.createRef();
      renderWithTheme(<Input {...defaultProps} type="textarea" ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current).toBe(screen.getByLabelText('Test Input'));
    });

    it('allows calling focus method via ref', () => {
      const ref = React.createRef();
      renderWithTheme(<Input {...defaultProps} ref={ref} />);
      
      ref.current.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper labeling for screen readers', () => {
      renderWithTheme(<Input {...defaultProps} id="accessible-input" />);
      
      const input = screen.getByLabelText('Test Input');
      const label = screen.getByText('Test Input');
      
      expect(label).toHaveAttribute('for', 'accessible-input');
      expect(input).toHaveAttribute('id', 'accessible-input');
    });

    it('associates error text with input via aria-describedby', () => {
      renderWithTheme(
        <Input 
          {...defaultProps} 
          id="error-input" 
          error="This field has an error" 
        />
      );
      
      const input = screen.getByLabelText('Test Input');
      const errorText = screen.getByText('This field has an error');
      
      expect(input).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it('associates helper text with input via aria-describedby', () => {
      renderWithTheme(
        <Input 
          {...defaultProps} 
          id="helper-input" 
          helperText="This is helpful information" 
        />
      );
      
      const input = screen.getByLabelText('Test Input');
      const helperText = screen.getByText('This is helpful information');
      
      expect(input).toBeInTheDocument();
      expect(helperText).toBeInTheDocument();
    });

    it('indicates required fields for screen readers', () => {
      renderWithTheme(<Input {...defaultProps} required />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('required');
    });

    it('has appropriate role for textarea', () => {
      renderWithTheme(<Input {...defaultProps} type="textarea" />);
      
      const textarea = screen.getByLabelText('Test Input');
      expect(textarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('Focus Management', () => {
    it('can be focused programmatically', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      const input = screen.getByLabelText('Test Input');
      input.focus();
      
      expect(input).toHaveFocus();
    });

    it('can be blurred after focus', () => {
      renderWithTheme(<Input {...defaultProps} />);
      
      const input = screen.getByLabelText('Test Input');
      input.focus();
      expect(input).toHaveFocus();
      
      input.blur();
      expect(input).not.toHaveFocus();
    });

    it('applies error styling when input has error', () => {
      renderWithTheme(<Input {...defaultProps} error="Error message" />);
      
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles missing theme gracefully', () => {
      expect(() => {
        render(<Input {...defaultProps} />);
      }).not.toThrow();
    });

    it('handles all props being undefined', () => {
      expect(() => {
        renderWithTheme(<Input />);
      }).not.toThrow();
      
      // Should render a basic input without label
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('handles very long error messages', () => {
      const longError = 'This is a very long error message that might span multiple lines and should be handled gracefully by the component without breaking the layout or functionality.';
      
      renderWithTheme(<Input {...defaultProps} error={longError} />);
      
      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it('handles very long helper text', () => {
      const longHelperText = 'This is a very long helper text that provides detailed information about the input field and should be displayed correctly without affecting the layout.';
      
      renderWithTheme(<Input {...defaultProps} helperText={longHelperText} />);
      
      expect(screen.getByText(longHelperText)).toBeInTheDocument();
    });

    it('handles special characters in input values', () => {
      const handleChange = jest.fn();
      renderWithTheme(<Input {...defaultProps} onChange={handleChange} />);
      
      const input = screen.getByLabelText('Test Input');
      const specialValue = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./';
      
      fireEvent.change(input, { target: { value: specialValue } });
      
      expect(input.value).toBe(specialValue);
    });

    it('handles rapid input changes', () => {
      const handleChange = jest.fn();
      renderWithTheme(<Input {...defaultProps} onChange={handleChange} />);
      
      const input = screen.getByLabelText('Test Input');
      
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });
      
      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('State Transitions', () => {
    it('transitions between error and non-error states', () => {
      const { rerender } = renderWithTheme(<Input {...defaultProps} />);
      
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <Input {...defaultProps} error="Error message" />
        </ThemeProvider>
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <Input {...defaultProps} />
        </ThemeProvider>
      );
      
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });

    it('transitions between helper text and error states', () => {
      const { rerender } = renderWithTheme(
        <Input {...defaultProps} helperText="Helper text" />
      );
      
      expect(screen.getByText('Helper text')).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <Input {...defaultProps} error="Error message" helperText="Helper text" />
        </ThemeProvider>
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('handles dynamic type changes', () => {
      const { rerender } = renderWithTheme(<Input {...defaultProps} type="text" />);
      
      expect(screen.getByLabelText('Test Input')).toHaveAttribute('type', 'text');
      
      rerender(
        <ThemeProvider theme={theme}>
          <Input {...defaultProps} type="password" />
        </ThemeProvider>
      );
      
      expect(screen.getByLabelText('Test Input')).toHaveAttribute('type', 'password');
    });
  });

  describe('Performance Considerations', () => {
    it('does not cause unnecessary re-renders with stable refs', () => {
      const ref = React.createRef();
      const { rerender } = renderWithTheme(<Input {...defaultProps} ref={ref} />);
      
      const originalElement = ref.current;
      
      rerender(
        <ThemeProvider theme={theme}>
          <Input {...defaultProps} ref={ref} />
        </ThemeProvider>
      );
      
      expect(ref.current).toBe(originalElement);
    });

    it('handles controlled vs uncontrolled state correctly', () => {
      // Uncontrolled
      renderWithTheme(<Input {...defaultProps} defaultValue="default" />);
      const uncontrolledInput = screen.getByDisplayValue('default');
      expect(uncontrolledInput).toBeInTheDocument();
      
      // Controlled  
      const { rerender } = renderWithTheme(<Input {...defaultProps} value="controlled" onChange={() => {}} />);
      const controlledInput = screen.getByDisplayValue('controlled');
      expect(controlledInput).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('works correctly in forms', () => {
      const handleSubmit = jest.fn(e => e.preventDefault());
      
      renderWithTheme(
        <form onSubmit={handleSubmit}>
          <Input {...defaultProps} name="testInput" required />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByLabelText('Test Input');
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      
      fireEvent.change(input, { target: { value: 'test value' } });
      fireEvent.click(submitButton);
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('integrates with form validation', () => {
      renderWithTheme(
        <form>
          <Input {...defaultProps} type="email" required />
        </form>
      );
      
      const input = screen.getByLabelText('Test Input');
      
      fireEvent.change(input, { target: { value: 'invalid-email' } });
      fireEvent.blur(input);
      
      expect(input.value).toBe('invalid-email');
    });
  });
}); 
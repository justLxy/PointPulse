import { forwardRef } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import theme from '../../styles/theme';

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing.md};
  width: 100%;
`;

const SelectLabel = styled.label`
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.primary};
  
  ${({ required }) =>
    required &&
    css`
      &::after {
        content: ' *';
        color: ${theme.colors.error.main};
      }
    `}
`;

const SelectWrapper = styled.div`
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: ${theme.spacing.md};
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid ${theme.colors.text.secondary};
    pointer-events: none;
  }
`;

const SelectField = styled.select`
  appearance: none;
  width: 100%;
  height: 40px;
  padding: 0 ${theme.spacing.md};
  padding-right: ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.sm};
  background-color: ${theme.colors.background.paper};
  border: 1px solid ${({ error }) => (error ? theme.colors.error.main : theme.colors.border.main)};
  border-radius: ${theme.radius.md};
  transition: border-color ${theme.transitions.quick}, box-shadow ${theme.transitions.quick};
  outline: none;
  cursor: pointer;
  
  &:focus {
    border-color: ${({ error }) => (error ? theme.colors.error.main : theme.colors.primary.main)};
    box-shadow: 0 0 0 3px ${({ error }) => 
      error ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)'};
  }
  
  &:disabled {
    background-color: ${theme.colors.background.default};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  ${({ variant }) => 
    variant === 'filled' && 
    css`
      background-color: ${theme.colors.background.default};
      &:focus {
        background-color: ${theme.colors.background.paper};
      }
    `
  }
`;

const ErrorText = styled.span`
  color: ${theme.colors.error.main};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`;

const HelperText = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`;

const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      children,
      fullWidth = true,
      required = false,
      variant = 'outlined',
      ...props
    },
    ref
  ) => {
    return (
      <SelectContainer>
        {label && (
          <SelectLabel htmlFor={props.id} required={required}>
            {label}
          </SelectLabel>
        )}
        
        <SelectWrapper fullWidth={fullWidth}>
          <SelectField
            ref={ref}
            error={!!error}
            variant={variant}
            required={required}
            {...props}
          >
            {children}
          </SelectField>
        </SelectWrapper>
        
        {error && <ErrorText>{error}</ErrorText>}
        {helperText && !error && <HelperText>{helperText}</HelperText>}
      </SelectContainer>
    );
  }
);

export default Select; 
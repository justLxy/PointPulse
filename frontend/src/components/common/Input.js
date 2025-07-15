import { forwardRef } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import theme from '../../styles/theme';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing.md};
  width: 100%;
`;

const InputLabel = styled.label`
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

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.secondary};
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  pointer-events: none;
  
  svg {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }
`;

const InputField = styled.input`
  height: 40px;
  padding: 0 ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  background-color: ${theme.colors.background.paper};
  border: 1px solid ${({ error }) => (error ? theme.colors.error.main : theme.colors.border.main)};
  border-radius: ${theme.radius.md};
  transition: border-color ${theme.transitions.quick}, box-shadow ${theme.transitions.quick};
  outline: none;
  
  ${({ hasLeftIcon }) => 
    hasLeftIcon && 
    css`
      padding-left: 40px;
    `
  }
  
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
  
  ${({ fullWidth }) => 
    fullWidth && 
    css`
      width: 100%;
    `
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

const TextArea = styled(InputField.withComponent('textarea'))`
  height: auto;
  min-height: ${({ rows }) => rows ? `${rows * 1.5 + 1}em` : '100px'};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  resize: vertical;
  line-height: 1.5;
  
  ${({ hasLeftIcon }) => 
    hasLeftIcon && 
    css`
      padding-left: 40px;
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

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      type = 'text',
      fullWidth = true,
      required = false,
      variant = 'outlined',
      leftIcon,
      multiline = false,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const isTextArea = type === 'textarea' || multiline;

    return (
      <InputContainer>
        {label && (
          <InputLabel htmlFor={props.id} required={required}>
            {label}
          </InputLabel>
        )}
        
        <InputWrapper>
          {leftIcon && <IconWrapper className="input-icon-wrapper">{leftIcon}</IconWrapper>}
          
          {isTextArea ? (
            <TextArea 
              ref={ref} 
              error={!!error} 
              fullWidth={fullWidth} 
              variant={variant}
              required={required}
              hasLeftIcon={!!leftIcon}
              rows={rows}
              {...props} 
            />
          ) : (
            <InputField 
              ref={ref}
              type={type} 
              error={!!error} 
              fullWidth={fullWidth} 
              variant={variant}
              required={required}
              hasLeftIcon={!!leftIcon}
              {...props} 
            />
          )}
        </InputWrapper>
        
        {error && <ErrorText>{error}</ErrorText>}
        {helperText && !error && <HelperText>{helperText}</HelperText>}
      </InputContainer>
    );
  }
);

export default Input; 
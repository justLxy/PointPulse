import { css } from '@emotion/react';
import styled from '@emotion/styled';
import theme from '../../styles/theme';
import { FaSpinner } from 'react-icons/fa';

const getVariantStyles = (variant) => {
  const variants = {
    primary: css`
      background-color: ${theme.colors.primary.main};
      color: ${theme.colors.primary.contrastText};
      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary.dark};
      }
    `,
    secondary: css`
      background-color: ${theme.colors.secondary.main};
      color: ${theme.colors.secondary.contrastText};
      &:hover:not(:disabled) {
        background-color: ${theme.colors.secondary.dark};
      }
    `,
    accent: css`
      background-color: ${theme.colors.accent.main};
      color: ${theme.colors.accent.contrastText};
      &:hover:not(:disabled) {
        background-color: ${theme.colors.accent.dark};
      }
    `,
    outlined: css`
      background-color: transparent;
      color: ${theme.colors.primary.main};
      border: 2px solid ${theme.colors.primary.main};
      &:hover:not(:disabled) {
        background-color: rgba(52, 152, 219, 0.1);
      }
    `,
    danger: css`
      background-color: ${theme.colors.error.main};
      color: ${theme.colors.error.contrastText};
      &:hover:not(:disabled) {
        background-color: ${theme.colors.error.dark};
      }
    `,
    text: css`
      background-color: transparent;
      color: ${theme.colors.primary.main};
      padding: ${theme.spacing.xs} ${theme.spacing.sm};
      &:hover:not(:disabled) {
        background-color: rgba(52, 152, 219, 0.1);
      }
      &:active:not(:disabled) {
        background-color: rgba(52, 152, 219, 0.2);
      }
    `,
  };
  
  return variants[variant] || variants.primary;
};

const getSizeStyles = (size) => {
  const sizes = {
    small: css`
      font-size: ${theme.typography.fontSize.xs};
      padding: ${theme.spacing.xs} ${theme.spacing.md};
      height: 32px;
    `,
    medium: css`
      font-size: ${theme.typography.fontSize.sm};
      padding: ${theme.spacing.sm} ${theme.spacing.lg};
      height: 40px;
    `,
    large: css`
      font-size: ${theme.typography.fontSize.md};
      padding: ${theme.spacing.md} ${theme.spacing.xl};
      height: 48px;
    `,
  };
  
  return sizes[size] || sizes.medium;
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  border-radius: ${theme.radius.md};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${theme.transitions.quick};
  border: none;
  outline: none;
  white-space: nowrap;
  
  ${({ variant }) => getVariantStyles(variant)};
  ${({ size }) => getSizeStyles(size)};
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `};
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .spin-icon {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={loading ? null : onClick}
      {...props}
    >
      {loading ? (
        <>
          <FaSpinner className="spin-icon" />
          {children && <span>Please wait...</span>}
        </>
      ) : (
        children
      )}
    </StyledButton>
  );
};

export default Button; 
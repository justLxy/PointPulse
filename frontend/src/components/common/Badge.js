import styled from '@emotion/styled';
import { css } from '@emotion/react';
import theme from '../../styles/theme';

const getVariantStyles = (variant) => {
  const variants = {
    primary: css`
      background-color: ${theme.colors.primary.main};
      color: ${theme.colors.primary.contrastText};
    `,
    secondary: css`
      background-color: ${theme.colors.secondary.main};
      color: ${theme.colors.secondary.contrastText};
    `,
    success: css`
      background-color: ${theme.colors.success.main};
      color: ${theme.colors.success.contrastText};
    `,
    warning: css`
      background-color: ${theme.colors.warning.main};
      color: ${theme.colors.warning.contrastText};
    `,
    error: css`
      background-color: ${theme.colors.error.main};
      color: ${theme.colors.error.contrastText};
    `,
    info: css`
      background-color: ${theme.colors.info.main};
      color: ${theme.colors.info.contrastText};
    `,
    outlined: css`
      background-color: transparent;
      border: 1px solid;
    `,
  };

  return variants[variant] || variants.primary;
};

const getColorStyles = (color, variant) => {
  if (variant !== 'outlined') return '';
  
  const colors = {
    primary: css`
      color: ${theme.colors.primary.main};
      border-color: ${theme.colors.primary.main};
    `,
    secondary: css`
      color: ${theme.colors.secondary.main};
      border-color: ${theme.colors.secondary.main};
    `,
    success: css`
      color: ${theme.colors.success.main};
      border-color: ${theme.colors.success.main};
    `,
    warning: css`
      color: ${theme.colors.warning.main};
      border-color: ${theme.colors.warning.main};
    `,
    error: css`
      color: ${theme.colors.error.main};
      border-color: ${theme.colors.error.main};
    `,
    info: css`
      color: ${theme.colors.info.main};
      border-color: ${theme.colors.info.main};
    `,
  };

  return colors[color] || colors.primary;
};

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeights.medium};
  border-radius: ${({ pill }) => (pill ? theme.radius.full : theme.radius.sm)};
  white-space: nowrap;
  
  ${({ variant }) => getVariantStyles(variant)}
  ${({ color, variant }) => getColorStyles(color, variant)}
  
  ${({ size }) =>
    size === 'large' &&
    css`
      padding: ${theme.spacing.sm} ${theme.spacing.md};
      font-size: ${theme.typography.fontSize.sm};
    `}
`;

const Badge = ({
  children,
  variant = 'primary',
  color = 'primary',
  size = 'medium',
  pill = false,
  ...props
}) => {
  return (
    <StyledBadge variant={variant} color={color} size={size} pill={pill} {...props}>
      {children}
    </StyledBadge>
  );
};

export default Badge; 
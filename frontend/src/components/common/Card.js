import styled from '@emotion/styled';
import { css } from '@emotion/react';
import theme from '../../styles/theme';

const getElevationStyles = (elevation) => {
  const elevations = {
    0: css`
      box-shadow: none;
    `,
    1: css`
      box-shadow: ${theme.shadows.sm};
    `,
    2: css`
      box-shadow: ${theme.shadows.md};
    `,
    3: css`
      box-shadow: ${theme.shadows.lg};
    `,
    4: css`
      box-shadow: ${theme.shadows.xl};
    `,
  };
  
  return elevations[elevation] || elevations[1];
};

const CardContainer = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  padding: ${({ noPadding }) => (noPadding ? '0' : theme.spacing.md)};
  width: 100%;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  
  ${({ elevation }) => getElevationStyles(elevation)};
  
  ${({ interactive }) =>
    interactive &&
    css`
      cursor: pointer;
      &:hover {
        box-shadow: ${theme.shadows.lg};
      }
    `};
    
  ${({ fullHeight }) =>
    fullHeight &&
    css`
      height: 100%;
    `};
`;

const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.sm};
  border-bottom: ${({ divider }) => (divider ? `1px solid ${theme.colors.border.light}` : 'none')};
  padding-bottom: ${({ divider }) => (divider ? theme.spacing.sm : '0')};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.text.primary};
`;

const CardSubtitle = styled.h4`
  margin: ${theme.spacing.xs} 0 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeights.regular};
  color: ${theme.colors.text.secondary};
`;

const CardBody = styled.div`
  ${({ scrollable, maxHeight }) =>
    scrollable &&
    css`
      max-height: ${maxHeight || '300px'};
      overflow-y: auto;
    `};
`;

const CardFooter = styled.div`
  margin-top: ${theme.spacing.lg};
  border-top: ${({ divider }) => (divider ? `1px solid ${theme.colors.border.light}` : 'none')};
  padding-top: ${({ divider }) => (divider ? theme.spacing.md : '0')};
  display: flex;
  justify-content: ${({ align }) => {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'between':
        return 'space-between';
      case 'end':
      default:
        return 'flex-end';
    }
  }};
  align-items: center;
  gap: ${theme.spacing.md};
`;

const Card = ({
  children,
  elevation = 1,
  interactive = false,
  noPadding = false,
  fullHeight = false,
  ...props
}) => {
  return (
    <CardContainer
      elevation={elevation}
      interactive={interactive}
      noPadding={noPadding}
      fullHeight={fullHeight}
      {...props}
    >
      {children}
    </CardContainer>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card; 
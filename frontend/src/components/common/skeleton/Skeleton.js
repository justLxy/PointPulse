import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import theme from '../../../styles/theme';

// Skeleton loading animations
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

// Base skeleton container
const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${theme.colors.background.default} 25%,
    ${theme.colors.border.light} 37%,
    ${theme.colors.background.default} 63%
  );
  background-size: 400px 100%;
  border-radius: ${props => props.rounded || theme.radius.md};
  display: inline-block;
  position: relative;
  overflow: hidden;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  
  ${props => props.width && `width: ${props.width};`}
  ${props => props.height && `height: ${props.height};`}
  ${props => props.className && 'animation: none;'}
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
    );
    animation: ${shimmer} 2s infinite;
  }
`;

// Universal skeleton component
const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  rounded = theme.radius.md,
  className,
  style,
  children,
  variant = 'default',
  ...props 
}) => {
  return (
    <SkeletonBase
      width={width}
      height={height}
      rounded={rounded}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </SkeletonBase>
  );
};

export default Skeleton;

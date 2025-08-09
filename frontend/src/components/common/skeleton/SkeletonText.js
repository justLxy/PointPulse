import React from 'react';
import Skeleton from './Skeleton';
import theme from '../../../styles/theme';

// Text skeleton component
const SkeletonText = ({ 
  lines = 1, 
  width = '100%', 
  height = '16px',
  spacing = theme.spacing.sm,
  variant = 'body',
  ...props 
}) => {
  // Set default height based on variant
  const getHeight = () => {
    switch (variant) {
      case 'title':
        return '32px';
      case 'subtitle':
        return '24px';
      case 'heading':
        return '20px';
      case 'caption':
        return '12px';
      default:
        return height;
    }
  };

  // Generate different widths for multi-line text to simulate real content
  const getLineWidth = (index, total) => {
    if (total === 1) return width;
    if (index === total - 1) return '75%'; // Last line is shorter
    if (index === 0) return '90%'; // First line is slightly shorter
    return '100%';
  };

  if (lines === 1) {
    return (
      <Skeleton 
        width={width} 
        height={getHeight()} 
        rounded={theme.radius.sm}
        {...props} 
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          width={getLineWidth(index, lines)}
          height={getHeight()}
          rounded={theme.radius.sm}
          {...props}
        />
      ))}
    </div>
  );
};

export default SkeletonText;

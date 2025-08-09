import React from 'react';
import Skeleton from './Skeleton';

// Circle skeleton component (for avatars, icons, etc.)
const SkeletonCircle = ({ 
  size = '40px', 
  ...props 
}) => {
  return (
    <Skeleton 
      width={size} 
      height={size} 
      rounded="50%"
      {...props} 
    />
  );
};

export default SkeletonCircle;

import React from 'react';
import styled from '@emotion/styled';
import Skeleton from './Skeleton';
import SkeletonText from './SkeletonText';
import SkeletonCircle from './SkeletonCircle';
import theme from '../../../styles/theme';

const CardContainer = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.border.light};
  ${props => props.fullHeight && 'height: 100%;'}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: ${props => props.height || '200px'};
  margin-bottom: ${theme.spacing.md};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  justify-content: flex-end;
`;

// Universal skeleton card component
const SkeletonCard = ({ 
  variant = 'default',
  hasImage = false,
  imageHeight = '200px',
  hasAvatar = false,
  hasActions = false,
  actionsCount = 2,
  fullHeight = false,
  ...props 
}) => {
  const renderContent = () => {
    switch (variant) {
      case 'user':
        return (
          <>
            <CardHeader>
              <SkeletonCircle size="48px" />
              <CardContent style={{ flex: 1 }}>
                <SkeletonText variant="heading" width="60%" />
                <SkeletonText variant="caption" width="40%" />
              </CardContent>
            </CardHeader>
            <CardContent>
              <SkeletonText lines={2} />
              <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                <Skeleton width="60px" height="24px" rounded={theme.radius.md} />
                <Skeleton width="50px" height="24px" rounded={theme.radius.md} />
              </div>
            </CardContent>
          </>
        );
        
      case 'event':
        return (
          <>
            {hasImage && (
              <ImagePlaceholder height={imageHeight}>
                <Skeleton width="100%" height="100%" />
              </ImagePlaceholder>
            )}
            <CardContent>
              <SkeletonText variant="title" width="80%" />
              <SkeletonText lines={2} />
              <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.md }}>
                <SkeletonText width="80px" />
                <SkeletonText width="120px" />
              </div>
            </CardContent>
          </>
        );
        
      case 'product':
        return (
          <>
            <ImagePlaceholder height={imageHeight}>
              <Skeleton width="100%" height="100%" />
            </ImagePlaceholder>
            <CardContent>
              <SkeletonText variant="heading" width="90%" />
              <SkeletonText lines={2} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.md }}>
                <SkeletonText variant="title" width="60px" />
                <Skeleton width="80px" height="32px" rounded={theme.radius.md} />
              </div>
            </CardContent>
          </>
        );
        
      case 'transaction':
        return (
          <>
            <CardHeader>
              <SkeletonCircle size="40px" />
              <CardContent style={{ flex: 1 }}>
                <SkeletonText variant="heading" width="70%" />
                <SkeletonText variant="caption" width="50%" />
              </CardContent>
              <SkeletonText width="60px" />
            </CardHeader>
          </>
        );
        
      case 'promotion':
        return (
          <>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
                <SkeletonText variant="heading" width="70%" />
                <Skeleton width="60px" height="24px" rounded={theme.radius.md} />
              </div>
              <SkeletonText lines={2} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
                <SkeletonText width="80%" />
                <SkeletonText width="90%" />
                <SkeletonText width="70%" />
                <SkeletonText width="85%" />
              </div>
            </CardContent>
          </>
        );
        
      default:
        return (
          <>
            {hasAvatar && (
              <CardHeader>
                <SkeletonCircle size="40px" />
                <SkeletonText variant="heading" width="60%" />
              </CardHeader>
            )}
            {hasImage && (
              <ImagePlaceholder height={imageHeight}>
                <Skeleton width="100%" height="100%" />
              </ImagePlaceholder>
            )}
            <CardContent>
              <SkeletonText variant="heading" width="75%" />
              <SkeletonText lines={3} />
            </CardContent>
          </>
        );
    }
  };

  return (
    <CardContainer fullHeight={fullHeight} {...props}>
      {renderContent()}
      {hasActions && (
        <ActionButtons>
          {Array.from({ length: actionsCount }, (_, index) => (
            <Skeleton 
              key={index}
              width="80px" 
              height="32px" 
              rounded={theme.radius.md}
            />
          ))}
        </ActionButtons>
      )}
    </CardContainer>
  );
};

export default SkeletonCard;

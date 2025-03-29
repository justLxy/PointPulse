import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import theme from '../../styles/theme';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const drawLine = keyframes`
  0% { stroke-dashoffset: 1000; }
  100% { stroke-dashoffset: 0; }
`;

const beatLine = keyframes`
  0% { transform: scaleY(1); }
  30% { transform: scaleY(1.03); }
  60% { transform: scaleY(0.97); }
  100% { transform: scaleY(1); }
`;

const circlePulse = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.8; }
  75% { transform: scale(0.9); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
`;

const circleRhythm = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  min-height: 200px;
`;

const LogoContainer = styled.div`
  width: 150px;
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeartbeatSVG = styled.svg`
  width: 100%;
  height: 100%;
  
  .heartbeat-line {
    stroke: #28A9E0;
    stroke-width: 10;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
    animation: 
      ${drawLine} 2s ease-out forwards,
      ${beatLine} 1.5s ease-in-out infinite;
    transform-origin: center;
  }
  
  .circle-left {
    fill: #28A9E0;
    animation: 
      ${circlePulse} 0.6s ease-out 0.6s forwards,
      ${circleRhythm} 2s ease-in-out 1.5s infinite;
    opacity: 0;
    transform-origin: center;
  }
  
  .circle-right {
    fill: #28A9E0;
    animation: 
      ${circlePulse} 0.6s ease-out 1.2s forwards,
      ${circleRhythm} 2s ease-in-out 2s infinite;
    opacity: 0;
    transform-origin: center;
  }
`;

const LoadingText = styled.div`
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.lg};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <LoadingContainer>
      <LogoContainer>
        <HeartbeatSVG viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            className="heartbeat-line"
            d="M100,100 L180,100 L220,40 L280,160 L320,100 L400,100" 
          />
          <circle className="circle-left" cx="100" cy="100" r="20" />
          <circle className="circle-right" cx="400" cy="100" r="20" />
        </HeartbeatSVG>
      </LogoContainer>
      <LoadingText>{text}</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingSpinner; 
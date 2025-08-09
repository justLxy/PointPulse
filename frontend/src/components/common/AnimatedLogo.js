/**
 * AnimatedLogo Component
 * Custom animated logo with pulse, wave, and orbit animations
 * Animation techniques inspired by:
 * - https://animista.net/
 * - https://tympanus.net/codrops/2019/01/31/custom-cursor-effects/
 * - https://codepen.io/designcouch/pen/exkBf
 */
import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import theme from '../../styles/theme';

// Pulse animation for glow effect
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(52, 152, 219, 0); }
  100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
`;

// Wave animation
const wave = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-1px); }
  100% { transform: translateY(0); }
`;

// Drawing animation
const draw = keyframes`
  0% { stroke-dashoffset: 1000; }
  100% { stroke-dashoffset: 0; }
`;

// Fade in for text
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Rotation animation for the circles
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Shimmer animation
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Float animation
const float = keyframes`
  0% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-5px) rotate(1deg); }
  100% { transform: translateY(0) rotate(0); }
`;

const LogoWrapper = styled.div`
  position: relative;
  animation: ${float} 6s ease-in-out infinite;
`;

const LogoContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary.light}, ${theme.colors.primary.main});
  animation: ${pulse} 2s infinite;
  box-shadow: 
    0 10px 30px rgba(52, 152, 219, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    0 -5px 15px rgba(0, 0, 0, 0.1) inset;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg, 
      rgba(255, 255, 255, 0) 0%, 
      rgba(255, 255, 255, 0.2) 50%, 
      rgba(255, 255, 255, 0) 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 5s infinite linear;
    z-index: 1;
  }
`;

const GlowEffect = styled.div`
  position: absolute;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  opacity: 0.3;
  filter: blur(8px);
  z-index: 0;
`;

const LogoSVG = styled.svg`
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 2;
  
  .pulse-line {
    stroke: white;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: ${draw} 2s forwards ease-in-out;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.7));
  }
  
  .dot-left, .dot-right {
    fill: white;
    opacity: 0;
    animation: ${fadeIn} 0.5s forwards ease-out;
    animation-delay: 1.5s;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.7));
  }
`;

const LogoText = styled.h1`
  margin: ${theme.spacing.md} 0 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${theme.colors.primary.main};
  letter-spacing: 1.2px;
  text-align: center;
  position: relative;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  
  span {
    display: inline-block;
    opacity: 0;
    animation: ${fadeIn} 0.3s forwards, ${wave} 1.5s infinite 2s;
    
    &:nth-of-type(1) { animation-delay: 0.1s, 1s; }
    &:nth-of-type(2) { animation-delay: 0.15s, 1.05s; }
    &:nth-of-type(3) { animation-delay: 0.2s, 1.1s; }
    &:nth-of-type(4) { animation-delay: 0.25s, 1.15s; }
    &:nth-of-type(5) { animation-delay: 0.3s, 1.2s; }
    &:nth-of-type(6) { animation-delay: 0.35s, 1.25s; }
    &:nth-of-type(7) { animation-delay: 0.4s, 1.3s; }
    &:nth-of-type(8) { animation-delay: 0.45s, 1.35s; }
    &:nth-of-type(9) { animation-delay: 0.5s, 1.4s; }
    &:nth-of-type(10) { animation-delay: 0.55s, 1.45s; }
  }
`;

const CircleOrbit = styled.div`
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 1px dashed rgba(255, 255, 255, 0.4);
  animation: ${rotate} 20s linear infinite;
  z-index: 1;
`;

const OrbitDot = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
  top: ${props => props.top || '0'};
  left: ${props => props.left || '0'};
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const AnimatedLogo = () => {
  return (
    <LogoWrapper>
      <LogoContainer>
        <GlowEffect />
        <CircleOrbit>
          <OrbitDot top="0%" left="50%" />
          <OrbitDot top="50%" left="0%" />
          <OrbitDot top="100%" left="50%" />
          <OrbitDot top="50%" left="100%" />
        </CircleOrbit>
        <LogoSVG viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <path
            className="pulse-line"
            d="M10,25 L30,25 L40,10 L50,40 L60,25 L90,25"
          />
          <circle className="dot-left" cx="10" cy="25" r="4" />
          <circle className="dot-right" cx="90" cy="25" r="4" />
        </LogoSVG>
      </LogoContainer>
      <LogoText>
        <span>P</span>
        <span>o</span>
        <span>i</span>
        <span>n</span>
        <span>t</span>
        <span>P</span>
        <span>u</span>
        <span>l</span>
        <span>s</span>
        <span>e</span>
      </LogoText>
    </LogoWrapper>
  );
};

export default AnimatedLogo; 
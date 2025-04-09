/**
 * SuccessPage Component
 * A reusable animated success page with customizable elements
 * UI design inspired by:
 * - https://dribbble.com/shots/6822545-Payment-Success
 * - https://codepen.io/ainalem/pen/GRqjvMy
 * - Animation techniques from https://animate.style/
 */
import React from 'react';
import styled from '@emotion/styled';
import { FaCheckCircle } from 'react-icons/fa';
import Button from './Button';
import theme from '../../styles/theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  max-width: 650px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const IconWrapper = styled.div`
  position: relative;
  margin-bottom: ${theme.spacing.lg};
`;

const IconBackground = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ bgColor }) => bgColor || `linear-gradient(135deg, ${theme.colors.success.light}, ${theme.colors.success.main})`};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ shadowColor }) => shadowColor || `0 8px 20px rgba(72, 187, 120, 0.3)`};
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 ${({ pulseColor }) => pulseColor || 'rgba(72, 187, 120, 0.4)'};
    }
    70% {
      box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    background: ${({ glowColor }) => glowColor || 'rgba(72, 187, 120, 0.1)'};
    border-radius: 50%;
    z-index: -1;
  }
  
  svg {
    font-size: 40px;
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    animation: scaleIn 0.5s ease-out;
    
    @keyframes scaleIn {
      0% {
        transform: scale(0);
      }
      70% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }
  }
`;

const Title = styled.h2`
  margin: 0 0 ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  background: ${({ gradientColors }) => gradientColors || `linear-gradient(135deg, ${theme.colors.primary.dark}, ${theme.colors.success.dark})`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 0.8s ease;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Description = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.md};
  max-width: 500px;
  line-height: 1.4;
  animation: fadeInUp 1s ease;
`;

const Card = styled.div`
  width: 100%;
  border-radius: ${theme.radius.lg};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  margin-bottom: ${theme.spacing.md};
  overflow: hidden;
  border: 1px solid ${theme.colors.border.light};
  background: white;
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeInUp 1.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
  }
`;

const CardHeader = styled.div`
  background: ${({ bgGradient }) => bgGradient || `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark})`};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  
  h3 {
    margin: 0;
    font-size: ${theme.typography.fontSize.lg};
    font-weight: ${theme.typography.fontWeights.semiBold};
    color: white;
    letter-spacing: 0.5px;
  }
`;

const CardBody = styled.div`
  padding: ${theme.spacing.md};
  background-color: white;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  transition: background-color 0.2s ease;
  
  &:last-of-type {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  .label {
    color: ${theme.colors.text.secondary};
    font-weight: ${theme.typography.fontWeights.medium};
    display: flex;
    align-items: center;
    
    svg {
      margin-right: ${theme.spacing.sm};
      color: ${theme.colors.primary.main};
      font-size: 14px;
    }
  }
  
  .value {
    font-weight: ${theme.typography.fontWeights.semiBold};
    color: ${theme.colors.text.primary};
  }
`;

const TotalItem = styled(DetailItem)`
  font-weight: ${theme.typography.fontWeights.bold};
  font-size: ${theme.typography.fontSize.md};
  padding: ${theme.spacing.md} 0 ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
  border-top: 2px solid ${theme.colors.border.main};
  border-bottom: none;
  background-color: transparent;
  
  &:hover {
    background-color: transparent;
  }
  
  .label {
    color: ${theme.colors.text.primary};
    font-weight: ${theme.typography.fontWeights.bold};
  }
  
  .value {
    color: ${({ isPositive }) => isPositive ? theme.colors.success.main : theme.colors.error.main};
    font-weight: ${theme.typography.fontWeights.bold};
    position: relative;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background-color: ${({ isPositive }) => isPositive ? 'rgba(72, 187, 120, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
    border-radius: ${theme.radius.md};
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: ${theme.radius.md};
      box-shadow: 0 0 0 2px ${({ isPositive }) => isPositive ? theme.colors.success.main : theme.colors.error.main};
      opacity: 0.3;
    }
  }
`;

const ActionButton = styled(Button)`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  font-size: ${theme.typography.fontSize.md};
  border-radius: ${theme.radius.lg};
  background: ${({ bgGradient }) => bgGradient || `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark})`};
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

/**
 * SuccessPage Component
 * 
 * A reusable success page component that displays a success message with animation and details
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon to display (default: FaCheckCircle)
 * @param {Object} props.iconColors - Custom colors for the icon background (optional)
 * @param {string} props.title - Title text to display
 * @param {string} props.description - Description text to display
 * @param {string} props.cardTitle - Title of the details card
 * @param {Array} props.details - Array of detail items to display in the card
 * @param {Object} props.total - Special total item to display at the bottom of details
 * @param {string} props.buttonText - Text for the action button
 * @param {Function} props.onButtonClick - Function to execute when the action button is clicked
 * @param {string} props.buttonBgGradient - Custom gradient for the button (optional)
 */
const SuccessPage = ({
  icon = <FaCheckCircle />,
  iconColors = {},
  title = "Success",
  description = "Your operation was completed successfully.",
  cardTitle = "Details",
  details = [],
  total = null,
  buttonText = "Continue",
  onButtonClick = () => {},
  buttonBgGradient = null
}) => {
  return (
    <Container>
      <IconWrapper>
        <IconBackground 
          bgColor={iconColors.background}
          shadowColor={iconColors.shadow}
          pulseColor={iconColors.pulse}
          glowColor={iconColors.glow}
        >
          {icon}
        </IconBackground>
      </IconWrapper>
      
      <Title gradientColors={iconColors.titleGradient}>{title}</Title>
      <Description>{description}</Description>
      
      {details.length > 0 && (
        <Card>
          <CardHeader bgGradient={iconColors.headerGradient}>
            <h3>{cardTitle}</h3>
          </CardHeader>
          <CardBody>
            {details.map((detail, index) => (
              <DetailItem key={index}>
                <span className="label">
                  {detail.icon && detail.icon}
                  {detail.label}
                </span>
                <span className="value">{detail.value}</span>
              </DetailItem>
            ))}
            
            {total && (
              <TotalItem isPositive={total.isPositive}>
                <span className="label">{total.label}</span>
                <span className="value">{total.value}</span>
              </TotalItem>
            )}
          </CardBody>
        </Card>
      )}
      
      <ActionButton 
        onClick={onButtonClick}
        bgGradient={buttonBgGradient || iconColors.buttonGradient}
      >
        {buttonText}
      </ActionButton>
    </Container>
  );
};

export default SuccessPage; 
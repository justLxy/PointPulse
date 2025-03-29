import styled from '@emotion/styled';
import { FaHeart } from 'react-icons/fa';
import theme from '../../styles/theme';

const FooterContainer = styled.footer`
  background-color: ${theme.colors.background.paper};
  border-top: 1px solid ${theme.colors.border.light};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  text-align: center;
  margin-top: auto;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
`;

const FooterLogo = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.primary.main};
  margin-bottom: ${theme.spacing.md};
`;

const Copyright = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterLogo>PointPulse</FooterLogo>
        <Copyright>
          &copy; {currentYear} PointPulse. All rights reserved.
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer; 
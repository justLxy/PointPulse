import styled from '@emotion/styled';
import Header from './Header';
import Footer from './Footer';
import FloatingScanButton from '../common/FloatingScanButton';
import theme from '../../styles/theme';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${theme.spacing.xl};
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.lg} ${theme.spacing.md};
  }
`;

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Header />
      <MainContent>{children}</MainContent>
      <Footer />
      <FloatingScanButton />
    </LayoutContainer>
  );
};

export default Layout; 
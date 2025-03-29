import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import theme from '../../styles/theme';
import { FaLock, FaUser, FaSignInAlt, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
  background-image: linear-gradient(to right, ${theme.colors.primary.light}, ${theme.colors.secondary.light});
`;

const Card = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.xl};
  width: 100%;
  max-width: 450px;
  padding: ${theme.spacing.xl};
  animation: ${fadeIn} 0.5s ease-out;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  
  img {
    height: 80px;
    width: auto;
  }
  
  h1 {
    margin-top: ${theme.spacing.md};
    font-size: ${theme.typography.fontSize['3xl']};
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.primary.main};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 8px;
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  z-index: 5;
  padding: 0;
  
  &:hover {
    color: ${theme.colors.primary.main};
  }
`;

const ForgotPassword = styled(Link)`
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography.fontSize.sm};
  text-align: right;
  margin-top: -${theme.spacing.sm};
  
  &:hover {
    text-decoration: underline;
    color: ${theme.colors.primary.dark};
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(231, 76, 60, 0.1);
  color: ${theme.colors.error.main};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radius.md};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  border-left: 4px solid ${theme.colors.error.main};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${theme.spacing.sm};
    min-width: 16px;
  }
`;

// 添加自定义输入框样式，确保图标显示正确
const StyledInput = styled(Input)`
  .input-icon-wrapper {
    color: ${theme.colors.text.secondary};
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const Login = () => {
  const [utorid, setUtorid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('Already authenticated, redirecting to dashboard');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!utorid.trim() || !password.trim()) {
      setError('Please enter both UTORid and password');
      return;
    }
    
    try {
      const { success, error } = await login(utorid, password);
      
      if (success) {
        navigate(from, { replace: true });
      } else {
        if (error?.status === 401) {
          setError('Incorrect UTORid or password. Please check your credentials and try again.');
        } else if (error?.message?.includes('network')) {
          setError('Network error. Please check your internet connection and try again.');
        } else if (error?.message) {
          setError(error.message);
        } else {
          setError('Authentication failed. Please verify your credentials and try again.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('We couldn\'t process your login request. This might be due to a server issue. Please try again later.');
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <Container>
        <Card>
          <Logo>
            <img src="/logo.png" alt="PointPulse Logo" />
            <h1>PointPulse</h1>
          </Logo>
          <LoadingSpinner text="Checking login status..." />
        </Card>
      </Container>
    );
  }
  
  // Only render login form if not authenticated
  return (
    <Container>
      <Card>
        <Logo>
          <img src="/logo.png" alt="PointPulse Logo" />
          <h1>PointPulse</h1>
        </Logo>
        
        {error && (
          <ErrorMessage>
            <FaExclamationTriangle />
            {error}
          </ErrorMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <StyledInput
              type="text"
              placeholder="UTORid"
              value={utorid}
              onChange={(e) => setUtorid(e.target.value)}
              required
              leftIcon={<FaUser size={16} />}
            />
          </InputGroup>
          
          <InputGroup>
            <StyledInput
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<FaLock size={16} />}
            />
            <PasswordToggle 
              type="button" 
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
            </PasswordToggle>
          </InputGroup>
          
          <ForgotPassword to="/password-reset">Forgot your password?</ForgotPassword>
          
          <Button type="submit" fullWidth>
            <FaSignInAlt /> Login
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Login; 
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import theme from '../../styles/theme';
import { FaUser, FaLock, FaArrowLeft, FaCheck, FaKey, FaExclamationTriangle } from 'react-icons/fa';
import AnimatedLogo from '../../components/common/AnimatedLogo';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

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

const floatParticle = keyframes`
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(15px, -15px);
  }
  100% {
    transform: translate(0, 0);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, #2193b0, #6dd5ed);
  position: relative;
  overflow: hidden;
  
  &::before, &::after {
    content: "";
    position: absolute;
    width: 80vw;
    height: 80vw;
    top: -40vw;
    left: -20vw;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
    border-radius: 50%;
    z-index: 0;
    animation: ${floatParticle} 15s ease-in-out infinite;
  }
  
  &::after {
    top: auto;
    bottom: -40vw;
    left: auto;
    right: -20vw;
    width: 70vw;
    height: 70vw;
    animation: ${floatParticle} 18s ease-in-out infinite reverse;
  }
`;

const Particle = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: ${props => props.size || '30px'};
  height: ${props => props.size || '30px'};
  top: ${props => props.top || '10%'};
  left: ${props => props.left || '10%'};
  animation: ${floatParticle} ${props => props.duration || '15s'} ease-in-out infinite ${props => props.delay || '0s'};
  z-index: 0;
`;

const Card = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.xl}, 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  padding: ${theme.spacing.xl};
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
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

const BackToLogin = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.lg};
  
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

const SuccessMessage = styled.div`
  background-color: rgba(46, 204, 113, 0.1);
  color: ${theme.colors.success.main};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radius.md};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  border-left: 4px solid ${theme.colors.success.main};
  
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const PasswordRules = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: ${theme.spacing.sm} 0 ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  
  li {
    margin-bottom: ${theme.spacing.xs};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    
    &::before {
      content: '•';
      color: ${theme.colors.primary.main};
    }
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

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.xs};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  line-height: 1.5;
`;

const AccountActivation = () => {
  const [resetToken, setResetToken] = useState('');
  const [utorid, setUtorid] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  
  useEffect(() => {
    // Extract utorid and resetToken from query params if available
    const params = new URLSearchParams(location.search);
    const utoridParam = params.get('utorid');
    const tokenParam = params.get('token');
    
    if (utoridParam) {
      setUtorid(utoridParam);
    }
    
    if (tokenParam) {
      setResetToken(tokenParam);
    }
  }, [location.search]);
  
  const validatePassword = (password) => {
    // At least 8 characters, max 20
    if (password.length < 8 || password.length > 20) {
      return false;
    }
    
    // Check for at least one uppercase, one lowercase, one number, one special character
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!resetToken.trim()) {
      setError('Please enter your activation token');
      return;
    }
    
    if (!utorid.trim()) {
      setError('Please enter your UTORid');
      return;
    }
    
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Password does not meet all requirements');
      return;
    }
    
    try {
      setLoading(true);
      const { success, error } = await resetPassword(resetToken, utorid, password);
      
      if (success) {
        toast.success('Account activated successfully!');
        navigate('/login');
      } else {
        setError(error.message || 'Failed to activate account');
      }
    } catch (err) {
      setError('Account activation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <Particle size="50px" top="20%" left="15%" duration="20s" />
      <Particle size="80px" top="60%" left="75%" duration="25s" delay="5s" />
      <Particle size="20px" top="30%" left="80%" duration="15s" delay="2s" />
      <Particle size="35px" top="70%" left="25%" duration="18s" delay="7s" />
      <Card>
        <Logo>
          <AnimatedLogo />
        </Logo>
        
        <Title>Activate Your Account</Title>
        <Subtitle>Enter your activation token and set your password</Subtitle>
        
        {error && (
          <ErrorMessage>
            <FaExclamationTriangle />
            {error}
          </ErrorMessage>
        )}
        {success && (
          <SuccessMessage>
            <FaCheck /> Account activated successfully! Redirecting to login...
          </SuccessMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <StyledInput
              type="text"
              placeholder="UTORid"
              value={utorid}
              onChange={(e) => setUtorid(e.target.value)}
              required
              disabled={success}
              leftIcon={<FaUser size={16} />}
            />
          </InputGroup>
          
          <InputGroup>
            <StyledInput
              type="text"
              placeholder="Activation Token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
              disabled={success}
              leftIcon={<FaKey size={16} />}
            />
          </InputGroup>
          
          <div>
            <InputGroup>
              <StyledInput
                type="password"
                placeholder="Set Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={success}
                leftIcon={<FaLock size={16} />}
              />
            </InputGroup>
            
            <PasswordRules>
              <li>8-20 characters long</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </PasswordRules>
          </div>
          
          <InputGroup>
            <StyledInput
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={success}
              leftIcon={<FaLock size={16} />}
            />
          </InputGroup>
          
          <Button type="submit" fullWidth loading={loading} disabled={success}>
            Activate Account
          </Button>
        </Form>
        
        <BackToLogin to="/login">
          <FaArrowLeft size={12} /> Back to Login
        </BackToLogin>
      </Card>
    </Container>
  );
};

export default AccountActivation; 
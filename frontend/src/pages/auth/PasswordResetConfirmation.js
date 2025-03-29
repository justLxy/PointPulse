import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import theme from '../../styles/theme';
import { FaUser, FaLock, FaArrowLeft, FaCheck } from 'react-icons/fa';

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
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.primary.main};
  }
  
  p {
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.sm};
    margin-top: ${theme.spacing.sm};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const InputGroup = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 12px;
    top: 12px;
    color: ${theme.colors.text.secondary};
  }
  
  input {
    padding-left: 40px;
  }
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

const PasswordResetConfirmation = () => {
  const [utorid, setUtorid] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  useEffect(() => {
    // Extract utorid from query params if available
    const params = new URLSearchParams(location.search);
    const utoridParam = params.get('utorid');
    if (utoridParam) {
      setUtorid(utoridParam);
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
    
    if (!utorid.trim()) {
      setError('Please enter your UTORid');
      return;
    }
    
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password');
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
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(error.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <Card>
        <Logo>
          <img src="/logo.png" alt="PointPulse Logo" />
          <h1>Reset Your Password</h1>
          <p>Enter your new password below</p>
        </Logo>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && (
          <SuccessMessage>
            <FaCheck /> Password reset successful! Redirecting to login...
          </SuccessMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <FaUser size={16} />
            <Input
              type="text"
              placeholder="UTORid"
              value={utorid}
              onChange={(e) => setUtorid(e.target.value)}
              required
              disabled={success}
            />
          </InputGroup>
          
          <div>
            <InputGroup>
              <FaLock size={16} />
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={success}
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
            <FaLock size={16} />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={success}
            />
          </InputGroup>
          
          <Button type="submit" fullWidth loading={loading} disabled={success}>
            Reset Password
          </Button>
        </Form>
        
        <BackToLogin to="/login">
          <FaArrowLeft size={12} /> Back to Login
        </BackToLogin>
      </Card>
    </Container>
  );
};

export default PasswordResetConfirmation; 
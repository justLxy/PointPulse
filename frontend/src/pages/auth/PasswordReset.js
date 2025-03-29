import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import theme from '../../styles/theme';
import { FaUser, FaArrowLeft } from 'react-icons/fa';

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
`;

const ResetInfo = styled.div`
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background-color: rgba(52, 152, 219, 0.1);
  border-radius: ${theme.radius.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  
  code {
    display: block;
    padding: ${theme.spacing.sm};
    background-color: ${theme.colors.background.dark};
    color: white;
    border-radius: ${theme.radius.sm};
    margin-top: ${theme.spacing.sm};
    word-break: break-all;
    font-family: monospace;
  }
`;

const PasswordReset = () => {
  const [utorid, setUtorid] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!utorid.trim()) {
      setError('Please enter your UTORid');
      return;
    }
    
    try {
      setLoading(true);
      const { success, data, error } = await requestPasswordReset(utorid);
      
      if (success) {
        setSuccess(true);
        if (data && data.resetToken) {
          setResetToken(data.resetToken);
        }
      } else {
        setError(error.message || 'Failed to request password reset');
      }
    } catch (err) {
      setError('Password reset request failed. Please try again.');
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
          <p>Enter your UTORid and we'll send you a reset link</p>
        </Logo>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && (
          <SuccessMessage>
            Password reset request sent successfully. Please check your email for instructions.
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
          
          <Button type="submit" fullWidth loading={loading} disabled={success}>
            Request Password Reset
          </Button>
        </Form>
        
        {resetToken && (
          <ResetInfo>
            <strong>For development purposes only:</strong> Use this token to reset your password:
            <code>{resetToken}</code>
            <Link to={`/password-reset/${resetToken}?utorid=${utorid}`}>
              <Button variant="outlined" fullWidth style={{ marginTop: theme.spacing.md }}>
                Continue to Reset Password
              </Button>
            </Link>
          </ResetInfo>
        )}
        
        <BackToLogin to="/login">
          <FaArrowLeft size={12} /> Back to Login
        </BackToLogin>
      </Card>
    </Container>
  );
};

export default PasswordReset; 
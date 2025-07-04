/**
 * Login Page Component
 * 
 * This component handles the user login functionality of the website. It includes:
 * - A form for entering a UTORid and password
 * - Functionality to toggle password visibility
 * - Validation and error handling for login attempts
 * - Animated background particles and styled UI elements
 * 
 * References:
 * - Emotion documentation: https://emotion.sh/docs/introduction
 * - React Icons documentation: https://react-icons.github.io/react-icons/
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import theme from '../../styles/theme';
import { FaExclamationTriangle, FaUserPlus, FaEnvelope, FaKey, FaArrowLeft } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AnimatedLogo from '../../components/common/AnimatedLogo';
import AuthService from '../../services/auth.service';

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

// Add custom input styles to ensure icons display correctly
const StyledInput = styled(Input)`
  .input-icon-wrapper {
    color: ${theme.colors.text.secondary};
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;



const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary.main};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  
  &:hover {
    color: ${theme.colors.primary.dark};
  }
`;

const SuccessMessage = styled.div`
  background-color: rgba(39, 174, 96, 0.1);
  color: ${theme.colors.success.main};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radius.md};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  border-left: 4px solid ${theme.colors.success.main};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${theme.spacing.sm};
    min-width: 16px;
  }
`;

const OTPInput = styled(Input)`
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 0.5rem;
  font-weight: bold;
  
  input {
    text-align: center;
    font-size: 1.5rem;
    letter-spacing: 0.5rem;
    font-weight: bold;
  }
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary.main};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  text-decoration: underline;
  margin-top: ${theme.spacing.sm};
  
  &:hover {
    color: ${theme.colors.primary.dark};
  }
  
  &:disabled {
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
    text-decoration: none;
  }
`;

const Timer = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-left: ${theme.spacing.sm};
`;

const Login = () => {
  // Email login states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailStep, setEmailStep] = useState('email'); // 'email' or 'otp'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  
  const { isAuthenticated, loading, emailLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const fromState = location.state?.from;
  // 获取URL中的returnUrl参数，如果存在则优先使用
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl');
  const decodedReturnUrl = returnUrl ? decodeURIComponent(returnUrl) : null;
  
  // 优先使用returnUrl参数，其次是state中的from，最后是首页
  const from = decodedReturnUrl || (typeof fromState === 'string' ? fromState : (fromState?.pathname || '/'));
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from || '/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  // Timer for resend button
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      if (emailStep === 'email') {
        await handleEmailLogin();
      } else if (emailStep === 'otp') {
        await handleOTPVerification();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!AuthService.isValidUofTEmail(email)) {
      setError('Please use a valid University of Toronto email address (@mail.utoronto.ca)');
      return;
    }
    
    try {
      const result = await AuthService.requestEmailLogin(email);
      setSuccessMessage('Verification code sent to your email. Please check your inbox.');
      setEmailStep('otp');
      setResendTimer(60); // 60 second cooldown
    } catch (err) {
      setError(err.message || 'Failed to send verification email');
    }
  };

  const handleOTPVerification = async () => {
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }
    
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    
    try {
      const result = await emailLogin(email, otp);
      
      if (result.success) {
        setSuccessMessage('Login successful! Redirecting...');
        // AuthContext will handle navigation automatically when isAuthenticated changes
      } else {
        setError(result.error.message);
        // Clear OTP input so user can try again
        setOtp('');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify login');
      // Clear OTP input so user can try again
      setOtp('');
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      await AuthService.requestEmailLogin(email);
      setSuccessMessage('Verification code sent again. Please check your inbox.');
      setResendTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

    const goBackToEmail = () => {
    setEmailStep('email');
    setOtp('');
    setError('');
    setSuccessMessage('');
  };
  
  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <Container>
        <Particle size="50px" top="20%" left="15%" duration="20s" />
        <Particle size="80px" top="60%" left="75%" duration="25s" delay="5s" />
        <Particle size="20px" top="30%" left="80%" duration="15s" delay="2s" />
        <Particle size="35px" top="70%" left="25%" duration="18s" delay="7s" />
        <Card>
          <LoadingSpinner text="Checking login status..." />
        </Card>
      </Container>
    );
  }
  
  // Only render login form if not authenticated
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
        
        {/* Step indicator for email login */}
        <StepIndicator>
          {emailStep === 'email' ? (
            <>
              <FaEnvelope size={14} />
              Step 1: Enter your University of Toronto email
            </>
          ) : (
            <>
              <FaKey size={14} />
              Step 2: Enter verification code
            </>
          )}
        </StepIndicator>

        {/* Back button for OTP step */}
        {emailStep === 'otp' && (
          <BackButton type="button" onClick={goBackToEmail}>
            <FaArrowLeft size={12} />
            Back to email
          </BackButton>
        )}
        
        {/* Error Message */}
        {error && (
          <ErrorMessage>
            <FaExclamationTriangle />
            {error}
          </ErrorMessage>
        )}

        {/* Success Message */}
        {successMessage && (
          <SuccessMessage>
            <FaEnvelope />
            {successMessage}
          </SuccessMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          {emailStep === 'email' && (
            <>
              <InputGroup>
                <StyledInput
                  type="email"
                  placeholder="your.email@mail.utoronto.ca"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={<FaEnvelope size={16} />}
                />
              </InputGroup>
              
              <Button type="submit" fullWidth disabled={isSubmitting}>
                <FaEnvelope /> {isSubmitting ? 'Sending...' : 'Send Verification Code'}
              </Button>
              
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link 
                  to="/account-activation"
                  style={{ 
                    color: theme.colors.primary.main,
                    fontSize: theme.typography.fontSize.sm,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <FaUserPlus size={14} /> Need to activate your account?
                </Link>
              </div>
            </>
          )}

          {emailStep === 'otp' && (
            <>
              <InputGroup>
                <OTPInput
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setOtp(value);
                    }
                  }}
                  maxLength="6"
                  required
                  leftIcon={<FaKey size={16} />}
                />
              </InputGroup>
              
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Verification code sent to: <strong>{email}</strong>
                </p>
                <ResendButton 
                  type="button" 
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isSubmitting}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </ResendButton>
              </div>
              
              <Button type="submit" fullWidth disabled={isSubmitting}>
                <FaKey /> {isSubmitting ? 'Verifying...' : 'Verify & Login'}
              </Button>
            </>
          )}
        </Form>
      </Card>
    </Container>
  );
};

export default Login; 
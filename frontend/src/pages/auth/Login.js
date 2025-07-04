/**
 * Login Page Component
 * 
 * This component handles the user login functionality using email-based OTP authentication:
 * - A form for entering a University of Toronto email address
 * - OTP (One-Time Password) verification
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
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft, FaExclamationTriangle, FaCheckCircle, FaUserPlus } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AnimatedLogo from '../../components/common/AnimatedLogo';

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
  max-width: 400px;
  padding: ${theme.spacing.xl};
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 0;
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

const AccountActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: ${theme.spacing.md};
`;

const LinkButton = styled(Link)`
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography.fontSize.sm};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  
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

// Add custom input styles to ensure icons display correctly
const StyledInput = styled(Input)`
  .input-icon-wrapper {
    position: relative;
  }
  
  input {
    width: 100%;
  }
`;

const OTPInputContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: center;
  margin: ${theme.spacing.lg} 0;
`;

const OTPInput = styled.input`
  width: 45px;
  height: 50px;
  text-align: center;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: bold;
  border: 2px solid ${theme.colors.border.main};
  border-radius: ${theme.radius.md};
  background-color: ${theme.colors.background.paper};
  color: ${theme.colors.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px rgba(33, 147, 176, 0.1);
  }
  
  &:disabled {
    background-color: ${theme.colors.background.default};
    color: ${theme.colors.text.disabled};
  }
  
  /* Remove number input spinners */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const InfoMessage = styled.div`
  background-color: rgba(33, 147, 176, 0.1);
  color: ${theme.colors.primary.main};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radius.md};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  border-left: 4px solid ${theme.colors.primary.main};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${theme.spacing.sm};
    min-width: 16px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  margin-bottom: ${theme.spacing.md};
  
  &:hover {
    text-decoration: underline;
  }
`;

const Timer = styled.div`
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.md};
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  white-space: nowrap;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  
  svg {
    flex-shrink: 0;
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [apiLoading, setApiLoading] = useState(false); // New local loading state for API calls
  const { requestOTP, verifyOTP, isAuthenticated, loading: authLoading } = useAuth(); // Renamed loading to authLoading
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debugging mount/unmount
  // useEffect(() => {
  //   console.log('Login component mounted');
  //   return () => {
  //     console.log('Login component unmounted');
  //   };
  // }, []);

  const fromState = location.state?.from;
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl');
  const decodedReturnUrl = returnUrl ? decodeURIComponent(returnUrl) : null;
  const from = decodedReturnUrl || (typeof fromState === 'string' ? fromState : (fromState?.pathname || '/'));
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(from || '/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timerId = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [otpTimer]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@(mail\.)?utoronto\.ca$/;
    return regex.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid University of Toronto email address (@mail.utoronto.ca or @utoronto.ca)');
      return;
    }
    
    setApiLoading(true); // Start API loading
    try {
      const { success, message, error } = await requestOTP(email.trim().toLowerCase());
      
      if (success) {
        setSuccessMessage(message || 'Verification code sent! Check your email.');
        setStep('otp');
        setOtpTimer(60); // 60 seconds before allowing resend
      } else {
        setError(error?.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      console.error('OTP request error:', err);
      setError('We couldn\'t send the verification code. Please try again later.');
    } finally {
      setApiLoading(false); // End API loading
    }
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < pastedCode.length && i < 6; i++) {
        newOtp[i] = pastedCode[i];
      }
      setOtp(newOtp);
      
      // Focus last input or next empty input
      const nextIndex = Math.min(pastedCode.length, 5);
      document.getElementById(`otp-input-${nextIndex}`)?.focus();
    } else {
      // Handle single character input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }
    
    setApiLoading(true); // Start API loading
    try {
      const { success, error } = await verifyOTP(email, otpCode);
      
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError(error?.message || 'Invalid verification code. Please try again.');
        
        // Clear OTP inputs on error
        if (error?.message?.includes('expired') || error?.message?.includes('Too many')) {
          setOtp(['', '', '', '', '', '']);
          document.getElementById('otp-input-0')?.focus();
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setApiLoading(false); // End API loading
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    setError('');
    setSuccessMessage('');
    setOtp(['', '', '', '', '', '']);
    
    setApiLoading(true); // Start API loading
    try {
      const { success, message, error } = await requestOTP(email);
      
      if (success) {
        setSuccessMessage('New verification code sent! Check your email.');
        setOtpTimer(60);
        document.getElementById('otp-input-0')?.focus();
      } else {
        setError(error?.message || 'Failed to resend verification code.');
      }
    } catch (err) {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setApiLoading(false); // End API loading
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccessMessage('');
    setOtpTimer(0);
    setApiLoading(false); // Reset API loading state on back
  };
  
  // If still loading auth state, show loading indicator
  if (authLoading) { // Use authLoading for initial app loading
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
          <AnimatedLogo size={80} />
        </Logo>
        
        {error && (
          <ErrorMessage>
            <FaExclamationTriangle size={16} />
            {error}
          </ErrorMessage>
        )}
        
        {step === 'email' ? (
          <>
            <Form onSubmit={handleEmailSubmit}>
              <InputGroup>
                <StyledInput
                  type="email"
                  placeholder="Enter your UofT email to login"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={<FaEnvelope size={16} />}
                  fullWidth
                />
              </InputGroup>
              
              <StyledButton type="submit" fullWidth disabled={apiLoading}>
                {apiLoading ? (
                  <>
                    <LoadingSpinner size={16} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt size={16} />
                    <span>Send Verification Code</span>
                  </>
                )}
              </StyledButton>
            </Form>
            
            <AccountActions>
              <LinkButton to="/account-activation">
                <FaUserPlus size={14} />
                Activate Account
              </LinkButton>
            </AccountActions>
          </>
        ) : (
          <>
            <BackButton onClick={handleBackToEmail}>
              <FaArrowLeft size={14} />
              Back to Email
            </BackButton>
            
            {successMessage && (
              <InfoMessage>
                <FaCheckCircle size={16} />
                {successMessage}
              </InfoMessage>
            )}
            
            <Form onSubmit={handleOTPSubmit}>
              <OTPInputContainer>
                {otp.map((digit, index) => (
                  <OTPInput
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
                      handleOTPChange(0, pastedData);
                    }}
                    disabled={apiLoading}
                  />
                ))}
              </OTPInputContainer>
              
              <StyledButton type="submit" fullWidth disabled={apiLoading}>
                {apiLoading ? (
                  <>
                    <LoadingSpinner size={16} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <FaLock size={16} />
                    <span>Verify & Login</span>
                  </>
                )}
              </StyledButton>
              
              {otpTimer > 0 ? (
                <Timer>
                  Resend code in {otpTimer}s
                </Timer>
              ) : (
                <Timer as="button" onClick={handleResendOTP} style={{ cursor: 'pointer', border: 'none', background: 'none' }} disabled={apiLoading}>
                  Didn't receive the code? Click to resend
                </Timer>
              )}
            </Form>
          </>
        )}
      </Card>
    </Container>
  );
};

export default Login; 
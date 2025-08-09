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
import { FaLock, FaUser, FaSignInAlt, FaEye, FaEyeSlash, FaExclamationTriangle, FaUserPlus, FaEnvelope, FaSpinner } from 'react-icons/fa';
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

const AccountActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
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
    color: ${theme.colors.text.secondary};
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

// OTP specific styles
const OtpContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
`;

const OtpHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.sm};
`;

const OtpIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary.main}20, ${theme.colors.primary.main}10);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing.md};
  border: 3px solid ${theme.colors.primary.main}30;
  
  svg {
    font-size: 32px;
    color: ${theme.colors.primary.main};
  }
`;

const OtpTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm};
`;

const OtpDescription = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
  
  strong {
    color: ${theme.colors.primary.main};
    font-weight: ${theme.typography.fontWeights.semiBold};
  }
`;

const OtpInputContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: center;
  margin: ${theme.spacing.md} 0;
`;

const OtpDigitInput = styled.input`
  width: 50px;
  height: 50px;
  border: 2px solid ${props => {
    if (props.isVerifying) return theme.colors.warning.main;
    return props.hasValue ? theme.colors.primary.main : theme.colors.border.main;
  }};
  border-radius: ${theme.radius.md};
  text-align: center;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  background: ${props => {
    if (props.isVerifying) return `${theme.colors.warning.main}10`;
    return props.hasValue ? `${theme.colors.primary.main}10` : theme.colors.background.paper;
  }};
  transition: all 0.2s ease;
  opacity: ${props => props.isVerifying ? 0.7 : 1};
  
  &:focus {
    outline: none;
    border-color: ${props => props.isVerifying ? theme.colors.warning.main : theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.isVerifying ? theme.colors.warning.main : theme.colors.primary.main}20;
    transform: scale(1.05);
  }
  
  &:hover:not(:focus) {
    border-color: ${props => props.isVerifying ? theme.colors.warning.light : theme.colors.primary.light};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ResendContainer = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.disabled ? theme.colors.text.disabled : theme.colors.primary.main};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  text-decoration: ${props => props.disabled ? 'none' : 'underline'};
  font-size: ${theme.typography.fontSize.sm};
  padding: 0;
  margin-left: ${theme.spacing.xs};
  
  &:hover:not(:disabled) {
    color: ${theme.colors.primary.dark};
  }
`;

const VerifyingMessage = styled.div`
  text-align: center;
  color: ${theme.colors.warning.main};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
`;



const Login = () => {
  const [mode, setMode] = useState('utorid'); // 'utorid' or 'email'
  const [utorid, setUtorid] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const { login, requestEmailLogin, verifyEmailLogin, isAuthenticated, loading } = useAuth();
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
  
  // Restore pending email login (in case app renders loading overlay and remounts)
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingEmailLogin');
    const lastSentTime = sessionStorage.getItem('lastCodeSentTime');
    const storedResendCount = sessionStorage.getItem('resendCount');
    
    if (pending) {
      setMode('email');
      setEmail(pending);
      setOtpSent(true);
      
      // Restore resend count
      if (storedResendCount) {
        setResendCount(parseInt(storedResendCount));
      }
      
      // Calculate remaining cooldown time
      if (lastSentTime) {
        const elapsed = Math.floor((Date.now() - parseInt(lastSentTime)) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        setResendCooldown(remaining);
      }
    }
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'email') {
      if (!otpSent) {
        // Send OTP
        if (!email.trim()) {
          setError('Please enter your U of T email address');
          return;
        }
        // Basic domain validation on client side
        const domainRegex = /@(?:mail\.)?utoronto\.ca$|@toronto\.edu$/i;
        if (!domainRegex.test(email.trim())) {
          setError('Please enter a valid University of Toronto email address.');
          return;
        }

        try {
          const { success } = await requestEmailLogin(email.trim().toLowerCase());
          if (success) {
            const now = Date.now();
            setOtpSent(true);
            setResendCooldown(60); // Start 60-second cooldown
            setResendCount(1); // First send counts as 1
            sessionStorage.setItem('pendingEmailLogin', email.trim().toLowerCase());
            sessionStorage.setItem('lastCodeSentTime', now.toString());
            sessionStorage.setItem('resendCount', '1');
          }
        } catch (err) {
          setError(err.message || 'Failed to send login code');
        }
        return;
      } else {
        // This shouldn't happen since we auto-verify, but keep as fallback
        return;
      }
    }

    if (!utorid.trim() || !password.trim()) {
      setError('Please enter both UTORid and password');
      return;
    }
    
    try {
      // const { success, error } = await login(utorid, password);
      const { success, error } = await login(utorid.trim().toLowerCase(), password);

      
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

  // Handle OTP digit input
  const handleOtpDigitChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    
    // Update the combined OTP value
    const combinedOtp = newDigits.join('');
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Auto-verify when all digits are filled
    if (combinedOtp.length === 6 && !isVerifying) {
      verifyOtpCode(combinedOtp);
    }
  };

  // Handle OTP digit keydown (for backspace)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.split('').slice(0, 6);
    
    const newDigits = [...otpDigits];
    digits.forEach((digit, index) => {
      if (index < 6 && /^\d$/.test(digit)) {
        newDigits[index] = digit;
      }
    });
    
    setOtpDigits(newDigits);
    const combinedOtp = newDigits.join('');
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newDigits.findIndex(digit => !digit);
    const targetIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    const targetInput = document.getElementById(`otp-${targetIndex}`);
    if (targetInput) targetInput.focus();
    
    // Auto-verify if all digits are filled
    if (combinedOtp.length === 6 && !isVerifying) {
      verifyOtpCode(combinedOtp);
    }
  };

  // Reset OTP state
  const resetOtpState = () => {
    setOtpDigits(['', '', '', '', '', '']);
    setOtpSent(false);
    setResendCooldown(0);
    setResendCount(0);
    setIsVerifying(false);
    sessionStorage.removeItem('pendingEmailLogin');
    sessionStorage.removeItem('lastCodeSentTime');
    sessionStorage.removeItem('resendCount');
  };

  // Verify OTP code
  const verifyOtpCode = async (code) => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      const { success } = await verifyEmailLogin(email.trim().toLowerCase(), code);
      if (success) {
        sessionStorage.removeItem('pendingEmailLogin');
        sessionStorage.removeItem('lastCodeSentTime');
        sessionStorage.removeItem('resendCount');
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
      // Clear the OTP inputs on error
      setOtpDigits(['', '', '', '', '', '']);
      // Focus first input
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resendCount >= 3) return; // Prevent sending if still in cooldown or exceeded limit
    
    setError('');
    try {
      const { success } = await requestEmailLogin(email.trim().toLowerCase());
      if (success) {
        const now = Date.now();
        const newResendCount = resendCount + 1;
        setResendCooldown(60); // Start 60-second cooldown
        setResendCount(newResendCount);
        sessionStorage.setItem('lastCodeSentTime', now.toString());
        sessionStorage.setItem('resendCount', newResendCount.toString());
      }
    } catch (err) {
      setError(err.message || 'Failed to send login code');
    }
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
        
        {error && (
          <ErrorMessage>
            <FaExclamationTriangle />
            {error}
          </ErrorMessage>
        )}
        
        <ModeSwitcher>
          <button
            type="button"
            className={mode === 'utorid' ? 'active' : ''}
            onClick={() => { 
              setMode('utorid'); 
              setError(''); 
              // Clear email login state
              resetOtpState();
            }}
          >UTORid Login</button>
          <button
            type="button"
            className={mode === 'email' ? 'active' : ''}
            onClick={() => { setMode('email'); setError(''); }}
          >U&nbsp;of&nbsp;T Email Login</button>
        </ModeSwitcher>
        
        <Form onSubmit={handleSubmit}>
          {mode === 'utorid' && (
            <>
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
              
              <AccountActions>
                <LinkButton to="/password-reset">
                  Forgot Password?
                </LinkButton>
                <LinkButton to="/account-activation">
                  <FaUserPlus size={14} /> Activate Account
                </LinkButton>
              </AccountActions>
              
              <Button type="submit" fullWidth data-testid="login-submit">
                <FaSignInAlt /> Login
              </Button>
            </>
          )}

          {mode === 'email' && (
            <>
              {!otpSent && (
                <InputGroup>
                  <StyledInput
                    type="email"
                    placeholder="U of T Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftIcon={<FaUser size={16} />}
                  />
                </InputGroup>
              )}

              {otpSent && (
                <OtpContainer>
                  <OtpHeader>
                    <OtpIcon>
                      <FaEnvelope />
                    </OtpIcon>
                    <OtpTitle>Check your email</OtpTitle>
                    <OtpDescription>
                      We've sent a login code to <strong>{email}</strong>.<br />
                      Enter it below to continue.
                    </OtpDescription>
                  </OtpHeader>

                  <OtpInputContainer>
                    {otpDigits.map((digit, index) => (
                      <OtpDigitInput
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength="1"
                        value={digit}
                        hasValue={!!digit}
                        isVerifying={isVerifying}
                        disabled={isVerifying}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        autoComplete="off"
                      />
                    ))}
                  </OtpInputContainer>

                  {isVerifying && (
                    <VerifyingMessage>
                      <FaSpinner className="fa-spin" />
                      Verifying code...
                    </VerifyingMessage>
                  )}

                  <ResendContainer>
                    {resendCount >= 3 ? (
                      <span style={{ color: theme.colors.error.main }}>
                        Too many attempts. Please try again later.
                      </span>
                    ) : (
                      <>
                        Didn't receive the code?
                        <ResendButton 
                          type="button"
                          disabled={resendCooldown > 0 || resendCount >= 3}
                          onClick={handleResendCode}
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </ResendButton>
                        {resendCount > 0 && (
                          <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginTop: theme.spacing.xs }}>
                            {resendCount}/3 attempts used
                          </div>
                        )}
                      </>
                    )}
                  </ResendContainer>
                </OtpContainer>
              )}

              {!otpSent && (
                <Button type="submit" fullWidth data-testid="login-submit">
                  <FaEnvelope /> Send Login Code
                </Button>
              )}
            </>
          )}
        </Form>
      </Card>
    </Container>
  );
};

// UI helpers for mode switch
const ModeSwitcher = styled.div`
  display: flex;
  margin-bottom: ${theme.spacing.md};
  button {
    flex: 1;
    padding: ${theme.spacing.sm} 0;
    border: none;
    background: none;
    cursor: pointer;
    font-size: ${theme.typography.fontSize.md};
    color: ${theme.colors.text.primary};
    border-bottom: 2px solid transparent;
    &.active {
      border-color: ${theme.colors.primary.main};
      font-weight: ${theme.typography.fontWeights.semibold};
    }
  }
`;

export default Login; 
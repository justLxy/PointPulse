import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import theme from '../../styles/theme';
import { FaLock, FaUser, FaKey, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
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

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  line-height: 1.5;
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

const StyledInput = styled(Input)`
  .input-icon-wrapper {
    color: ${theme.colors.text.secondary};
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%) translateY(5px);
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

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  margin-top: ${theme.spacing.md};
  text-align: center;
  width: 100%;
  
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
  
  svg {
    margin-right: ${theme.spacing.sm};
    min-width: 16px;
  }
`;

const PasswordRequirements = styled.ul`
  padding-left: ${theme.spacing.lg};
  margin-top: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  
  li {
    margin-bottom: ${theme.spacing.xs};
  }
`;

const PasswordReset = () => {
  const [step, setStep] = useState(1);
  const [utorid, setUtorid] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Track validation states
  const [validLength, setValidLength] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasLower, setHasLower] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);

  // Live password validation
  const validateLive = (pwd) => {
    setValidLength(pwd.length >= 8 && pwd.length <= 20);
    setHasUpper(/[A-Z]/.test(pwd));
    setHasLower(/[a-z]/.test(pwd));
    setHasNumber(/\d/.test(pwd));
    setHasSpecial(/[\W_]/.test(pwd)); // Matches special characters
  };

  // Handle password change and trigger live validation
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validateLive(newPassword);
  };

  // const validatePassword = (password) => {
  //   // At least 8 characters, with uppercase, lowercase, number, and special char
  //   const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  //   return regex.test(password);
  // };
  
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!utorid.trim()) {
      setError('Please enter your UTORid');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await AuthService.requestPasswordReset(utorid);
      console.log("Password reset requested successfully:", result);
      
      if (result && result.resetToken) {
        // setResetToken(result.resetToken);
        setSuccess('Reset token generated successfully! Please check your email.');
        setStep(2);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to request password reset. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setError('Password does not meet the security requirements.');
      return;
    }
    
    // if (!validatePassword(password)) {
    //   setError('Password must be 8-20 characters and include uppercase, lowercase, number, and special character');
    //   return;
    // }
    
    setLoading(true);
    
    try {
      await AuthService.resetPassword(resetToken, utorid, password);
      setSuccess('Password reset successful! You can now log in with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setError('');
      setSuccess('');
    } else {
      navigate('/login');
    }
  };
  
  if (loading) {
    return (
      <Container>
        <Card>
          <Logo>
            <AnimatedLogo size={60} />
          </Logo>
          <LoadingSpinner text="Processing your request..." />
        </Card>
        <Particle size="20px" top="20%" left="80%" duration="20s" />
        <Particle size="35px" top="70%" left="70%" duration="25s" delay="2s" />
        <Particle size="25px" top="40%" left="15%" duration="18s" delay="1s" />
      </Container>
    );
  }
  
  return (
    <Container>
      <Card>
        <Logo>
          <AnimatedLogo size={60} />
        </Logo>
        
        <Title>{step === 1 ? 'Reset Your Password' : 'Create New Password'}</Title>
        
        {step === 1 ? (
          <Subtitle>
            Enter your UTORid and we'll generate a reset token to help you create a new password.
          </Subtitle>
        ) : (
          <Subtitle>
            Create a strong new password for your account.
          </Subtitle>
        )}
        
        {error && (
          <ErrorMessage>
            <FaExclamationTriangle /> {error}
          </ErrorMessage>
        )}
        
        {success && (
          <SuccessMessage>
            <FaCheckCircle /> {success}
          </SuccessMessage>
        )}
        
        {step === 1 ? (
          <Form onSubmit={handleRequestReset}>
            <Input
              id="utorid"
              name="utorid"
              label="UTORid"
              placeholder="Enter your UTORid"
              value={utorid}
              onChange={(e) => setUtorid(e.target.value)}
              leftIcon={<FaUser />}
              required
            />
            
            <Button type="submit" fullWidth>
              Request Password Reset
            </Button>
            
            <BackButton type="button" onClick={goBack}>
              Back to Login
            </BackButton>
          </Form>
        ) : (
          <Form onSubmit={handleResetPassword}>
            <InputGroup>
              <StyledInput
                type="text"
                placeholder="Enter Reset Token"
                value={resetToken}
                label="Reset Token"
                onChange={(e) => setResetToken(e.target.value)}
                required
                leftIcon={<FaKey size={16} />}
              />
            </InputGroup>
            <InputGroup>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                placeholder="Enter your new password"
                value={password}
                // onChange={(e) => setPassword(e.target.value)}
                onChange={handlePasswordChange}
                leftIcon={<FaLock />}
                required
              />
              <PasswordToggle
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </PasswordToggle>
            </InputGroup>
            
            <InputGroup>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<FaLock />}
                required
              />
              <PasswordToggle
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </PasswordToggle>
            </InputGroup>
            
            {/* <PasswordRequirements>
              <li>8-20 characters long</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </PasswordRequirements> */}
            <PasswordRequirements>
              <li style={{ color: validLength ? theme.colors.success.main : theme.colors.text.secondary }}>
                8–20 characters
              </li>
              <li style={{ color: hasUpper ? theme.colors.success.main : theme.colors.text.secondary }}>
                At least one uppercase letter
              </li>
              <li style={{ color: hasLower ? theme.colors.success.main : theme.colors.text.secondary }}>
                At least one lowercase letter
              </li>
              <li style={{ color: hasNumber ? theme.colors.success.main : theme.colors.text.secondary }}>
                At least one number
              </li>
              <li style={{ color: hasSpecial ? theme.colors.success.main : theme.colors.text.secondary }}>
                At least one special character
              </li>
            </PasswordRequirements>
            
            <Button type="submit" fullWidth>
              Reset Password
            </Button>
            
            <BackButton type="button" onClick={goBack}>
              Back
            </BackButton>
          </Form>
        )}
      </Card>
      
      <Particle size="20px" top="20%" left="80%" duration="20s" />
      <Particle size="35px" top="70%" left="70%" duration="25s" delay="2s" />
      <Particle size="25px" top="40%" left="15%" duration="18s" delay="1s" />
    </Container>
  );
};

export default PasswordReset;

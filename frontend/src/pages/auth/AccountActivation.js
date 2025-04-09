import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import theme from '../../styles/theme';
import { FaUser, FaLock, FaArrowLeft, FaCheck, FaKey, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
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

  // Track validation states
  const [validLength, setValidLength] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasLower, setHasLower] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  

  // const validatePassword = (password) => {
  //   // At least 8 characters, max 20
  //   if (password.length < 8 || password.length > 20) {
  //     return false;
  //   }
    
  //   // Check for at least one uppercase, one lowercase, one number, one special character
  //   const hasUppercase = /[A-Z]/.test(password);
  //   const hasLowercase = /[a-z]/.test(password);
  //   const hasNumber = /[0-9]/.test(password);
  //   const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
  //   return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  // };
  
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
    
    // if (!validatePassword(password)) {
    //   setError('Password does not meet all requirements');
    //   return;
    // }
    
    try {
      setLoading(true);
      await resetPassword(resetToken, utorid, password);
      
      // // If we get here, it means the resetPassword was successful
      // setSuccess(true);
      // toast.success('Account activated successfully!');
      
      // Give user time to see the success message before redirecting
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Reset Password Error:', err); // For debugging
      setSuccess(false); // Ensure success is false on error
      setError(err.message || 'Account activation failed. Please try again.');
      // Use the error message directly from the caught error
      setError(err.message || 'Account activation failed. Please try again.');
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
              label="UTORid"
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
              label="Reset Token"
              onChange={(e) => setResetToken(e.target.value)}
              required
              disabled={success}
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
                {showPassword ? <FaEye size={16}/> : <FaEyeSlash size={16}/>}
              </PasswordToggle>
            </InputGroup>
          
          {/* <InputGroup>
            <StyledInput
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={success}
              leftIcon={<FaLock size={16} />}
            />
            </InputGroup> */}

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
                {showConfirmPassword ? <FaEye size={16}/> : <FaEyeSlash size={16}/>}
              </PasswordToggle>
            </InputGroup>

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
import { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useAuth } from '../../contexts/AuthContext';
import useUserProfile from '../../hooks/useUserProfile';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import theme from '../../styles/theme';
import { API_URL } from '../../services/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaBirthdayCake, 
  FaLock, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import QRCode from '../../components/common/QRCode';
import UniversalQRCode from '../../components/common/UniversalQRCode';

const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 100%;
  
  @media (min-width: 768px) {
    grid-template-columns: 350px 1fr;
    align-items: start;
  }
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 100%;
  
  @media (max-width: 768px) {
    padding: 0 ${theme.spacing.xs};
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 100%;
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${theme.radius.full};
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  margin: 0 auto ${theme.spacing.md} auto;
  position: relative;
  overflow: hidden;
  
  @media (min-width: 768px) {
    width: 150px;
    height: 150px;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  cursor: pointer;
  border-radius: ${theme.radius.full};
  
  &:hover {
    opacity: 1;
  }
`;

const AvatarEdit = styled.span`
  color: white;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.medium};
  text-align: center;
  line-height: 1.2;
  background-color: rgba(52, 152, 219, 0.7);
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radius.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s ease-in-out, background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(52, 152, 219, 0.9);
    transform: scale(1.05);
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: ${theme.spacing.md};
  
  h2 {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.semiBold};
    margin: ${theme.spacing.sm} 0;
  }
  
  p {
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.sm};
    margin-bottom: ${theme.spacing.md};
  }
`;

const PointsCard = styled.div`
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.radius.lg};
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    border-radius: ${theme.radius.md};
    max-width: calc(100vw - ${theme.spacing.md} * 2);
  }
  
  h3 {
    font-size: ${theme.typography.fontSize.lg};
    font-weight: ${theme.typography.fontWeights.medium};
    margin-bottom: ${theme.spacing.md};
  }
  
  .points {
    font-size: ${theme.typography.fontSize['4xl']};
    font-weight: ${theme.typography.fontWeights.bold};
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${({ verified }) => 
    verified ? theme.colors.success.main : theme.colors.warning.main};
  color: white;
  border-radius: ${theme.radius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-left: ${theme.spacing.sm};
`;

const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
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

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:last-of-type {
    border-bottom: none;
  }
  
  svg {
    color: ${theme.colors.primary.main};
    margin-right: ${theme.spacing.md};
    flex-shrink: 0;
    min-width: 16px;
  }
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const InfoLabel = styled.span`
  font-weight: ${theme.typography.fontWeights.medium};
  width: 120px;
  flex-shrink: 0;
`;

const InfoValue = styled.span`
  color: ${theme.colors.text.secondary};
  word-break: break-word;
  flex: 1;
`;

const TabContainer = styled.div`
  border-bottom: 1px solid ${theme.colors.border.light};
  display: flex;
  margin-bottom: ${theme.spacing.lg};
  width: 100%;
  position: relative;
`;

const Tab = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.secondary};
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all ${theme.transitions.quick};
  margin-bottom: -1px;
  
  ${({ active }) =>
    active &&
    css`
      color: ${theme.colors.primary.main};
      border-bottom-color: ${theme.colors.primary.main};
    `}
  
  &:hover:not(:disabled) {
    color: ${theme.colors.primary.main};
  }
`;

const AvatarLoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.radius.full};
  z-index: 10;
  
  &::after {
    content: '';
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const PageWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: visible;
  padding: ${theme.spacing.md};
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding-left: 0;
    padding-right: 0;
    // padding: ${theme.spacing.md} ${theme.spacing.sm};
    // padding: ${theme.spacing.sm};
  }
`;

const StyledCard = styled(Card)`
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  
  @media (max-width: 768px) {
    border-radius: ${theme.radius.lg};
    width: 90%;
    // max-width: calc(100vw - ${theme.spacing.md} * 2);
    // width: 100vw;
    margin-left: auto;
    margin-right: auto;
  }
`;

const ResponsiveQRCode = styled(QRCode)`
  max-width: 100%;
  height: auto;
`;

const Profile = () => {
  const { currentUser } = useAuth();
  const { 
    profile, 
    isLoading, 
    updateProfile, 
    isUpdating, 
    updatePassword, 
    isUpdatingPassword,
    updateAvatar,
    isUpdatingAvatar
  } = useUserProfile();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthday: '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const avatarInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Live validation states
  const [validLength, setValidLength] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasLower, setHasLower] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const validateLive = (pwd) => {
    setValidLength(pwd.length >= 8 && pwd.length <= 20);
    setHasUpper(/[A-Z]/.test(pwd));
    setHasLower(/[a-z]/.test(pwd));
    setHasNumber(/\d/.test(pwd));
    setHasSpecial(/[\W_]/.test(pwd));
  };

  // const togglePasswordVisibility = (field) => {
  //   setShowPasswords(!field);
  // };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  
  // Initialize form data when profile is loaded
  if (!isLoading && profile && !formData.name) {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      birthday: profile.birthday ? profile.birthday.split('T')[0] : '',
    });
  }
  
  const handleAvatarClick = () => {
    if (!isUpdatingAvatar) {
      avatarInputRef.current.click();
    }
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show local preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Directly upload avatar file, no need to wait for user to click save button
      updateAvatar(file, {
        onSuccess: () => {
          setAvatarPreview(null); // Clear preview, use server-returned URL
        },
        onError: () => {
          setAvatarPreview(null); // Also clear preview on error
        }
      });
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });

    if (name === 'newPassword') {
      validateLive(value);
    }
  };
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    const updateData = { ...formData };
    
    // Since avatar is now uploaded separately, don't include avatar file when submitting the form
    // Only include avatar when in edit mode and user has manually selected an avatar but hasn't uploaded it yet
    // This situation usually won't happen because avatar is uploaded immediately after selection
    
    updateProfile(updateData, {
      onSuccess: () => {
        // Stay in view mode
        setIsEditing(false);
      }
    });
  };
  
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
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    
    const { oldPassword, newPassword, confirmPassword } = passwordData;
    let errors = {};

    if (!oldPassword) {
      errors.oldPassword = 'Current password is required';
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordError(errors);
      return;
    }
    
    // if (!oldPassword || !newPassword || !confirmPassword) {
    //   setPasswordError('All fields are required');
    //   return;
    // }
    
    // if (newPassword !== confirmPassword) {
    //   setPasswordError('New passwords do not match');
    //   return;
    // }
    
    // if (!validatePassword(newPassword)) {
    //   setPasswordError('Password does not meet all requirements');
    //   return;
    // }
    if (newPassword !== confirmPassword) {
      setPasswordError({ newPassword: 'New passwords do not match' });
      return;
    }
  
    if (!validatePassword(newPassword)) {
      setPasswordError({ newPassword: 'Password does not meet all requirements' });
      return;
    }

    const response = updatePassword({ oldPassword, newPassword });
    
    // Reset form if successful
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    // Reset validation states
    setValidLength(false);
    setHasUpper(false);
    setHasLower(false);
    setHasNumber(false);
    setHasSpecial(false);
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const renderUserInfo = () => (
    <StyledCard>
      <Card.Header>
        <Card.Title>User Information</Card.Title>
        {!isEditing && (
          <Button 
            variant="text" 
            size="sm" 
            leftIcon={<FaEdit />}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </Card.Header>
      <Card.Body style={{ padding: theme.spacing.lg }}>
        {isEditing ? (
          <ProfileForm onSubmit={handleProfileSubmit}>
            <Input
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              leftIcon={<FaUser size={16} />}
            />
            
            <Input
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              helperText="Must be a valid University of Toronto email"
              leftIcon={<FaEnvelope size={16} />}
            />
            
            <Input
              name="birthday"
              label="Birthday"
              type="date"
              value={formData.birthday}
              onChange={handleInputChange}
              leftIcon={<FaBirthdayCake size={16} />}
            />
            
            <FormActions>
              <Button 
                variant="outlined" 
                onClick={() => {
                  // Cancel editing, reset form data
                  setFormData({
                    name: profile?.name || '',
                    email: profile?.email || '',
                    birthday: profile?.birthday ? profile.birthday.split('T')[0] : '',
                  });
                  setIsEditing(false);
                }}
                disabled={isUpdating}
              >
                <FaTimes /> Cancel
              </Button>
              <Button 
                type="submit" 
                loading={isUpdating}
              >
                <FaSave /> Save Changes
              </Button>
            </FormActions>
          </ProfileForm>
        ) : (
          <>
            <InfoItem>
              <FaUser size={16} />
              <InfoLabel>Name:</InfoLabel>
              <InfoValue>{profile?.name}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <FaEnvelope size={16} />
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>{profile?.email}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <FaBirthdayCake size={16} />
              <InfoLabel>Birthday:</InfoLabel>
              <InfoValue>
                {profile?.birthday
                  ? new Date(profile.birthday).toLocaleDateString()
                  : 'Not set'}
              </InfoValue>
            </InfoItem>
            
            <InfoItem>
              <FaUser size={16} />
              <InfoLabel>UTORid:</InfoLabel>
              <InfoValue>{profile?.utorid}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <FaUser size={16} />
              <InfoLabel>Status:</InfoLabel>
              <InfoValue>
                {/* {profile?.verified ? 'Verified' : 'Not Verified'} */}
                <Badge verified={profile?.verified}>
                  {profile?.verified ? 'Verified' : 'Pending'}
                </Badge>
              </InfoValue>
            </InfoItem>
          </>
        )}
      </Card.Body>
    </StyledCard>
  );
  
  const renderChangePassword = () => (
    <StyledCard>
      <Card.Header>
        <Card.Title>Change Password</Card.Title>
      </Card.Header>
      <Card.Body style={{ padding: theme.spacing.lg }}>
        <PasswordForm onSubmit={handlePasswordSubmit}>

          <InputGroup>
            <Input
              name="oldPassword"
              label="Current Password"
              type={showPasswords.oldPassword ? "text" : "password"}
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              error={passwordError.oldPassword}  // Pass specific error for the field
              helperText={passwordError.oldPassword}  
            />
            <PasswordToggle
              type="button"
              onClick={() => togglePasswordVisibility('oldPassword')}
              aria-label={showPasswords.oldPassword ? 'Hide password' : 'Show password'}
            >
              {showPasswords.oldPassword ? <FaEye size={16}/> : <FaEyeSlash size={16}/>}
            </PasswordToggle>
          </InputGroup>
          
          <InputGroup>
            <Input
              name="newPassword"
              label="New Password"
              type={showPasswords.newPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={passwordError.newPassword}
              helperText={passwordError.newPassword}
            />
            <PasswordToggle
              type="button"
              onClick={() => togglePasswordVisibility('newPassword')}
              aria-label={showPasswords.newPassword ? 'Hide password' : 'Show password'}
            >
              {showPasswords.newPassword ? <FaEye size={16}/> : <FaEyeSlash size={16}/>}
            </PasswordToggle>
          </InputGroup>

          <InputGroup>
            <Input
              name="confirmPassword"
              label="Confirm New Password"
              type={showPasswords.confirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordError.confirmPassword}  // Pass specific error for the field
              helperText={passwordError.confirmPassword}  // Display the error message
            />
            <PasswordToggle
              type="button"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              aria-label={showPasswords.confirmPassword ? 'Hide password' : 'Show password'}
            >
              {showPasswords.confirmPassword ? <FaEye size={16}/> : <FaEyeSlash size={16}/>}
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
          
          <Button 
            type="submit" 
            fullWidth 
            loading={isUpdatingPassword}
          >
            Update Password
          </Button>
        </PasswordForm>
      </Card.Body>
    </StyledCard>
  );
  
  if (isLoading) {
    return <LoadingSpinner text="Loading profile information..." />;
  }
  
  return (
    <PageWrapper>
      <PageTitle>My Profile</PageTitle>
      
      <ProfileContainer>
        <SidePanel>
          <StyledCard>
            <Card.Body style={{ padding: theme.spacing.xl, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar onClick={handleAvatarClick} style={{ cursor: isUpdatingAvatar ? 'wait' : 'pointer' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" />
                ) : profile?.avatarUrl ? (
                  (() => {
                    const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(profile.avatarUrl);
                    const version = localStorage.getItem('avatarVersion');
                    const avatarPath = profile.avatarUrl.startsWith('/') ? profile.avatarUrl : `/${profile.avatarUrl}`;
                    const baseSrc = isAbsolute ? profile.avatarUrl : `${API_URL}${avatarPath}`;
                    const src = version ? `${baseSrc}?v=${version}` : baseSrc;
                    return <img src={src} alt={profile.name} />;
                  })()
                ) : (
                  getInitials(profile?.name)
                )}
                
                {isUpdatingAvatar ? (
                  <AvatarLoadingOverlay />
                ) : (
                  <AvatarOverlay>
                    <AvatarEdit>Change Photo</AvatarEdit>
                  </AvatarOverlay>
                )}
                
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                  disabled={isUpdatingAvatar}
                />
              </Avatar>
              
              <UserInfo>
                <h2>{profile?.name}</h2>
                <p>{profile?.utorid}</p>
                <Badge verified={profile?.verified}>{profile?.verified ? 'Verified' : 'Not Verified'}</Badge>
              </UserInfo>
            </Card.Body>
          </StyledCard>
          
          <PointsCard>
            <h3>Available Points</h3>
            <div className="points">{profile?.points || 0}</div>
          </PointsCard>
          
          <StyledCard>
            <Card.Header>
              <Card.Title>Your Universal QR Code</Card.Title>
            </Card.Header>
            <Card.Body style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing.lg }}>
              <UniversalQRCode 
                size={Math.min(180, window.innerWidth - 100)}
                level="H"
                description="Use this QR code for transfers, purchases, redemptions and event check-ins."
              />
            </Card.Body>
          </StyledCard>
        </SidePanel>
        
        <MainContent>
          <TabContainer>
            <Tab
              active={activeTab === 'info'}
              onClick={() => setActiveTab('info')}
            >
              User Information
            </Tab>
            <Tab
              active={activeTab === 'password'}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </Tab>
          </TabContainer>
          
          {activeTab === 'info' ? renderUserInfo() : renderChangePassword()}
        </MainContent>
      </ProfileContainer>
    </PageWrapper>
  );
};

export default Profile; 
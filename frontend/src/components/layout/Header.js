import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import theme from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
} from 'react-icons/fa';

const HeaderContainer = styled.header`
  background-color: ${theme.colors.background.paper};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${theme.zIndex.header};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.primary.main};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  &:hover {
    text-decoration: none;
  }
`;

const LogoImg = styled.img`
  height: 40px;
  width: auto;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background-color: ${theme.colors.background.paper};
    flex-direction: column;
    align-items: flex-start;
    padding: ${theme.spacing.md};
    box-shadow: ${theme.shadows.md};
  }
`;

const NavLink = styled(Link)`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeights.medium};
  border-radius: ${theme.radius.md};
  transition: all ${theme.transitions.quick};
  margin-left: ${theme.spacing.sm};
  
  &:hover {
    background-color: rgba(52, 152, 219, 0.1);
    color: ${theme.colors.primary.main};
    text-decoration: none;
  }
  
  ${({ active }) =>
    active &&
    css`
      color: ${theme.colors.primary.main};
      background-color: rgba(52, 152, 219, 0.1);
    `}
  
  @media (max-width: 768px) {
    margin: ${theme.spacing.xs} 0;
    width: 100%;
  }
`;

const MenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  margin-left: ${theme.spacing.xl};
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: ${theme.spacing.md};
    width: 100%;
  }
`;

const Avatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: ${theme.radius.full};
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeights.bold};
  overflow: hidden;
  cursor: pointer;
  transition: all ${theme.transitions.quick};
  
  &:hover {
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileDropdown = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const DropdownToggle = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.md};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadows.lg};
  min-width: 220px;
  z-index: ${theme.zIndex.dropdown};
  overflow: hidden;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen 
    ? 'translateX(-50%) translateY(0)' 
    : 'translateX(-50%) translateY(-10px)')};
  transition: 
    opacity 0.2s ease, 
    visibility 0.2s ease, 
    transform 0.2s ease;
  
  @media (max-width: 768px) {
    position: absolute;
    left: 0;
    transform: ${({ isOpen }) => (isOpen 
      ? 'translateY(0)' 
      : 'translateY(-10px)')};
    margin-top: ${theme.spacing.sm};
    width: 220px;
  }
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  transition: background-color ${theme.transitions.quick};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    text-decoration: none;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: background-color ${theme.transitions.quick};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${theme.colors.border.light};
  margin: ${theme.spacing.xs} 0;
`;

const RoleBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  border-radius: ${theme.radius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-left: ${theme.spacing.sm};
`;

const RoleDropdownToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  border: none;
  border-radius: ${theme.radius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: pointer;
  
  &:hover {
    background-color: ${theme.colors.primary.dark};
  }
`;

const RoleDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${theme.spacing.xs};
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadows.lg};
  min-width: 150px;
  z-index: ${theme.zIndex.dropdown};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen 
    ? 'translateY(0)' 
    : 'translateY(-10px)')};
  transition: 
    opacity 0.2s ease, 
    visibility 0.2s ease, 
    transform 0.2s ease;
`;

const RoleDropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: background-color ${theme.transitions.quick};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  ${({ active }) =>
    active &&
    css`
      background-color: rgba(52, 152, 219, 0.1);
      color: ${theme.colors.primary.main};
      font-weight: ${theme.typography.fontWeights.medium};
    `}
`;

const Header = () => {
  const { currentUser, activeRole, logout, switchRole } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  const profileDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const closeProfileDropdownTimer = useRef(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown when clicking outside
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target) &&
        isProfileDropdownOpen
      ) {
        setIsProfileDropdownOpen(false);
      }
      
      // Close role dropdown when clicking outside
      if (
        roleDropdownRef.current && 
        !roleDropdownRef.current.contains(event.target) &&
        isRoleDropdownOpen
      ) {
        setIsRoleDropdownOpen(false);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen, isRoleDropdownOpen]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };
  
  const toggleRoleDropdown = () => {
    setIsRoleDropdownOpen(!isRoleDropdownOpen);
  };
  
  const handleLogout = () => {
    logout();
  };
  
  const handleRoleSwitch = (role) => {
    if (switchRole(role)) {
      setIsRoleDropdownOpen(false);
    }
  };
  
  const getAvailableRoles = () => {
    if (!currentUser) return [];
    
    const roles = ['regular'];
    
    if (['cashier', 'manager', 'superuser'].includes(currentUser.role)) {
      roles.push('cashier');
    }
    
    if (['manager', 'superuser'].includes(currentUser.role)) {
      roles.push('manager');
    }
    
    if (currentUser.role === 'superuser') {
      roles.push('superuser');
    }
    
    return roles;
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
  
  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/promotions', label: 'Promotions' },
    { path: '/events', label: 'Events' },
  ];
  
  if (activeRole === 'cashier') {
    navLinks.push(
      { path: '/transactions/create', label: 'Create Transaction' },
      { path: '/transactions/process', label: 'Process Redemption' }
    );
  }
  
  if (activeRole === 'manager') {
    navLinks.push(
      { path: '/users', label: 'Users' },
      { path: '/transactions', label: 'Transactions' }
    );
  }
  
  const handleProfileClick = () => {
    window.location.href = "/profile";
  };
  
  const handleProfileMouseEnter = () => {
    if (closeProfileDropdownTimer.current) {
      clearTimeout(closeProfileDropdownTimer.current);
    }
    setIsProfileDropdownOpen(true);
  };
  
  const handleProfileMouseLeave = () => {
    closeProfileDropdownTimer.current = setTimeout(() => {
      setIsProfileDropdownOpen(false);
    }, 100);
  };
  
  return (
    <HeaderContainer>
      <Logo to="/">
        <LogoImg src="/logo.png" alt="PointPulse Logo" />
        PointPulse
      </Logo>
      
      <MenuToggle onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </MenuToggle>
      
      {currentUser && (
        <>
          <Nav isOpen={isMenuOpen}>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                active={location.pathname === link.path ? 1 : 0}
              >
                {link.label}
              </NavLink>
            ))}
            
            <ProfileSection>
              <ProfileDropdown 
                ref={profileDropdownRef}
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
              >
                <Avatar 
                  onClick={handleProfileClick}
                >
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} />
                  ) : (
                    getInitials(currentUser.name)
                  )}
                </Avatar>
                
                <DropdownMenu isOpen={isProfileDropdownOpen}>
                  <div className="dropdown-caret" style={{ 
                    position: 'absolute', 
                    top: '-6px', 
                    left: '50%', 
                    transform: 'translateX(-50%) rotate(45deg)',
                    width: '12px',
                    height: '12px',
                    backgroundColor: theme.colors.background.paper,
                    borderLeft: `1px solid ${theme.colors.border.light}`,
                    borderTop: `1px solid ${theme.colors.border.light}`,
                    zIndex: 1
                  }}></div>
                  <div style={{ 
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`, 
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <div style={{ fontWeight: theme.typography.fontWeights.semiBold, fontSize: theme.typography.fontSize.md, marginBottom: theme.spacing.xs }}>
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                      {currentUser.utorid}
                    </div>
                  </div>
                  <Divider />
                  <DropdownButton onClick={handleLogout}>
                    <FaSignOutAlt />
                    Logout
                  </DropdownButton>
                </DropdownMenu>
              </ProfileDropdown>
              
              {getAvailableRoles().length > 1 && (
                <div style={{ position: 'relative' }} ref={roleDropdownRef}>
                  <RoleDropdownToggle onClick={toggleRoleDropdown}>
                    {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
                    <FaChevronDown />
                  </RoleDropdownToggle>
                  
                  <RoleDropdownMenu isOpen={isRoleDropdownOpen}>
                    {getAvailableRoles().map((role) => (
                      <RoleDropdownItem
                        key={role}
                        active={activeRole === role ? 1 : 0}
                        onClick={() => handleRoleSwitch(role)}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </RoleDropdownItem>
                    ))}
                  </RoleDropdownMenu>
                </div>
              )}
            </ProfileSection>
          </Nav>
        </>
      )}
    </HeaderContainer>
  );
};

export default Header;
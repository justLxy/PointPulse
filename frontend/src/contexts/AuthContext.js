import { createContext, useContext, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import AuthService from '../services/auth.service';
import { toast } from 'react-hot-toast';
import theme from '../styles/theme';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Styled component for loading screen
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${theme.colors.background.default};
`;

const Logo = styled.div`
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
`;

const LoadingText = styled.div`
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.lg};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${theme.colors.primary.main};
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// LoadingScreen component
const LoadingScreen = () => (
  <LoadingContainer>
    <Logo>
      <img src="/logo.png" alt="PointPulse Logo" height="80" />
      <h1 style={{ 
        fontSize: theme.typography.fontSize['3xl'],
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.primary.main,
        marginTop: theme.spacing.md
      }}>PointPulse</h1>
    </Logo>
    <LoadingSpinner />
    <LoadingText>Loading your session...</LoadingText>
  </LoadingContainer>
);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        // Check if token exists and is valid
        const isTokenValid = AuthService.isAuthenticated();
        setIsAuthenticated(isTokenValid);
        
        if (isTokenValid) {
          console.log('Token is valid, trying to get user data');
          try {
            const user = await AuthService.getCurrentUser();
            
            if (user) {
              console.log('User loaded successfully:', user.utorid);
              setCurrentUser(user);
              
              // First try to get active role from localStorage, otherwise use the user's default role
              const savedRole = localStorage.getItem('activeRole');
              setActiveRole(savedRole || user.role);
            } else {
              console.log('User data not found, logging out');
              AuthService.logout();
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error('Error loading user data:', error);
            AuthService.logout();
            setIsAuthenticated(false);
          }
        } else {
          console.log('No valid token found or token expired');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        AuthService.logout();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // Check auth status periodically
  useEffect(() => {
    const checkAuthStatus = () => {
      const isValid = AuthService.isAuthenticated();
      if (isAuthenticated !== isValid) {
        console.log('Auth status changed:', { wasAuthenticated: isAuthenticated, nowAuthenticated: isValid });
        setIsAuthenticated(isValid);
        
        // If no longer authenticated, clear the user state
        if (!isValid && currentUser) {
          console.log('No longer authenticated, clearing user state');
          setCurrentUser(null);
          setActiveRole(null);
        }
      }
    };
    
    // Check auth status every 30 seconds
    const intervalId = setInterval(checkAuthStatus, 30000);
    
    // Also check when the window regains focus
    const handleFocus = () => checkAuthStatus();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, currentUser]);
  
  const login = async (utorid, password) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', utorid);
      
      // First get the token
      const authData = await AuthService.login(utorid, password);
      console.log('Login successful, token received');
      
      // Then fetch user data with the new token (force refresh from API)
      const user = await AuthService.getCurrentUser(true);
      console.log('User data fetched successfully');
      
      // Update state and localStorage
      setCurrentUser(user);
      setActiveRole(user.role);
      localStorage.setItem('activeRole', user.role);
      
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      
      // 提供更具体的错误信息
      let errorMessage = 'Unable to sign in. Please try again.';
      
      // 处理不同类型的错误
      if (error.response) {
        // 服务器返回了错误状态码
        const status = error.response.status;
        
        if (status === 401) {
          errorMessage = 'Incorrect UTORid or password. Please verify your credentials.';
        } else if (status === 403) {
          errorMessage = 'Your account is not authorized to access this system.';
        } else if (status === 404) {
          errorMessage = 'Account not found. Please check your UTORid.';
        } else if (status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Our team has been notified and is working on it.';
        }
      } else if (error.request) {
        // 请求发出但没有收到响应
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      // 显示错误提示
      toast.error(errorMessage);
      
      // 返回详细错误信息
      return { 
        success: false, 
        error: { 
          message: errorMessage,
          status: error.response?.status,
          originalError: error
        } 
      };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    AuthService.logout();
    localStorage.removeItem('activeRole');
    setCurrentUser(null);
    setActiveRole(null);
    setIsAuthenticated(false);
  };
  
  const updateCurrentUser = (userData) => {
    setCurrentUser({ ...currentUser, ...userData });
  };
  
  const switchRole = (role) => {
    if (currentUser && (
      (role === 'regular') || 
      (role === 'cashier' && ['cashier', 'manager', 'superuser'].includes(currentUser.role)) ||
      (role === 'manager' && ['manager', 'superuser'].includes(currentUser.role)) ||
      (role === 'superuser' && currentUser.role === 'superuser')
    )) {
      setActiveRole(role);
      localStorage.setItem('activeRole', role);
      return true;
    }
    return false;
  };
  
  const requestPasswordReset = async (utorid) => {
    try {
      setLoading(true);
      const data = await AuthService.requestPasswordReset(utorid);
      return { success: true, data };
    } catch (error) {
      toast.error(error.message || 'Password reset request failed');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  const resetPassword = async (resetToken, utorid, password) => {
    try {
      setLoading(true);
      await AuthService.resetPassword(resetToken, utorid, password);
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Password reset failed');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  const updatePassword = async (oldPassword, newPassword) => {
    try {
      setLoading(true);
      await AuthService.updatePassword(oldPassword, newPassword);
      toast.success('Password updated successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Password update failed');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    currentUser,
    loading,
    activeRole,
    isAuthenticated,
    login,
    logout,
    updateCurrentUser,
    switchRole,
    requestPasswordReset,
    resetPassword,
    updatePassword,
  };
  
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
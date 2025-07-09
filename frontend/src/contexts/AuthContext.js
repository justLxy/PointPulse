import { createContext, useContext, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import AuthService from '../services/auth.service';
import { toast } from 'react-hot-toast';
import theme from '../styles/theme';
import AnimatedLogo from '../components/common/AnimatedLogo';

/**
 * AuthContext
 * Provides authentication state and methods throughout the application
 * Context pattern inspired by:
 * - React documentation: https://react.dev/learn/passing-data-deeply-with-context
 * - Kent C. Dodds' useAuth pattern: https://kentcdodds.com/blog/authentication-in-react-applications
 */


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
  width: 32px;
  height: 32px;
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
    {/* Modern animated logo*/}
    <div style={{ transform: 'scale(0.9)' }}>
      <AnimatedLogo />
    </div>
  </LoadingContainer>
);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
  
  useEffect(() => {
    const initAuth = async () => {
      const startTime = Date.now();
      try {
        // Check if token exists and is valid
        const isTokenValid = AuthService.isAuthenticated();
        setIsAuthenticated(isTokenValid);
        
        if (isTokenValid) {
          try {
            const user = await AuthService.getCurrentUser();
            
            if (user) {
              setCurrentUser(user);
              
              // First try to get active role from localStorage, otherwise use the user's default role
              const savedRole = localStorage.getItem('activeRole');
              setActiveRole(savedRole || user.role);
            } else {
              AuthService.logout();
              setIsAuthenticated(false);
            }
          } catch (error) {
            AuthService.logout();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
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
        setIsAuthenticated(isValid);
        
        // If no longer authenticated, clear the user state
        if (!isValid && currentUser) {
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
      
      // First get the token (response not used directly)
      await AuthService.login(utorid, password);
      
      // Then fetch user data with the new token (force refresh from API)
      const user = await AuthService.getCurrentUser(true);
      
      // Update state and localStorage
      setCurrentUser(user);
      setActiveRole(user.role);
      localStorage.setItem('activeRole', user.role);
      
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      
      // Provide more specific error messages
      let errorMessage = 'Unable to sign in. Please try again.';
      
      // Handle different types of errors
      if (error.response) {
        // Server returned an error status code
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
        // Request was sent but no response received
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      // Show error notification
      toast.error(errorMessage);
      
      // Return detailed error information
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
  
  // Request OTP login via email
  const requestEmailLogin = async (email) => {
    try {
      setLoading(true);
      await AuthService.requestEmailLogin(email);
      toast.success('Check your U of T email to complete login!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to send login code');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and log the user in
  const verifyEmailLogin = async (email, code) => {
    try {
      setLoading(true);
      await AuthService.verifyEmailLogin(email, code);

      // After token stored, fetch current user
      const user = await AuthService.getCurrentUser(true);

      setCurrentUser(user);
      setActiveRole(user.role);
      localStorage.setItem('activeRole', user.role);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      toast.error(error.message || 'Login verification failed');
      return { success: false, error };
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
    // Merge new data with existing user
    const updated = { ...currentUser, ...userData };
    setCurrentUser(updated);

    // Persist to localStorage so that page reload uses latest avatar / info
    try {
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (err) {
      // Silently handle localStorage errors
    }
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
      toast.success('Account activated successfully!');
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
    requestEmailLogin,
    verifyEmailLogin,
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
import { createContext, useContext, useEffect } from 'react';
import SocketService from '../services/socket.service';
import { useAuth } from './AuthContext';

/**
 * Socket Context
 * 
 * Provides socket connection management and real-time event handling 
 * throughout the application
 */

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // Connect to socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser?.utorid) {
      SocketService.connect(currentUser.utorid)
        .catch(() => {
          // Connection failed - real-time features (QR code scanning notifications) won't work
          // This is expected if backend WebSocket service is not running
        });
      
      // Cleanup on unmount or when auth state changes
      return () => {
        SocketService.disconnect();
      };
    }
  }, [isAuthenticated, currentUser?.utorid]);
  
  // Provide socket service methods
  const contextValue = {
    // Listen for events
    addEventListener: (event, callback) => {
      SocketService.on(event, callback);
      return () => SocketService.off(event, callback);
    },
    
    // Remove event listener
    removeEventListener: (event, callback) => {
      SocketService.off(event, callback);
    },
    
    // Check connection status
    isConnected: () => SocketService.isConnected()
  };
  
  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}; 
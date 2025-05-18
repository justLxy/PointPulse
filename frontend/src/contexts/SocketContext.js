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
      console.log('Connecting to socket as user:', currentUser.utorid);
      SocketService.connect(currentUser.utorid)
        .catch(error => {
          console.error('Failed to connect to socket:', error);
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
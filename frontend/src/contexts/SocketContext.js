import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { currentUser, isAuthenticated } = useAuth();
    
    useEffect(() => {
        // Initialize socket connection
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const socketInstance = io(BACKEND_URL, {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        
        // Set up event listeners
        socketInstance.on('connect', () => {
            console.log('Socket connected!', socketInstance.id);
            setIsConnected(true);
            
            // If user is authenticated, send user data to server
            if (isAuthenticated && currentUser) {
                socketInstance.emit('authenticate', {
                    id: currentUser.id,
                    utorid: currentUser.utorid
                });
            }
        });
        
        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected!');
            setIsConnected(false);
        });
        
        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });
        
        // Set the socket instance
        setSocket(socketInstance);
        
        // Clean up function
        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, []);
    
    // Connect or disconnect socket based on authentication state
    useEffect(() => {
        if (!socket) return;
        
        if (isAuthenticated && currentUser) {
            // Connect socket if authenticated and not already connected
            if (!isConnected) {
                socket.connect();
            }
            
            // Authenticate the socket connection
            if (isConnected) {
                socket.emit('authenticate', {
                    id: currentUser.id,
                    utorid: currentUser.utorid
                });
            }
        } else {
            // Disconnect if not authenticated
            if (isConnected) {
                socket.disconnect();
            }
        }
    }, [isAuthenticated, currentUser, socket, isConnected]);
    
    // Listen for event check-in notifications
    useEffect(() => {
        if (!socket) return;
        
        const handleEventCheckin = (data) => {
            console.log('Received event check-in notification:', data);
            
            // Show a toast notification
            if (data.status === 'success') {
                toast.success(
                    `You have been checked in to "${data.eventName}"`,
                    {
                        duration: 5000,
                        icon: '✅',
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    }
                );
            }
        };
        
        socket.on('event-checkin', handleEventCheckin);
        
        return () => {
            socket.off('event-checkin', handleEventCheckin);
        };
    }, [socket]);
    
    const value = {
        socket,
        isConnected,
    };
    
    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext; 
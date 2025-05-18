import { io } from 'socket.io-client';
import { API_URL } from './api';

let socket = null;
let isConnected = false;
let listeners = {};

/**
 * Socket service for handling real-time communication
 */
const SocketService = {
  /**
   * Connect to the Socket.IO server
   * @param {string} utorid - The user's UTORid to join their room
   * @returns {Promise<void>}
   */
  connect: (utorid) => {
    return new Promise((resolve, reject) => {
      try {
        if (socket && isConnected) {
          // If already connected, just join the user's room
          socket.emit('join', utorid);
          console.log('Already connected, joined room for:', utorid);
          resolve();
          return;
        }
        
        // Create a new socket connection
        socket = io(API_URL, {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
          transports: ['websocket', 'polling'],
        });
        
        // Connection events
        socket.on('connect', () => {
          console.log('Socket connected:', socket.id);
          isConnected = true;
          
          // Join user's room using their UTORid as the room name
          if (utorid) {
            socket.emit('join', utorid);
            console.log('Joined room for:', utorid);
          }
          
          resolve();
        });
        
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          if (!isConnected) {
            reject(error);
          }
        });
        
        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          isConnected = false;
        });
        
        // Set up checkin-success listener for event check-ins
        socket.on('checkin-success', (data) => {
          console.log('Received check-in confirmation:', data);
          
          // Notify registered listeners
          if (listeners['checkin-success']) {
            listeners['checkin-success'].forEach(callback => {
              try {
                callback(data);
              } catch (err) {
                console.error('Error in checkin-success listener callback:', err);
              }
            });
          }
        });
      } catch (error) {
        console.error('Error initializing socket:', error);
        reject(error);
      }
    });
  },
  
  /**
   * Disconnect from the Socket.IO server
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      isConnected = false;
      console.log('Socket disconnected');
    }
  },
  
  /**
   * Add an event listener
   * @param {string} event - The event name to listen for
   * @param {Function} callback - The callback function to call when the event occurs
   */
  on: (event, callback) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  },
  
  /**
   * Remove an event listener
   * @param {string} event - The event name
   * @param {Function} callback - The callback function to remove
   */
  off: (event, callback) => {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    }
  },
  
  /**
   * Check if the socket is connected
   * @returns {boolean} - Whether the socket is connected
   */
  isConnected: () => {
    return isConnected;
  }
};

export default SocketService; 
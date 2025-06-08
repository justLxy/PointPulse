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
          resolve();
          return;
        }
        
        // Create a new socket connection
        socket = io(API_URL, {
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 5000,
          reconnectionDelayMax: 10000,
          timeout: 10000,
          transports: ['polling', 'websocket'], // Try polling first, then websocket
          upgrade: true,
          forceNew: false,
        });
        
        // Connection events
        socket.on('connect', () => {
          isConnected = true;
          
          // Join user's room using their UTORid as the room name
          if (utorid) {
            socket.emit('join', utorid);
          }
          
          resolve();
        });
        
        socket.on('connect_error', (error) => {
          // Silently handle connection errors - WebSocket is optional
          if (!isConnected) {
            // Don't reject - just resolve to allow the app to continue
            resolve();
          }
        });
        
        socket.on('disconnect', (reason) => {
          isConnected = false;
        });
        
        // Set up checkin-success listener for event check-ins
        socket.on('checkin-success', (data) => {
          // Notify registered listeners
          if (listeners['checkin-success']) {
            listeners['checkin-success'].forEach(callback => {
              try {
                callback(data);
              } catch (err) {
                // Silently handle callback errors
              }
            });
          }
        });
      } catch (error) {
        // Silently handle initialization errors - WebSocket is optional
        resolve();
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
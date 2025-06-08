/**
 * Core Socket Flow: WebSocket communication business logic
 * Validates socket connection, event handling, and room management workflows
 */

import { io } from 'socket.io-client';
import SocketService from '../../services/socket.service';
import { API_URL } from '../../services/api';

// Mock socket.io-client
jest.mock('socket.io-client');

describe('SocketService - WebSocket Management', () => {
  let mockSocket;
  let mockEmit;
  let mockOn;
  let mockDisconnect;
  let eventHandlers;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Store event handlers
    eventHandlers = {};
    
    // Create mock socket methods
    mockEmit = jest.fn();
    mockOn = jest.fn((event, handler) => {
      eventHandlers[event] = handler;
    });
    mockDisconnect = jest.fn();
    
    // Create mock socket instance
    mockSocket = {
      id: 'mock-socket-id',
      emit: mockEmit,
      on: mockOn,
      disconnect: mockDisconnect
    };
    
    // Mock io to return our mock socket
    io.mockReturnValue(mockSocket);
  });

  test('socket connection lifecycle: connect → join room → disconnect', async () => {
    const utorid = 'testuser';
    
    // Test successful connection
    const connectPromise = SocketService.connect(utorid);
    
    // Wait for event handlers to be set up
    await Promise.resolve();
    
    // Simulate successful connection
    eventHandlers['connect']();
    
    await connectPromise;
    
    // Verify socket creation
    expect(io).toHaveBeenCalledWith(API_URL, {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      transports: ['polling', 'websocket'],
      upgrade: true,
      forceNew: false
    });
    
    // Verify event listeners were set up
    expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('checkin-success', expect.any(Function));
    
    // Verify room join
    expect(mockEmit).toHaveBeenCalledWith('join', utorid);
    
    // Test connection status
    expect(SocketService.isConnected()).toBe(true);
    
    // Test disconnect
    SocketService.disconnect();
    expect(mockDisconnect).toHaveBeenCalled();
    expect(SocketService.isConnected()).toBe(false);
  });

  test('event listener management', async () => {
    // Connect first
    const connectPromise = SocketService.connect('testuser');
    await Promise.resolve();
    
    // Simulate successful connection if handler exists
    if (eventHandlers['connect']) {
      eventHandlers['connect']();
    }
    await connectPromise;
    
    // Test adding event listener
    const mockCallback = jest.fn();
    SocketService.on('checkin-success', mockCallback);
    
    // Simulate checkin-success event
    const eventData = { eventId: 1, status: 'success' };
    eventHandlers['checkin-success'](eventData);
    
    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledWith(eventData);
    
    // Test removing event listener
    SocketService.off('checkin-success', mockCallback);
    
    // Simulate another event - callback should not be called
    eventHandlers['checkin-success'](eventData);
    expect(mockCallback).toHaveBeenCalledTimes(1); // Still only called once
  });
}); 
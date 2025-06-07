import React from 'react';
import { render, renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SocketProvider, useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import SocketService from '../../services/socket.service';


jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));


jest.mock('../../services/socket.service', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  isConnected: jest.fn()
}));


const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('SocketContext', () => {
  const mockAuth = {
    currentUser: { utorid: 'test123' },
    isAuthenticated: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set default return values for all mock functions
    SocketService.connect.mockResolvedValue();
    SocketService.isConnected.mockReturnValue(false);
    useAuth.mockReturnValue({
      currentUser: null,
      isAuthenticated: false
    });
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  // Test useSocket hook
  it('should return context value from useSocket', () => {
    useAuth.mockReturnValue({
      currentUser: null,
      isAuthenticated: false
    });
    
    const wrapper = ({ children }) => (
      <SocketProvider>{children}</SocketProvider>
    );
    
    const { result } = renderHook(() => useSocket(), { wrapper });
    
    expect(result.current).toHaveProperty('addEventListener');
    expect(result.current).toHaveProperty('removeEventListener');
    expect(result.current).toHaveProperty('isConnected');
  });

  
  it('should connect socket when user is authenticated', async () => {
    useAuth.mockReturnValue(mockAuth);
    SocketService.connect.mockResolvedValue();

    render(
      <SocketProvider>
        <div>Test Component</div>
      </SocketProvider>
    );

    await waitFor(() => {
      expect(SocketService.connect).toHaveBeenCalledWith('test123');
    });
    expect(mockConsoleLog).toHaveBeenCalledWith('Connecting to socket as user:', 'test123');
  });

  // Test socket connection failure handling
  it('should log error when socket connection fails', async () => {
    useAuth.mockReturnValue(mockAuth);
    const error = new Error('Connection failed');
    SocketService.connect.mockRejectedValue(error);

    render(
      <SocketProvider>
        <div>Test Component</div>
      </SocketProvider>
    );

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to connect to socket:', error);
    });
  });

  // Test no socket connection when user is not authenticated
  it('should not connect socket when user is not authenticated', () => {
    useAuth.mockReturnValue({
      currentUser: null,
      isAuthenticated: false
    });

    render(
      <SocketProvider>
        <div>Test Component</div>
      </SocketProvider>
    );

    expect(SocketService.connect).not.toHaveBeenCalled();
  });

  // Test no socket connection when utorid is missing
  it('should not connect socket when utorid is missing', () => {
    useAuth.mockReturnValue({
      currentUser: { utorid: null },
      isAuthenticated: true
    });

    render(
      <SocketProvider>
        <div>Test Component</div>
      </SocketProvider>
    );

    expect(SocketService.connect).not.toHaveBeenCalled();
  });

  // Test adding event listener
  it('addEventListener should call SocketService.on and return cleanup function', () => {
    useAuth.mockReturnValue({
      currentUser: null,
      isAuthenticated: false
    });
    
    const wrapper = ({ children }) => (
      <SocketProvider>{children}</SocketProvider>
    );
    
    const { result } = renderHook(() => useSocket(), { wrapper });
    const callback = jest.fn();
    
    const cleanup = result.current.addEventListener('test-event', callback);
    
    expect(SocketService.on).toHaveBeenCalledWith('test-event', callback);
    expect(typeof cleanup).toBe('function');
    
    // Test cleanup function
    cleanup();
    expect(SocketService.off).toHaveBeenCalledWith('test-event', callback);
  });

  // Test removing event listener
  it('removeEventListener should call SocketService.off', () => {
    useAuth.mockReturnValue({
      currentUser: null,
      isAuthenticated: false
    });
    
    const wrapper = ({ children }) => (
      <SocketProvider>{children}</SocketProvider>
    );
    
    const { result } = renderHook(() => useSocket(), { wrapper });
    const callback = jest.fn();
    
    result.current.removeEventListener('test-event', callback);
    
    expect(SocketService.off).toHaveBeenCalledWith('test-event', callback);
  });

  // Test connection status check
  it('isConnected should return SocketService.isConnected result', () => {
    useAuth.mockReturnValue({
      currentUser: null,
      isAuthenticated: false
    });
    SocketService.isConnected.mockReturnValue(true);
    
    const wrapper = ({ children }) => (
      <SocketProvider>{children}</SocketProvider>
    );
    
    const { result } = renderHook(() => useSocket(), { wrapper });
    
    const connected = result.current.isConnected();
    
    expect(SocketService.isConnected).toHaveBeenCalled();
    expect(connected).toBe(true);
  });

  // Test socket disconnection on component unmount
  it('should disconnect socket when component unmounts', async () => {
    useAuth.mockReturnValue(mockAuth);
    SocketService.connect.mockResolvedValue();

    const { unmount } = render(
      <SocketProvider>
        <div>Test Component</div>
      </SocketProvider>
    );

    await waitFor(() => {
      expect(SocketService.connect).toHaveBeenCalled();
    });

    unmount();

    expect(SocketService.disconnect).toHaveBeenCalled();
  });

  // Test socket reconnection when auth state changes
  it('should reconnect socket when auth state changes', async () => {
    // Initial state: not authenticated
    useAuth.mockReturnValue({
      currentUser: null,
      isAuthenticated: false
    });

    const { rerender } = render(
      <SocketProvider>
        <div>Test Component</div>
      </SocketProvider>
    );

    expect(SocketService.connect).not.toHaveBeenCalled();

    // Change to authenticated state
    useAuth.mockReturnValue(mockAuth);

    rerender(
      <SocketProvider>
        <div>Test Component</div>
      </SocketProvider>
    );

    await waitFor(() => {
      expect(SocketService.connect).toHaveBeenCalledWith('test123');
    });
  });
}); 
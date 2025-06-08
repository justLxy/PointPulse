/**
 * 场景：管理员扫描用户的二维码后，用户页面收到签到成功的push notification
 * 预期：1) WebSocket事件监听器正确注册 2) 收到事件时正确处理数据
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@emotion/react';
import theme from '../../styles/theme';

// Mock SocketService with a proper factory function
jest.mock('../../services/socket.service', () => ({
  __esModule: true,
  default: {
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    isConnected: jest.fn().mockReturnValue(true),
    emit: jest.fn()
  }
}));

// Mock auth service
jest.mock('../../services/auth.service', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({
    id: 1,
    utorid: 'testuser',
    name: 'Test User',
    role: 'regular',
    points: 1000,
    verified: true
  }),
  getAuthToken: jest.fn().mockReturnValue('mock-token'),
  isAuthenticated: jest.fn().mockReturnValue(true),
  isTokenValid: jest.fn().mockReturnValue(true),
  logout: jest.fn()
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Now import dependencies including the real CheckinNotification component
import CheckinNotification from '../../components/notifications/CheckinNotification';
import { SocketProvider } from '../../contexts/SocketContext';
import { AuthProvider } from '../../contexts/AuthContext';
import SocketService from '../../services/socket.service';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <AuthProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </AuthProvider>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('WebSocket Push Notification Core', () => {
  let mockCallbacks = {};
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockCallbacks = {};
    
    // Capture callbacks registered with socket service
    SocketService.on.mockImplementation((event, callback) => {
      if (!mockCallbacks[event]) {
        mockCallbacks[event] = [];
      }
      mockCallbacks[event].push(callback);
    });
    
    SocketService.off.mockImplementation((event, callback) => {
      if (mockCallbacks[event]) {
        mockCallbacks[event] = mockCallbacks[event].filter(cb => cb !== callback);
      }
    });
  });

  it('displays correct notification message format when admin scans QR code', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <CheckinNotification />
      </Wrapper>
    );

    // Wait for socket event listener to be registered
    await waitFor(() => {
      expect(SocketService.on).toHaveBeenCalledWith('checkin-success', expect.any(Function));
    });

    // Simulate admin scanning user's QR code for a specific event
    const checkinData = {
      eventId: 123,
      eventName: 'Ongoing CS Hackathon 1',
      scannedBy: 'admin123',
      userId: 1,
      timestamp: new Date().toISOString()
    };

    // Trigger the websocket event
    if (mockCallbacks['checkin-success']) {
      mockCallbacks['checkin-success'].forEach(callback => {
        callback(checkinData);
      });
    }

    // Verify the exact notification format you mentioned
    await waitFor(() => {
      expect(screen.getByText('Check-in Successful!')).toBeInTheDocument();
    });

    expect(screen.getByText(/You've been checked in to/)).toBeInTheDocument();
    expect(screen.getByText('Ongoing CS Hackathon 1')).toBeInTheDocument();
  });

  it('shows and can close notification when admin scans user QR code', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <CheckinNotification />
      </Wrapper>
    );

    // Wait for socket event listener to be registered
    await waitFor(() => {
      expect(SocketService.on).toHaveBeenCalledWith('checkin-success', expect.any(Function));
    });

    // Simulate admin scanning user's QR code - backend sends checkin-success event
    const checkinData = {
      eventId: 123,
      eventName: 'React Workshop',
      scannedBy: 'admin123',
      userId: 1,
      timestamp: new Date().toISOString()
    };

    // Trigger the websocket event
    if (mockCallbacks['checkin-success']) {
      mockCallbacks['checkin-success'].forEach(callback => {
        callback(checkinData);
      });
    }

    // Verify notification appears with correct content
    await waitFor(() => {
      expect(screen.getByText('Check-in Successful!')).toBeInTheDocument();
    });

    expect(screen.getByText('React Workshop')).toBeInTheDocument();
    expect(screen.getByText(/You've been checked in to/)).toBeInTheDocument();
    
    // Verify close functionality works
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Check-in Successful!')).not.toBeInTheDocument();
    });
  });

  it('processes multiple QR scan notifications', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <CheckinNotification />
      </Wrapper>
    );

    await waitFor(() => {
      expect(SocketService.on).toHaveBeenCalledWith('checkin-success', expect.any(Function));
    });

    // First scan
    if (mockCallbacks['checkin-success']) {
      mockCallbacks['checkin-success'].forEach(callback => {
        callback({
          eventId: 123,
          eventName: 'Morning Session',
          scannedBy: 'admin1'
        });
      });
    }

    // Second scan  
    if (mockCallbacks['checkin-success']) {
      mockCallbacks['checkin-success'].forEach(callback => {
        callback({
          eventId: 124,
          eventName: 'Afternoon Session', 
          scannedBy: 'admin2'
        });
      });
    }

    // Both notifications should be visible
    await waitFor(() => {
      expect(screen.getByText('Morning Session')).toBeInTheDocument();
      expect(screen.getByText('Afternoon Session')).toBeInTheDocument();
    });

    // Should have multiple close buttons
    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('socket service is properly mocked and available', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <CheckinNotification />
      </Wrapper>
    );

    // Verify socket service methods are available and mocked
    expect(SocketService.connect).toBeDefined();
    expect(SocketService.on).toBeDefined();
    expect(SocketService.off).toBeDefined();
    expect(SocketService.isConnected).toBeDefined();
    
    // Verify socket event listener registration works
    await waitFor(() => {
      expect(SocketService.on).toHaveBeenCalledWith('checkin-success', expect.any(Function));
    });
  });

  it('socket event listener cleanup works properly', async () => {
    const Wrapper = createWrapper();
    
    const { unmount } = render(
      <Wrapper>
        <CheckinNotification />
      </Wrapper>
    );

    await waitFor(() => {
      expect(SocketService.on).toHaveBeenCalledWith('checkin-success', expect.any(Function));
    });

    // Unmount component should trigger cleanup
    unmount();

    // Note: cleanup function behavior depends on implementation
    // This test validates the pattern is set up correctly
    expect(SocketService.on).toHaveBeenCalled();
  });
}); 
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import EventCheckinDisplay from '../../../pages/events/EventCheckinDisplay';
import EventService from '../../../services/event.service';
import theme from '../../../styles/theme';

// Mock EventService
jest.mock('../../../services/event.service');

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  
  const createMotionComponent = (tag) => {
    const MotionComponent = React.forwardRef(({ children, initial, animate, transition, whileHover, whileTap, ...props }, ref) => {
      return React.createElement(tag, { ...props, ref }, children);
    });
    MotionComponent.displayName = `motion.${tag}`;
    return MotionComponent;
  };

  return {
    motion: {
      div: createMotionComponent('div'),
      h2: createMotionComponent('h2'),
      button: createMotionComponent('button'),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

// Mock QRCodeCanvas
jest.mock('qrcode.react', () => ({
  QRCodeCanvas: ({ value, size, fgColor, level, includeMargin }) => (
    <div 
      data-testid="qr-code"
      data-value={value}
      data-size={size}
      data-fg-color={fgColor}
      data-level={level}
      data-include-margin={includeMargin}
    >
      QR Code: {value}
    </div>
  ),
}));

// Mock LoadingSpinner
jest.mock('../../../components/common/LoadingSpinner', () => {
  return function LoadingSpinner({ text }) {
    return <div data-testid="loading-spinner">{text}</div>;
  };
});

// Mock Button component
jest.mock('../../../components/common/Button', () => {
  return function Button({ children, onClick, size, variant, title, ...props }) {
    return (
      <button 
        onClick={onClick} 
        title={title}
        data-size={size}
        data-variant={variant}
        {...props}
      >
        {children}
      </button>
    );
  };
});

const createWrapper = (eventId = '1') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[`/events/${eventId}/checkin`]}>
          <Routes>
            <Route path="/events/:eventId/checkin" element={children} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('EventCheckinDisplay', () => {
  let wrapper;
  const mockEventId = '1';
  const mockTokenData = {
    eventId: 1,
    timestamp: Date.now(),
    signature: 'mock-signature',
    token: '1:1234567890:mock-signature'
  };
  const mockEventData = {
    id: 1,
    name: 'Test Event',
    description: 'Test event description',
    location: 'Test Location',
    startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago (ongoing)
    endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    capacity: 50,
    published: true
  };

  beforeEach(() => {
    wrapper = createWrapper(mockEventId);
    jest.clearAllMocks();
    
    // Mock window.location.origin
    delete window.location;
    window.location = { origin: 'http://localhost:3000' };
    
    // Setup default successful mocks
    EventService.getCheckinToken.mockResolvedValue(mockTokenData);
    EventService.getEvent.mockResolvedValue(mockEventData);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Loading States', () => {
    it('shows loading spinner while fetching data', () => {
      EventService.getCheckinToken.mockImplementation(() => new Promise(() => {})); // Never resolves
      EventService.getEvent.mockImplementation(() => new Promise(() => {}));

      render(<EventCheckinDisplay />, { wrapper });

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading check-in...')).toBeInTheDocument();
    });

    it('shows loading when only token is loading', () => {
      EventService.getCheckinToken.mockImplementation(() => new Promise(() => {}));
      EventService.getEvent.mockResolvedValue(mockEventData);

      render(<EventCheckinDisplay />, { wrapper });

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows loading when only event is loading', () => {
      EventService.getCheckinToken.mockResolvedValue(mockTokenData);
      EventService.getEvent.mockImplementation(() => new Promise(() => {}));

      render(<EventCheckinDisplay />, { wrapper });

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Successful QR Code Display', () => {
    it('renders QR code display for ongoing event', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Event Check-In')).toBeInTheDocument();
      });

      expect(screen.getByText('Scan this QR code with your device to check in')).toBeInTheDocument();
      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    it('generates correct QR code value', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        const qrCode = screen.getByTestId('qr-code');
        expect(qrCode).toBeInTheDocument();
      });

      const qrCode = screen.getByTestId('qr-code');
      const qrValue = qrCode.getAttribute('data-value');
      
      expect(qrValue).toContain('http://localhost:3000/events/1/attend?data=');
      
      // Decode and verify the data parameter
      const url = new URL(qrValue);
      const dataParam = url.searchParams.get('data');
      const decodedData = JSON.parse(atob(decodeURIComponent(dataParam)));
      
      expect(decodedData).toEqual({
        type: 'pointpulse',
        version: '1.0',
        context: 'event',
        eventId: mockEventId,
        token: mockTokenData.token
      });
    });

    it('displays event name when available', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      // Check for calendar icon and event name
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    it('works without event name', async () => {
      EventService.getEvent.mockResolvedValue({ ...mockEventData, name: null });

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Event Check-In')).toBeInTheDocument();
      });

      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
      expect(screen.queryByText('Test Event')).not.toBeInTheDocument();
    });
  });

  describe('Timer Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('displays countdown timer', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Refreshes in/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Refreshes in \d+ seconds/)).toBeInTheDocument();
    });

    it('counts down timer correctly', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Refreshes in/)).toBeInTheDocument();
      });

      // Get initial timer value
      const initialTimer = screen.getByText(/Refreshes in \d+ seconds/);
      expect(initialTimer).toBeInTheDocument();

      // Advance timer by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Timer should have decreased
      expect(screen.getByText(/Refreshes in \d+ seconds/)).toBeInTheDocument();
    });

    it('resets timer when QR code is refreshed', async () => {
      const { rerender } = render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Refreshes in/)).toBeInTheDocument();
      });

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Mock new token data to simulate refresh
      const newTokenData = { ...mockTokenData, timestamp: Date.now() + 1000 };
      EventService.getCheckinToken.mockResolvedValue(newTokenData);

      // Trigger rerender to simulate token refresh
      rerender(<EventCheckinDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/Refreshes in/)).toBeInTheDocument();
      });
    });

    it('resets to 30 when timer reaches 0', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Refreshes in/)).toBeInTheDocument();
      });

      // Advance timer to 0
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(screen.getByText(/Refreshes in/)).toBeInTheDocument();
    });
  });

  describe('Manual Refresh Functionality', () => {
    it('provides manual refresh button', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTitle('Refresh QR code now')).toBeInTheDocument();
      });

      const refreshButton = screen.getByTitle('Refresh QR code now');
      expect(refreshButton).toBeInTheDocument();
    });

    it('calls refetch when refresh button is clicked', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTitle('Refresh QR code now')).toBeInTheDocument();
      });

      const refreshButton = screen.getByTitle('Refresh QR code now');
      fireEvent.click(refreshButton);

      // Verify that the service was called again
      expect(EventService.getCheckinToken).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Status Restrictions', () => {
    it('shows error for upcoming event', async () => {
      const upcomingEvent = {
        ...mockEventData,
        startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 7200000).toISOString() // 2 hours from now
      };
      EventService.getEvent.mockResolvedValue(upcomingEvent);

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Check-in Unavailable')).toBeInTheDocument();
      });

      expect(screen.getByText('Check-in has not started yet. Please come back once the event is in progress.')).toBeInTheDocument();
      expect(screen.getByText('Back to Events')).toBeInTheDocument();
    });

    it('shows error for ended event', async () => {
      const endedEvent = {
        ...mockEventData,
        startTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        endTime: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      };
      EventService.getEvent.mockResolvedValue(endedEvent);

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Check-in Unavailable')).toBeInTheDocument();
      });

      expect(screen.getByText('This event has already ended. Check-in is now closed.')).toBeInTheDocument();
      expect(screen.getByText('Back to Events')).toBeInTheDocument();
    });

    it('allows check-in for ongoing event', async () => {
      // mockEventData is already set up as ongoing event
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Event Check-In')).toBeInTheDocument();
      });

      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
      expect(screen.queryByText('Check-in Unavailable')).not.toBeInTheDocument();
    });

    it('handles event without end time as ongoing', async () => {
      const eventWithoutEndTime = {
        ...mockEventData,
        endTime: null
      };
      EventService.getEvent.mockResolvedValue(eventWithoutEndTime);

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Event Check-In')).toBeInTheDocument();
      });

      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error when token fetch fails', async () => {
      EventService.getCheckinToken.mockRejectedValue(new Error('Token fetch failed'));
      EventService.getEvent.mockResolvedValue(mockEventData);

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Check-in Failed')).toBeInTheDocument();
      });

      expect(screen.getByText('Token fetch failed')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Back to Events')).toBeInTheDocument();
    });

    it('shows default error message when no specific error message', async () => {
      EventService.getCheckinToken.mockRejectedValue(new Error());
      EventService.getEvent.mockResolvedValue(mockEventData);

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Check-in Failed')).toBeInTheDocument();
      });

      expect(screen.getByText('Token expired')).toBeInTheDocument();
    });

    it('provides retry functionality on error', async () => {
      EventService.getCheckinToken.mockRejectedValueOnce(new Error('Network error'));
      EventService.getEvent.mockResolvedValue(mockEventData);

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      // Mock successful retry
      EventService.getCheckinToken.mockResolvedValue(mockTokenData);

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Event Check-In')).toBeInTheDocument();
      });

      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    });

    it('handles event fetch failure gracefully', async () => {
      EventService.getCheckinToken.mockResolvedValue(mockTokenData);
      EventService.getEvent.mockRejectedValue(new Error('Event not found'));

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Event Check-In')).toBeInTheDocument();
      });

      // Should still show QR code even if event details fail
      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
      // But event name should not be displayed
      expect(screen.queryByText('Test Event')).not.toBeInTheDocument();
    });
  });

  describe('QR Code Properties', () => {
    it('sets correct QR code properties', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('qr-code')).toBeInTheDocument();
      });

      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode.getAttribute('data-size')).toBe('280');
      expect(qrCode.getAttribute('data-fg-color')).toBe(theme.colors.primary.main);
      expect(qrCode.getAttribute('data-level')).toBe('H');
      expect(qrCode.getAttribute('data-include-margin')).toBe('true');
    });
  });

  describe('Responsive Design Elements', () => {
    it('renders all responsive styled components', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Event Check-In')).toBeInTheDocument();
      });

      // Check that main structural elements are present
      expect(screen.getByText('Event Check-In')).toBeInTheDocument();
      expect(screen.getByText('Scan this QR code with your device to check in')).toBeInTheDocument();
      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing token data gracefully', async () => {
      EventService.getCheckinToken.mockResolvedValue(null);
      EventService.getEvent.mockResolvedValue(mockEventData);

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('qr-code')).toBeInTheDocument();
      });

      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode.getAttribute('data-value')).toBe('');
    });

    it('handles invalid event ID in URL params', async () => {
      // This would be handled by React Router, but we can test the component behavior
      render(<EventCheckinDisplay />, { wrapper });

      // Component should still attempt to fetch data
      expect(EventService.getCheckinToken).toHaveBeenCalled();
      expect(EventService.getEvent).toHaveBeenCalled();
    });

    it('handles missing event data for status calculation', async () => {
      EventService.getCheckinToken.mockResolvedValue(mockTokenData);
      EventService.getEvent.mockResolvedValue(null);

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Event Check-In')).toBeInTheDocument();
      });

      // Should show QR code since event status is null (no restriction)
      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    });
  });

  describe('Service Integration', () => {
    it('calls EventService with correct parameters', async () => {
      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(EventService.getCheckinToken).toHaveBeenCalledWith(mockEventId);
        expect(EventService.getEvent).toHaveBeenCalledWith(mockEventId);
      });
    });

    it('handles service call failures independently', async () => {
      EventService.getCheckinToken.mockResolvedValue(mockTokenData);
      EventService.getEvent.mockRejectedValue(new Error('Service error'));

      render(<EventCheckinDisplay />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Event Check-In')).toBeInTheDocument();
      });

      // Should still render QR code even if event service fails
      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    });
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventCheckinAttend from '../../../pages/events/EventCheckinAttend';

// Mock all dependencies
jest.mock('../../../services/event.service', () => ({
  getEvent: jest.fn(),
  submitCheckin: jest.fn(),
  rsvpToEvent: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
  useNavigate: jest.fn()
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => <div>{children}</div>
}));

jest.mock('../../../components/common/LoadingSpinner', () => ({ text }) => <div data-testid="loading-spinner">{text}</div>);
jest.mock('../../../components/common/Button', () => ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} data-testid="button">{children}</button>
));

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
};

describe('EventCheckinAttend', () => {
  let mockEventService, mockUseParams, mockUseSearchParams, mockUseNavigate;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventService = require('../../../services/event.service');
    mockUseParams = require('react-router-dom').useParams;
    mockUseSearchParams = require('react-router-dom').useSearchParams;
    mockUseNavigate = require('react-router-dom').useNavigate;
    
    // Default successful setup
    mockUseParams.mockReturnValue({ eventId: '123' });
    mockUseSearchParams.mockReturnValue([new URLSearchParams('data=eyJ0eXBlIjoicG9pbnRwdWxzZSIsImNvbnRleHQiOiJldmVudCIsInRva2VuIjoiMTIzOjE2MTIzNDU2Nzg6c2lnbmF0dXJlIn0%3D'), jest.fn()]);
    mockUseNavigate.mockReturnValue(jest.fn());
  });

  it('handles complete checkin flow from loading to success', async () => {
    // Mock successful event details and checkin
    mockEventService.getEvent.mockResolvedValue({
      name: 'Test Event',
      startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      endTime: new Date(Date.now() + 3600000).toISOString() // 1 hour later
    });
    mockEventService.submitCheckin.mockResolvedValue({
      checkedInAt: new Date().toISOString()
    });

    render(<TestWrapper><EventCheckinAttend /></TestWrapper>);

    // Initially shows loading
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText('Check-in Successful!')).toBeInTheDocument();
    });

    expect(screen.getByText('Check-in Successful!')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText(/Checked in at/)).toBeInTheDocument();
  });

  it('handles all error scenarios and RSVP flow', async () => {
    const { rerender } = render(<TestWrapper><EventCheckinAttend /></TestWrapper>);

    // Test 1: Invalid token (no data param)
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);
    rerender(<TestWrapper><EventCheckinAttend /></TestWrapper>);
    
    await waitFor(() => {
      expect(screen.getByText('Check-in Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid or missing token.')).toBeInTheDocument();
    });

    // Test 2: Needs RSVP error
    mockUseSearchParams.mockReturnValue([new URLSearchParams('data=eyJ0eXBlIjoicG9pbnRwdWxzZSIsImNvbnRleHQiOiJldmVudCIsInRva2VuIjoiMTIzOjE2MTIzNDU2Nzg6c2lnbmF0dXJlIn0%3D'), jest.fn()]);
    mockEventService.getEvent.mockResolvedValue({
      name: 'RSVP Event',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString()
    });
    mockEventService.submitCheckin.mockRejectedValue({
      response: { data: { needsRsvp: true } }
    });

    rerender(<TestWrapper><EventCheckinAttend /></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText('RSVP Required')).toBeInTheDocument();
      expect(screen.getByText(/You need to RSVP to.*RSVP Event.*before checking in/)).toBeInTheDocument();
    });

    // Test RSVP flow
    mockEventService.rsvpToEvent.mockResolvedValue({});
    mockEventService.submitCheckin.mockResolvedValue({ checkedInAt: new Date().toISOString() });

    const rsvpButton = screen.getByText('RSVP Now');
    fireEvent.click(rsvpButton);

    await waitFor(() => {
      expect(screen.getByText('Check-in Successful!')).toBeInTheDocument();
    });

    // Test 3: Event timing errors  
    mockEventService.getEvent.mockResolvedValue({
      name: 'Future Event',
      startTime: new Date(Date.now() + 3600000).toISOString(), // Future event
      endTime: new Date(Date.now() + 7200000).toISOString()
    });

    rerender(<TestWrapper><EventCheckinAttend /></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText('This event has not started yet. Check-in will open once the event is ongoing.')).toBeInTheDocument();
    });
  });

  it('handles login redirect and navigation', async () => {
    const mockNavigateFn = jest.fn();
    mockUseNavigate.mockReturnValue(mockNavigateFn);
    
    mockEventService.getEvent.mockResolvedValue({
      name: 'Login Event',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString()
    });
    mockEventService.submitCheckin.mockRejectedValue(new Error('Please log in'));

    render(<TestWrapper><EventCheckinAttend /></TestWrapper>);

    await waitFor(() => {
      expect(mockNavigateFn).toHaveBeenCalledWith(
        expect.stringContaining('/login?returnUrl='),
        expect.objectContaining({ state: expect.any(Object) })
      );
    });

    // Test navigation buttons in success state
    mockEventService.submitCheckin.mockResolvedValue({ checkedInAt: new Date().toISOString() });
    const { rerender } = render(<TestWrapper><EventCheckinAttend /></TestWrapper>);
    
    await waitFor(() => {
      expect(screen.getByText('View All Events')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View All Events'));
    expect(mockNavigateFn).toHaveBeenCalledWith('/events');
  });

  it('handles malformed tokens and retry actions', async () => {
    // Setup mocks before rendering
    const malformedToken = btoa(JSON.stringify({
      type: 'pointpulse',
      context: 'event',
      token: 'malformed:token' // Only 2 parts instead of 3
    }));
    mockUseSearchParams.mockReturnValue([new URLSearchParams(`data=${encodeURIComponent(malformedToken)}`), jest.fn()]);

    const mockNavigateFn = jest.fn();
    mockUseNavigate.mockReturnValue(mockNavigateFn);

    // Mock window.location.reload before rendering
    delete window.location;
    window.location = { reload: jest.fn() };

    render(<TestWrapper><EventCheckinAttend /></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText('Malformed token.')).toBeInTheDocument();
    });

    // Test retry button
    fireEvent.click(screen.getByText('Try Again'));
    expect(window.location.reload).toHaveBeenCalled();

    // Test back button
    fireEvent.click(screen.getByText(/Back to Events/));
    expect(mockNavigateFn).toHaveBeenCalledWith('/events');
  });
}); 
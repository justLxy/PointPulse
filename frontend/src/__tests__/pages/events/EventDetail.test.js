import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventDetail from '../../../pages/events/EventDetail';

// Mock hooks and context
const mockEvent = {
  id: 1,
  name: 'Test Event',
  description: 'This is a test event.',
  location: 'Test Location',
  capacity: 100,
  points: 10,
  startTime: '2024-06-01T10:00:00Z',
  endTime: '2024-06-01T12:00:00Z',
  published: true,
  isOrganizer: true,
  isAttending: false,
  guests: [
    { id: 1, name: 'Alice', utorid: 'alice123', checkedIn: true },
    { id: 2, name: 'Bob', utorid: 'bob456', checkedIn: false }
  ],
  organizers: [
    { id: 1, name: 'Alice' },
    { id: 3, name: 'Charlie' }
  ],
  numGuests: 2,
  pointsAwarded: 5,
  pointsRemain: 5,
};

const mockAuthContext = {
  activeRole: 'manager',
  currentUser: { id: 1, name: 'Alice', utorid: 'alice123' }
};

jest.mock('../../../hooks/useEvents', () => ({
  useEvents: () => ({
    getEvent: () => ({
      data: mockEvent,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    }),
    rsvpToEvent: jest.fn(),
    cancelRsvp: jest.fn(),
    addOrganizer: jest.fn(),
    removeOrganizer: jest.fn(),
    addGuest: jest.fn(),
    removeGuest: jest.fn(),
    awardPoints: jest.fn(),
    isRsvping: false,
    isCancellingRsvp: false,
    isAwardingPoints: false,
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    isUpdating: false,
    isDeleting: false,
    removeAllGuests: jest.fn(),
  })
}));

jest.mock('../../../hooks/useUsers', () => ({
  useUsers: () => ({ users: [] })
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

jest.mock('../../../components/common/LoadingSpinner', () => ({ text }) => (
  <div data-testid="loading-spinner">{text}</div>
));

const renderEventDetail = (role = 'manager', event = mockEvent) => {
  mockAuthContext.activeRole = role;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/events/${event.id}`]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('EventDetail Page', () => {
  it('renders event details', () => {
    renderEventDetail();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getAllByText('This is a test event.').length).toBeGreaterThan(0);
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('2 / 100 capacity')).toBeInTheDocument();
    // Check basic UI elements exist
    expect(screen.getByText('Back to Events')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('shows guests and organizers tabs and can switch', () => {
    renderEventDetail();
    // Default is on details tab
    expect(screen.getByText(/about this event/i)).toBeInTheDocument();
    // Switch to guests tab
    const guestsTabBtn = screen.getAllByRole('button', { name: /guests/i })[0];
    fireEvent.click(guestsTabBtn);
    expect(screen.getByText(/Total Guests/i)).toBeInTheDocument();
    // Switch to organizers tab
    const orgTabBtn = screen.getAllByRole('button', { name: /organizers/i })[0];
    fireEvent.click(orgTabBtn);
    expect(screen.getAllByText(/Organizers/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Charlie/)).toBeInTheDocument();
  });

  it('can interact with guests tab', () => {
    renderEventDetail('manager');
    const guestsTabBtn = screen.getAllByRole('button', { name: /guests/i })[0];
    fireEvent.click(guestsTabBtn);
    // Verify guests tab is successfully activated
    expect(guestsTabBtn).toBeInTheDocument();
    // Verify guests related UI elements exist
    expect(screen.getByText(/Total Guests/i)).toBeInTheDocument();
    // Verify can see guest information
    expect(screen.getAllByText(/Alice/).length).toBeGreaterThan(0);
  });

  it('renders component without loading spinner when data is loaded', () => {
    renderEventDetail();
    // Ensure Loading Spinner is not in document (because isLoading: false)
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    // Ensure event content is rendered
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('shows different view for regular user', () => {
    renderEventDetail('regular');
    expect(screen.queryByRole('button', { name: /organizers/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /guests/i })[0]).toBeInTheDocument();
  });
}); 
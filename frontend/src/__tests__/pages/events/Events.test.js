import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Events from '../../../pages/events/Events';
import { useEvents } from '../../../hooks/useEvents';
import { useAuth } from '../../../contexts/AuthContext';

// Mock hooks and components
jest.mock('../../../hooks/useEvents');
jest.mock('../../../contexts/AuthContext');
jest.mock('../../../components/events/EventFilters', () => ({ 
  isManager, filters, onFilterChange, onCreateClick 
}) => (
  <div data-testid="event-filters">
    <button onClick={onCreateClick}>Create Event</button>
    <input 
      placeholder="Search events"
      value={filters.name}
      onChange={(e) => onFilterChange('name', e.target.value)}
    />
    <select 
      value={filters.status}
      onChange={(e) => onFilterChange('status', e.target.value)}
    >
      <option value="">All Events</option>
      <option value="upcoming">Upcoming</option>
      <option value="ongoing">Ongoing</option>
      <option value="past">Past</option>
    </select>
  </div>
));

jest.mock('../../../components/events/EventList', () => ({ 
  events, isLoading, onFilterChange, handleEditEvent, handleDeleteEventClick, handleRsvpClick 
}) => (
  <div data-testid="event-list">
    {isLoading ? (
      <div>Loading events...</div>
    ) : events.length > 0 ? (
      events.map(event => (
        <div key={event.id} data-testid={`event-${event.id}`}>
          <h3>{event.name}</h3>
          <button onClick={() => handleEditEvent(event)}>Edit</button>
          <button onClick={() => handleDeleteEventClick(event)}>Delete</button>
          <button onClick={() => handleRsvpClick(event)}>
            {event.isAttending ? 'Cancel RSVP' : 'RSVP'}
          </button>
        </div>
      ))
    ) : (
      <div>No events found</div>
    )}
  </div>
));

jest.mock('../../../components/events/EventModals', () => ({
  CreateEventModal: ({ isOpen, onClose, handleCreateEvent }) => 
    isOpen ? (
      <div data-testid="create-modal">
        <button onClick={handleCreateEvent}>Create</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  EditEventModal: ({ isOpen, onClose, handleUpdateEvent }) => 
    isOpen ? (
      <div data-testid="edit-modal">
        <button onClick={handleUpdateEvent}>Update</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  DeleteEventModal: ({ isOpen, onClose, handleDeleteEvent }) => 
    isOpen ? (
      <div data-testid="delete-modal">
        <button onClick={handleDeleteEvent}>Delete</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  RsvpEventModal: ({ isOpen, onClose, handleRsvp, handleCancelRsvp, isRsvpd, selectedEvent }) => 
    isOpen ? (
      <div data-testid="rsvp-modal">
        <button onClick={isRsvpd(selectedEvent) ? handleCancelRsvp : handleRsvp}>
          {isRsvpd(selectedEvent) ? 'Cancel RSVP' : 'RSVP'}
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

describe('Events', () => {
  const mockEvents = [
    {
      id: 1,
      name: 'Test Event 1',
      location: 'Test Location',
      startTime: '2024-12-01T10:00:00Z',
      endTime: '2024-12-01T12:00:00Z',
      isAttending: false,
    },
    {
      id: 2,
      name: 'Test Event 2',
      location: 'Another Location',
      startTime: '2024-12-02T14:00:00Z',
      endTime: '2024-12-02T16:00:00Z',
      isAttending: true,
    },
  ];

  const mockUseEvents = {
    events: mockEvents,
    totalCount: 2,
    isLoading: false,
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    rsvpToEvent: jest.fn(),
    cancelRsvp: jest.fn(),
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isRsvping: false,
    isCancellingRsvp: false,
    refetch: jest.fn(),
  };

  const renderComponent = (initialEntries = ['/events']) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Events />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    useAuth.mockReturnValue({
      activeRole: 'user',
    });
    useEvents.mockReturnValue(mockUseEvents);
    jest.clearAllMocks();
  });

  it('renders events page with filters and list', () => {
    renderComponent();

    expect(screen.getByTestId('event-filters')).toBeInTheDocument();
    expect(screen.getByTestId('event-list')).toBeInTheDocument();
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
  });

  it('handles search filter', async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Search events');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    await waitFor(() => {
      expect(useEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test search',
        })
      );
    });
  });

  it('handles status filter', () => {
    renderComponent();

    const statusSelect = screen.getByDisplayValue('All Events');
    fireEvent.change(statusSelect, { target: { value: 'upcoming' } });

    expect(useEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        started: false,
      })
    );
  });

  it('shows create button for managers', () => {
    useAuth.mockReturnValue({
      activeRole: 'manager',
    });

    renderComponent();

    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });

  it('opens create modal when create button clicked', () => {
    useAuth.mockReturnValue({
      activeRole: 'manager',
    });

    renderComponent();

    fireEvent.click(screen.getByText('Create Event'));
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });

  it('handles event creation', () => {
    useAuth.mockReturnValue({
      activeRole: 'manager',
    });

    renderComponent();

    fireEvent.click(screen.getByText('Create Event'));
    fireEvent.click(screen.getByText('Create'));

    // Due to validation, the createEvent function should not be invoked
    // when mandatory fields (e.g., startTime/endTime) are missing.
    expect(mockUseEvents.createEvent).not.toHaveBeenCalled();
  });

  it('opens edit modal when edit button clicked', () => {
    useAuth.mockReturnValue({
      activeRole: 'manager',
    });

    renderComponent();

    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('handles event update', () => {
    useAuth.mockReturnValue({
      activeRole: 'manager',
    });

    renderComponent();

    fireEvent.click(screen.getAllByText('Edit')[0]);
    fireEvent.click(screen.getByText('Update'));

    expect(mockUseEvents.updateEvent).toHaveBeenCalled();
  });

  it('opens delete modal when delete button clicked', () => {
    useAuth.mockReturnValue({
      activeRole: 'manager',
    });

    renderComponent();

    fireEvent.click(screen.getAllByText('Delete')[0]);
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
  });

  it('handles event deletion', () => {
    useAuth.mockReturnValue({
      activeRole: 'manager',
    });

    renderComponent();

    fireEvent.click(screen.getAllByText('Delete')[0]);
    fireEvent.click(screen.getByTestId('delete-modal').querySelector('button'));

    expect(mockUseEvents.deleteEvent).toHaveBeenCalled();
  });

  it('opens rsvp modal when rsvp button clicked', () => {
    renderComponent();

    fireEvent.click(screen.getAllByText('RSVP')[0]);
    expect(screen.getByTestId('rsvp-modal')).toBeInTheDocument();
  });

  it('handles rsvp to event', () => {
    renderComponent();

    fireEvent.click(screen.getAllByText('RSVP')[0]);
    fireEvent.click(screen.getByTestId('rsvp-modal').querySelector('button'));

    expect(mockUseEvents.rsvpToEvent).toHaveBeenCalled();
  });

  it('handles cancel rsvp', () => {
    renderComponent();

    fireEvent.click(screen.getAllByText('Cancel RSVP')[0]);
    fireEvent.click(screen.getByTestId('rsvp-modal').querySelector('button'));

    expect(mockUseEvents.cancelRsvp).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    useEvents.mockReturnValue({
      ...mockUseEvents,
      isLoading: true,
      events: [],
    });

    renderComponent();

    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    useEvents.mockReturnValue({
      ...mockUseEvents,
      events: [],
      totalCount: 0,
    });

    renderComponent();

    expect(screen.getByText('No events found')).toBeInTheDocument();
  });

  it('closes modals when close button clicked', () => {
    useAuth.mockReturnValue({
      activeRole: 'manager',
    });

    renderComponent();

    // Test create modal
    fireEvent.click(screen.getByText('Create Event'));
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();

    // Test edit modal
    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
  });

  it('handles different user roles correctly', () => {
    // Test manager role
    useAuth.mockReturnValue({
      activeRole: 'manager',
    });

    renderComponent();

    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });
}); 
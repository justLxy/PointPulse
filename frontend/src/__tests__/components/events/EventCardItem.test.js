import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventCardItem from '../../../components/events/EventCardItem';

// Mock the Auth context
const mockAuthContext = {
  activeRole: 'user',
  currentUser: { id: 1, name: 'Test User' }
};

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock the common components
jest.mock('../../../components/common/Card', () => {
  const Card = ({ children, ...props }) => <div data-testid="card" {...props}>{children}</div>;
  Card.Body = ({ children, ...props }) => <div data-testid="card-body" {...props}>{children}</div>;
  return Card;
});

jest.mock('../../../components/common/Button', () => ({ children, onClick, ...props }) => (
  <button onClick={onClick} data-testid="button" {...props}>{children}</button>
));

jest.mock('../../../components/common/Badge', () => ({ children, color, ...props }) => (
  <span data-testid="badge" data-color={color} {...props}>{children}</span>
));

// Helper function to render component with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock event data
const mockEvent = {
  id: 1,
  name: 'Test Event',
  description: 'This is a test event description',
  location: 'Test Location',
  startTime: '2024-06-01T10:00:00Z',
  endTime: '2024-06-01T12:00:00Z',
  capacity: 100,
  numGuests: 20,
  published: true,
  isOrganizer: false,
  checkedIn: false,
  pointsRemain: 50
};

// Mock utility functions
const mockFormatCompactDate = jest.fn((date) => 'Jun 1');
const mockFormatTime = jest.fn((date) => '10:00 AM');
const mockGetEventCardDate = jest.fn((date) => ({ month: 'JUN', day: '01' }));
const mockGetEventStatus = jest.fn((startTime, endTime) => ({ text: 'Upcoming', color: '#007bff' }));
const mockIsRsvpd = jest.fn((event) => false);
const mockHandleEditEvent = jest.fn();
const mockHandleDeleteEventClick = jest.fn();
const mockHandleRsvpClick = jest.fn();
const mockNavigateToEventDetail = jest.fn();

const defaultProps = {
  event: mockEvent,
  isManager: false,
  formatCompactDate: mockFormatCompactDate,
  formatTime: mockFormatTime,
  getEventCardDate: mockGetEventCardDate,
  getEventStatus: mockGetEventStatus,
  isRsvpd: mockIsRsvpd,
  handleEditEvent: mockHandleEditEvent,
  handleDeleteEventClick: mockHandleDeleteEventClick,
  handleRsvpClick: mockHandleRsvpClick,
  navigateToEventDetail: mockNavigateToEventDetail,
  handleCancelRsvpClick: jest.fn(),
  handleViewDetails: jest.fn(),
  isCreatingRsvp: false,
  isCancelingRsvp: false,
  selectedEventIdForRsvp: null
};

describe('EventCardItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockGetEventCardDate.mockImplementation((date) => ({ month: 'JUN', day: '01' }));
    mockGetEventStatus.mockImplementation((startTime, endTime) => ({ text: 'Upcoming', color: '#007bff' }));
    mockIsRsvpd.mockImplementation((event) => false);
    mockAuthContext.activeRole = 'user';
  });

  it('renders null when event is null or undefined', () => {
    const { container } = renderWithRouter(
      <EventCardItem {...defaultProps} event={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders basic event information correctly', () => {
    renderWithRouter(<EventCardItem {...defaultProps} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('This is a test event description')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('displays event date correctly', () => {
    renderWithRouter(<EventCardItem {...defaultProps} />);
    
    expect(screen.getByText('JUN')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('displays long descriptions (CSS handles truncation)', () => {
    const longDescription = 'A'.repeat(200);
    const eventWithLongDescription = {
      ...mockEvent,
      description: longDescription
    };
    
    renderWithRouter(
      <EventCardItem {...defaultProps} event={eventWithLongDescription} />
    );
    
    // In test environment, CSS truncation might not work, so just check the full text is present
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('displays "Unnamed Event" when event name is missing', () => {
    const eventWithoutName = { ...mockEvent, name: null };
    
    renderWithRouter(
      <EventCardItem {...defaultProps} event={eventWithoutName} />
    );
    
    expect(screen.getByText('Unnamed Event')).toBeInTheDocument();
  });

  it('displays "No location specified" when location is missing', () => {
    const eventWithoutLocation = { ...mockEvent, location: null };
    
    renderWithRouter(
      <EventCardItem {...defaultProps} event={eventWithoutLocation} />
    );
    
    expect(screen.getByText('No location specified')).toBeInTheDocument();
  });

  it('displays event status badge', () => {
    renderWithRouter(<EventCardItem {...defaultProps} />);
    
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('displays RSVP badge when user is RSVP\'d', () => {
    const mockIsRsvpdTrue = jest.fn(() => true);
    
    renderWithRouter(
      <EventCardItem {...defaultProps} isRsvpd={mockIsRsvpdTrue} />
    );
    
    expect(screen.getByText('RSVP\'d')).toBeInTheDocument();
  });

  it('displays checked in badge when user is checked in', () => {
    const mockIsRsvpdTrue = jest.fn(() => true);
    const checkedInEvent = { ...mockEvent, checkedIn: true };
    
    renderWithRouter(
      <EventCardItem 
        {...defaultProps} 
        event={checkedInEvent}
        isRsvpd={mockIsRsvpdTrue} 
      />
    );
    
    expect(screen.getByText('Checked In')).toBeInTheDocument();
  });

  it('displays organizer badge when user is organizer', () => {
    const organizerEvent = { ...mockEvent, isOrganizer: true };
    
    renderWithRouter(
      <EventCardItem {...defaultProps} event={organizerEvent} />
    );
    
    expect(screen.getByText('Organizer')).toBeInTheDocument();
  });

  it('displays published badge for managers when event is published', () => {
    mockAuthContext.activeRole = 'manager';
    
    renderWithRouter(
      <EventCardItem {...defaultProps} isManager={true} />
    );
    
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('displays unpublished badge for managers when event is not published', () => {
    mockAuthContext.activeRole = 'manager';
    const unpublishedEvent = { ...mockEvent, published: false };
    
    renderWithRouter(
      <EventCardItem 
        {...defaultProps} 
        event={unpublishedEvent}
        isManager={true} 
      />
    );
    
    expect(screen.getByText('Unpublished')).toBeInTheDocument();
  });

  it('displays attendee count correctly', () => {
    renderWithRouter(<EventCardItem {...defaultProps} />);
    
    expect(screen.getByText('20 attendees (max: 100)')).toBeInTheDocument();
  });

  it('displays attendee count without capacity when capacity is not set', () => {
    const eventWithoutCapacity = { ...mockEvent, capacity: null };
    
    renderWithRouter(
      <EventCardItem {...defaultProps} event={eventWithoutCapacity} />
    );
    
    expect(screen.getByText('20 attendees')).toBeInTheDocument();
  });

  it('shows points available for manager/superuser roles', () => {
    mockAuthContext.activeRole = 'manager';
    
    renderWithRouter(<EventCardItem {...defaultProps} />);
    
    expect(screen.getByText('50 points available')).toBeInTheDocument();
  });

  it('does not show points for regular users', () => {
    mockAuthContext.activeRole = 'user';
    
    renderWithRouter(<EventCardItem {...defaultProps} />);
    
    expect(screen.queryByText('50 points available')).not.toBeInTheDocument();
  });

  it('displays View Details button and calls navigate function when clicked', () => {
    renderWithRouter(<EventCardItem {...defaultProps} />);
    
    const viewDetailsButton = screen.getByText('View Details');
    expect(viewDetailsButton).toBeInTheDocument();
    
    fireEvent.click(viewDetailsButton);
    expect(mockNavigateToEventDetail).toHaveBeenCalledWith(1);
  });

  it('displays RSVP button for upcoming events when user is not RSVP\'d', () => {
    renderWithRouter(<EventCardItem {...defaultProps} />);
    
    expect(screen.getByText('RSVP')).toBeInTheDocument();
  });

  it('displays Cancel RSVP button when user is RSVP\'d', () => {
    const mockIsRsvpdTrue = jest.fn(() => true);
    
    renderWithRouter(
      <EventCardItem {...defaultProps} isRsvpd={mockIsRsvpdTrue} />
    );
    
    expect(screen.getByText('Cancel RSVP')).toBeInTheDocument();
  });

  it('calls handleRsvpClick when RSVP button is clicked', () => {
    renderWithRouter(<EventCardItem {...defaultProps} />);
    
    const rsvpButton = screen.getByText('RSVP');
    fireEvent.click(rsvpButton);
    
    expect(mockHandleRsvpClick).toHaveBeenCalledWith(mockEvent);
  });

  it('displays edit button for managers and organizers', () => {
    mockAuthContext.activeRole = 'manager';
    
    renderWithRouter(
      <EventCardItem {...defaultProps} isManager={true} />
    );
    
    const editButtons = screen.getAllByTestId('button');
    // The edit button should be the third button (after View Details and RSVP)
    expect(editButtons.length).toBeGreaterThanOrEqual(3);
    // Check that we have an edit button (it contains FaEdit icon so text might be empty)
    const editButton = editButtons[2]; // Index 2 should be edit button
    expect(editButton).toBeInTheDocument();
  });

  it('displays delete button for managers when event is unpublished', () => {
    mockAuthContext.activeRole = 'manager';
    const unpublishedEvent = { ...mockEvent, published: false };
    
    renderWithRouter(
      <EventCardItem 
        {...defaultProps} 
        event={unpublishedEvent}
        isManager={true} 
      />
    );
    
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBe(4); // View Details, RSVP, Edit, Delete
  });

  it('does not display delete button for published events', () => {
    mockAuthContext.activeRole = 'manager';
    
    renderWithRouter(
      <EventCardItem {...defaultProps} isManager={true} />
    );
    
    // Should not have delete button for published events
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBe(3); // View Details, RSVP, Edit (no delete)
  });

  it('calls handleEditEvent when edit button is clicked', () => {
    mockAuthContext.activeRole = 'manager';
    
    renderWithRouter(
      <EventCardItem {...defaultProps} isManager={true} />
    );
    
    const buttons = screen.getAllByTestId('button');
    const editButton = buttons[2]; // Third button should be edit
    expect(editButton).toBeTruthy(); // Make sure button exists
    fireEvent.click(editButton);
    
    expect(mockHandleEditEvent).toHaveBeenCalledWith(mockEvent);
  });

  it('does not show RSVP button when event is at full capacity', () => {
    const fullEvent = { ...mockEvent, numGuests: 100 }; // Same as capacity
    
    renderWithRouter(
      <EventCardItem {...defaultProps} event={fullEvent} />
    );
    
    expect(screen.queryByText('RSVP')).not.toBeInTheDocument();
  });

  it('handles events with missing endTime', () => {
    const eventWithoutEndTime = { ...mockEvent, endTime: null };
    
    renderWithRouter(
      <EventCardItem {...defaultProps} event={eventWithoutEndTime} />
    );
    
    // Should still render without errors
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('uses fallback values for missing numeric properties', () => {
    const eventWithMissingProps = {
      ...mockEvent,
      numGuests: undefined,
      pointsRemain: undefined,
      guests: undefined
    };
    
    mockAuthContext.activeRole = 'manager';
    
    renderWithRouter(
      <EventCardItem {...defaultProps} event={eventWithMissingProps} />
    );
    
    expect(screen.getByText('0 attendees (max: 100)')).toBeInTheDocument();
    expect(screen.getByText('0 points available')).toBeInTheDocument();
  });

  it('hides edit button for ongoing events', () => {
    mockAuthContext.activeRole = 'manager';
    
    // Mock the getEventStatus to return 'Ongoing'
    const mockGetEventStatusOngoing = jest.fn(() => ({ text: 'Ongoing', color: '#ffa500' }));
    
    renderWithRouter(
      <EventCardItem 
        {...defaultProps} 
        isManager={true}
        getEventStatus={mockGetEventStatusOngoing}
      />
    );
    
    // Should not have edit button for ongoing events
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBe(2); // Only View Details and RSVP (no edit button)
  });

  it('hides edit button for past events', () => {
    mockAuthContext.activeRole = 'manager';
    
    // Mock the getEventStatus to return 'Past'
    const mockGetEventStatusPast = jest.fn(() => ({ text: 'Past', color: '#6c757d' }));
    
    renderWithRouter(
      <EventCardItem 
        {...defaultProps} 
        isManager={true}
        getEventStatus={mockGetEventStatusPast}
      />
    );
    
    // For past events, only View Details button should be shown (full width)
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBe(1); // Only View Details button
  });
}); 
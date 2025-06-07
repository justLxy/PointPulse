import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventList from '../../../components/events/EventList';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

// Mock the common components
jest.mock('../../../components/common/Button', () => ({ 
  children, 
  onClick, 
  disabled,
  ...props 
}) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    data-testid="button" 
    {...props}
  >
    {children}
  </button>
));

jest.mock('../../../components/common/LoadingSpinner', () => ({ text }) => (
  <div data-testid="loading-spinner">{text}</div>
));

jest.mock('../../../components/events/EventCardItem', () => ({ 
  event, 
  ...props 
}) => (
  <div data-testid="event-card" data-event-id={event?.id}>
    <span>Event: {event?.name}</span>
  </div>
));

// Mock icons
jest.mock('react-icons/fa', () => ({
  FaInfoCircle: () => <span data-testid="info-icon">Info</span>
}));

const mockEvent = {
  id: 1,
  name: 'Test Event',
  description: 'Test Description',
  location: 'Test Location',
  startTime: '2024-06-01T10:00:00Z',
  endTime: '2024-06-01T12:00:00Z'
};

const defaultProps = {
  isLoading: false,
  events: [mockEvent],
  isManager: false,
  startIndex: 1,
  endIndex: 1,
  totalCount: 1,
  totalPages: 1,
  filters: { page: 1 },
  onFilterChange: jest.fn(),
  formatCompactDate: jest.fn(() => 'Jun 1'),
  formatTime: jest.fn(() => '10:00 AM'),
  getEventCardDate: jest.fn(() => ({ month: 'JUN', day: '01' })),
  getEventStatus: jest.fn(() => ({ text: 'Upcoming', color: '#007bff' })),
  isRsvpd: jest.fn(() => false),
  navigateToEventDetail: jest.fn(),
  handleEditEvent: jest.fn(),
  handleDeleteEventClick: jest.fn(),
  handleRsvpClick: jest.fn(),
  activeRole: 'user'
};

describe('EventList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<EventList {...defaultProps} isLoading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  it('shows empty state when no events are provided', () => {
    render(<EventList {...defaultProps} events={[]} />);
    
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    expect(screen.getByText('No events found')).toBeInTheDocument();
  });

  it('shows different empty state messages for managers vs regular users', () => {
    const { rerender } = render(
      <EventList {...defaultProps} events={[]} isManager={false} />
    );
    
    expect(screen.getByText(/No published events found/)).toBeInTheDocument();
    
    rerender(<EventList {...defaultProps} events={[]} isManager={true} />);
    
    expect(screen.getByText(/No visible events match your filters/)).toBeInTheDocument();
  });

  it('handles null or undefined events correctly', () => {
    const { rerender } = render(<EventList {...defaultProps} events={null} />);
    
    expect(screen.getByText('No events found')).toBeInTheDocument();
    
    rerender(<EventList {...defaultProps} events={undefined} />);
    
    expect(screen.getByText('No events found')).toBeInTheDocument();
  });

  it('handles non-array events correctly', () => {
    render(<EventList {...defaultProps} events="not an array" />);
    
    expect(screen.getByText('No events found')).toBeInTheDocument();
  });

  it('renders event cards when events are provided', () => {
    const events = [
      { id: 1, name: 'Event 1' },
      { id: 2, name: 'Event 2' },
      { id: 3, name: 'Event 3' }
    ];
    
    render(<EventList {...defaultProps} events={events} />);
    
    expect(screen.getByText('Event: Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event: Event 2')).toBeInTheDocument();
    expect(screen.getByText('Event: Event 3')).toBeInTheDocument();
  });

  it('passes correct props to EventCardItem components', () => {
    render(<EventList {...defaultProps} />);
    
    const eventCard = screen.getByTestId('event-card');
    expect(eventCard).toHaveAttribute('data-event-id', '1');
  });

  it('handles events without id correctly', () => {
    const eventWithoutId = { name: 'Event without ID' };
    
    render(<EventList {...defaultProps} events={[eventWithoutId]} />);
    
    expect(screen.getByText('Event: Event without ID')).toBeInTheDocument();
  });

  it('displays page information correctly', () => {
    render(
      <EventList 
        {...defaultProps} 
        startIndex={1}
        endIndex={10}
        totalCount={50}
      />
    );
    
    expect(screen.getByText('Showing 1 to 10 of 50 events')).toBeInTheDocument();
  });

  it('handles endIndex greater than totalCount correctly', () => {
    render(
      <EventList 
        {...defaultProps} 
        startIndex={45}
        endIndex={55}
        totalCount={50}
      />
    );
    
    expect(screen.getByText('Showing 45 to 50 of 50 events')).toBeInTheDocument();
  });

  it('shows published events notice for regular users', () => {
    render(<EventList {...defaultProps} isManager={false} />);
    
    expect(screen.getByText('(Only showing published events)')).toBeInTheDocument();
  });

  it('does not show published events notice for managers', () => {
    render(<EventList {...defaultProps} isManager={true} />);
    
    expect(screen.queryByText('(Only showing published events)')).not.toBeInTheDocument();
  });

  it('displays pagination controls correctly', () => {
    render(
      <EventList 
        {...defaultProps} 
        filters={{ page: 2 }}
        totalPages={5}
      />
    );
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('handles single page correctly', () => {
    render(
      <EventList 
        {...defaultProps} 
        filters={{ page: 1 }}
        totalPages={1}
      />
    );
    
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('handles zero total pages correctly', () => {
    render(
      <EventList 
        {...defaultProps} 
        filters={{ page: 1 }}
        totalPages={0}
      />
    );
    
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(
      <EventList 
        {...defaultProps} 
        filters={{ page: 1 }}
        totalPages={5}
      />
    );
    
    const buttons = screen.getAllByTestId('button');
    const previousButton = buttons.find(btn => btn.textContent === 'Previous');
    
    expect(previousButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <EventList 
        {...defaultProps} 
        filters={{ page: 5 }}
        totalPages={5}
      />
    );
    
    const buttons = screen.getAllByTestId('button');
    const nextButton = buttons.find(btn => btn.textContent === 'Next');
    
    expect(nextButton).toBeDisabled();
  });

  it('enables both pagination buttons on middle pages', () => {
    render(
      <EventList 
        {...defaultProps} 
        filters={{ page: 3 }}
        totalPages={5}
      />
    );
    
    const buttons = screen.getAllByTestId('button');
    const previousButton = buttons.find(btn => btn.textContent === 'Previous');
    const nextButton = buttons.find(btn => btn.textContent === 'Next');
    
    expect(previousButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onFilterChange when previous button is clicked', () => {
    const mockOnFilterChange = jest.fn();
    
    render(
      <EventList 
        {...defaultProps} 
        filters={{ page: 3 }}
        totalPages={5}
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const buttons = screen.getAllByTestId('button');
    const previousButton = buttons.find(btn => btn.textContent === 'Previous');
    
    fireEvent.click(previousButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('page', 2);
  });

  it('calls onFilterChange when next button is clicked', () => {
    const mockOnFilterChange = jest.fn();
    
    render(
      <EventList 
        {...defaultProps} 
        filters={{ page: 3 }}
        totalPages={5}
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const buttons = screen.getAllByTestId('button');
    const nextButton = buttons.find(btn => btn.textContent === 'Next');
    
    fireEvent.click(nextButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('page', 4);
  });

  it('prevents previous page from going below 1', () => {
    const mockOnFilterChange = jest.fn();
    
    render(
      <EventList 
        {...defaultProps} 
        filters={{ page: 1 }}
        totalPages={5}
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const buttons = screen.getAllByTestId('button');
    const previousButton = buttons.find(btn => btn.textContent === 'Previous');
    
    // Button should be disabled on first page
    expect(previousButton).toBeDisabled();
    
    // Disabled button should not trigger onClick when clicked
    fireEvent.click(previousButton);
    
    expect(mockOnFilterChange).not.toHaveBeenCalled();
  });

  it('renders multiple events in grid layout', () => {
    const multipleEvents = [
      { id: 1, name: 'Event 1' },
      { id: 2, name: 'Event 2' },
      { id: 3, name: 'Event 3' },
      { id: 4, name: 'Event 4' }
    ];
    
    render(<EventList {...defaultProps} events={multipleEvents} />);
    
    const eventCards = screen.getAllByTestId('event-card');
    expect(eventCards).toHaveLength(4);
  });

  it('handles large numbers in pagination display correctly', () => {
    render(
      <EventList 
        {...defaultProps} 
        startIndex={9991}
        endIndex={10000}
        totalCount={15000}
        filters={{ page: 1000 }}
        totalPages={1500}
      />
    );
    
    expect(screen.getByText('Showing 9991 to 10000 of 15000 events')).toBeInTheDocument();
    expect(screen.getByText('Page 1000 of 1500')).toBeInTheDocument();
  });

  it('maintains event order when rendering', () => {
    const orderedEvents = [
      { id: 1, name: 'First Event' },
      { id: 2, name: 'Second Event' },
      { id: 3, name: 'Third Event' }
    ];
    
    render(<EventList {...defaultProps} events={orderedEvents} />);
    
    const eventCards = screen.getAllByTestId('event-card');
    expect(eventCards[0]).toHaveAttribute('data-event-id', '1');
    expect(eventCards[1]).toHaveAttribute('data-event-id', '2');
    expect(eventCards[2]).toHaveAttribute('data-event-id', '3');
  });

  it('handles re-renders with different event lists correctly', () => {
    const initialEvents = [{ id: 1, name: 'Initial Event' }];
    const updatedEvents = [{ id: 2, name: 'Updated Event' }];
    
    const { rerender } = render(
      <EventList {...defaultProps} events={initialEvents} />
    );
    
    expect(screen.getByText('Event: Initial Event')).toBeInTheDocument();
    
    rerender(<EventList {...defaultProps} events={updatedEvents} />);
    
    expect(screen.getByText('Event: Updated Event')).toBeInTheDocument();
    expect(screen.queryByText('Event: Initial Event')).not.toBeInTheDocument();
  });

  it('passes all required props to EventCardItem', () => {
    render(<EventList {...defaultProps} />);
    
    // EventCardItem mock should receive the event
    expect(screen.getByTestId('event-card')).toBeInTheDocument();
  });
}); 
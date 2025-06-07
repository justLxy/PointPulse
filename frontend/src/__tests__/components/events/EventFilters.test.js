import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventFilters from '../../../components/events/EventFilters';

// Mock the common components
jest.mock('../../../components/common/Input', () => ({ 
  value, 
  onChange, 
  placeholder, 
  leftIcon, 
  ...props 
}) => (
  <div data-testid="input-container">
    {leftIcon && <span data-testid="input-icon">{leftIcon}</span>}
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  </div>
));

jest.mock('../../../components/common/Button', () => ({ 
  children, 
  onClick, 
  ...props 
}) => (
  <button onClick={onClick} data-testid="button" {...props}>
    {children}
  </button>
));

jest.mock('../../../components/common/Select', () => ({ 
  children, 
  value, 
  onChange, 
  placeholder, 
  ...props 
}) => (
  <select 
    data-testid="select" 
    value={value || ''} 
    onChange={onChange} 
    {...props}
  >
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {children}
  </select>
));

// Mock icons
jest.mock('react-icons/fa', () => ({
  FaPlus: () => <span data-testid="plus-icon">Plus</span>,
  FaSearch: () => <span data-testid="search-icon">Search</span>,
  FaMapMarkerAlt: () => <span data-testid="location-icon">Location</span>
}));

const defaultFilters = {
  name: '',
  location: '',
  status: '',
  publishedStatus: '',
  capacityStatus: 'available'
};

const defaultProps = {
  isManager: false,
  filters: defaultFilters,
  onFilterChange: jest.fn(),
  onCreateClick: jest.fn()
};

describe('EventFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title correctly', () => {
    render(<EventFilters {...defaultProps} />);
    
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('shows create button only for managers', () => {
    const { rerender } = render(<EventFilters {...defaultProps} />);
    
    // Regular user should not see create button
    expect(screen.queryByText('Create Event')).not.toBeInTheDocument();
    
    // Manager should see create button
    rerender(<EventFilters {...defaultProps} isManager={true} />);
    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });

  it('calls onCreateClick when create button is clicked', () => {
    const mockOnCreateClick = jest.fn();
    
    render(
      <EventFilters 
        {...defaultProps} 
        isManager={true} 
        onCreateClick={mockOnCreateClick} 
      />
    );
    
    const createButton = screen.getByText('Create Event');
    fireEvent.click(createButton);
    
    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it('renders all filter inputs', () => {
    render(<EventFilters {...defaultProps} />);
    
    // Name search input
    const nameInput = screen.getByPlaceholderText('Search by name');
    expect(nameInput).toBeInTheDocument();
    
    // Location search input
    const locationInput = screen.getByPlaceholderText('Search by location');
    expect(locationInput).toBeInTheDocument();
    
    // Status select options
    expect(screen.getByText('All Events')).toBeInTheDocument();
    expect(screen.getByText('Event Status')).toBeInTheDocument();
    
    // Capacity select options
    expect(screen.getByText('Available Only')).toBeInTheDocument();
    expect(screen.getByText('Capacity')).toBeInTheDocument();
  });

  it('displays filter icons correctly', () => {
    render(<EventFilters {...defaultProps} isManager={true} />);
    
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('location-icon')).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('shows published status filter only for managers', () => {
    const { rerender } = render(<EventFilters {...defaultProps} />);
    
    // Regular user should not see published status filter
    expect(screen.queryByText('All Visibility')).not.toBeInTheDocument();
    
    // Manager should see published status filter
    rerender(<EventFilters {...defaultProps} isManager={true} />);
    expect(screen.getByText('All Visibility')).toBeInTheDocument();
  });

  it('handles name filter changes correctly', () => {
    const mockOnFilterChange = jest.fn();
    
    render(
      <EventFilters 
        {...defaultProps} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    const nameInput = screen.getByPlaceholderText('Search by name');
    fireEvent.change(nameInput, { target: { value: 'test event' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('name', 'test event');
  });

  it('handles location filter changes correctly', () => {
    const mockOnFilterChange = jest.fn();
    
    render(
      <EventFilters 
        {...defaultProps} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    const locationInput = screen.getByPlaceholderText('Search by location');
    fireEvent.change(locationInput, { target: { value: 'test location' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('location', 'test location');
  });

  it('handles status filter changes correctly', () => {
    const mockOnFilterChange = jest.fn();
    
    render(
      <EventFilters 
        {...defaultProps} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    const statusSelects = screen.getAllByTestId('select');
    const statusSelect = statusSelects[0]; // First select should be status
    fireEvent.change(statusSelect, { target: { value: 'upcoming' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('status', 'upcoming');
  });

  it('handles published status filter changes for managers', () => {
    const mockOnFilterChange = jest.fn();
    
    render(
      <EventFilters 
        {...defaultProps} 
        isManager={true}
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    const selects = screen.getAllByTestId('select');
    const publishedStatusSelect = selects[1]; // Second select should be published status
    fireEvent.change(publishedStatusSelect, { target: { value: 'published' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('publishedStatus', 'published');
  });

  it('handles capacity status filter changes correctly', () => {
    const mockOnFilterChange = jest.fn();
    
    render(
      <EventFilters 
        {...defaultProps} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    const selects = screen.getAllByTestId('select');
    const capacitySelect = selects[selects.length - 1]; // Last select should be capacity
    fireEvent.change(capacitySelect, { target: { value: 'all' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('capacityStatus', 'all');
  });

  it('displays current filter values correctly', () => {
    const filtersWithValues = {
      name: 'Test Event',
      location: 'Test Location',
      status: 'upcoming',
      publishedStatus: 'published',
      capacityStatus: 'all'
    };
    
    render(
      <EventFilters 
        {...defaultProps} 
        isManager={true}
        filters={filtersWithValues} 
      />
    );
    
    expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Location')).toBeInTheDocument();
    
    // Check select values by finding the select elements and checking their values
    const selects = screen.getAllByTestId('select');
    expect(selects[0]).toHaveValue('upcoming'); // Status select
    expect(selects[1]).toHaveValue('published'); // Published status select
    expect(selects[2]).toHaveValue('all'); // Capacity select
  });

  it('renders all status options correctly', () => {
    render(<EventFilters {...defaultProps} />);
    
    expect(screen.getByText('All Events')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    expect(screen.getByText('Ongoing Events')).toBeInTheDocument();
    expect(screen.getByText('Past Events')).toBeInTheDocument();
    expect(screen.getByText('My RSVPs')).toBeInTheDocument();
    expect(screen.getByText('My Organized Events')).toBeInTheDocument();
  });

  it('renders all published status options for managers', () => {
    render(<EventFilters {...defaultProps} isManager={true} />);
    
    expect(screen.getByText('All Visibility')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Unpublished')).toBeInTheDocument();
  });

  it('renders all capacity status options correctly', () => {
    render(<EventFilters {...defaultProps} />);
    
    expect(screen.getByText('Available Only')).toBeInTheDocument();
    expect(screen.getByText('Show Full Events')).toBeInTheDocument();
  });

  it('applies correct filter container styling', () => {
    const { container } = render(<EventFilters {...defaultProps} />);
    
    // The filter container should exist
    const filterContainer = container.querySelector('div[data-testid]')?.parentElement;
    expect(filterContainer).toBeInTheDocument();
  });

  it('handles empty filter values correctly', () => {
    const emptyFilters = {
      name: '',
      location: '',
      status: '',
      publishedStatus: '',
      capacityStatus: ''
    };
    
    render(
      <EventFilters 
        {...defaultProps} 
        isManager={true}
        filters={emptyFilters} 
      />
    );
    
    // Should render without errors
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('maintains filter state during re-renders', () => {
    const { rerender } = render(<EventFilters {...defaultProps} />);
    
    const nameInput = screen.getByPlaceholderText('Search by name');
    expect(nameInput.value).toBe('');
    
    const updatedFilters = { ...defaultFilters, name: 'Updated Event' };
    rerender(
      <EventFilters 
        {...defaultProps} 
        filters={updatedFilters} 
      />
    );
    
    expect(screen.getByDisplayValue('Updated Event')).toBeInTheDocument();
  });

  it('handles manager prop changes correctly', () => {
    const { rerender } = render(<EventFilters {...defaultProps} isManager={false} />);
    
    // Should not show manager elements
    expect(screen.queryByText('Create Event')).not.toBeInTheDocument();
    expect(screen.queryByText('All Visibility')).not.toBeInTheDocument();
    
    // Switch to manager
    rerender(<EventFilters {...defaultProps} isManager={true} />);
    
    // Should show manager elements
    expect(screen.getByText('Create Event')).toBeInTheDocument();
    expect(screen.getByText('All Visibility')).toBeInTheDocument();
  });
}); 
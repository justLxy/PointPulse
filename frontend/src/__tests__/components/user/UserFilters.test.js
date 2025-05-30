import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserFilters from '../../../components/user/UserFilters';

describe('UserFilters Component', () => {
  const defaultProps = {
    isSuperuser: false,
    isManager: false,
    filters: {
      search: '',
      role: '',
      verified: '',
      active: ''
    },
    onFilterChange: jest.fn(),
    onCreateClick: jest.fn()
  };

  it('renders all elements correctly', () => {
    render(<UserFilters {...defaultProps} />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name or utorid')).toBeInTheDocument();
    expect(screen.getByText('All Roles')).toBeInTheDocument();
    expect(screen.getByText('All Verification')).toBeInTheDocument();
    expect(screen.getByText('All Activity')).toBeInTheDocument();
  });

  it('shows create button when user has permission', () => {
    render(<UserFilters {...defaultProps} isSuperuser={true} />);
    expect(screen.getByText('Create User')).toBeInTheDocument();
  });

  it('hides create button when user has no permission', () => {
    render(<UserFilters {...defaultProps} />);
    expect(screen.queryByText('Create User')).not.toBeInTheDocument();
  });

  it('triggers onFilterChange callback when search input changes', () => {
    const onFilterChange = jest.fn();
    render(<UserFilters {...defaultProps} onFilterChange={onFilterChange} />);
    
    const searchInput = screen.getByPlaceholderText('Search by name or utorid');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(onFilterChange).toHaveBeenCalledWith('search', 'test');
  });

  it('triggers onFilterChange callback when role select changes', () => {
    const onFilterChange = jest.fn();
    render(<UserFilters {...defaultProps} onFilterChange={onFilterChange} />);
    
    const roleSelect = screen.getByText('All Roles').closest('select');
    fireEvent.change(roleSelect, { target: { value: 'manager' } });
    
    expect(onFilterChange).toHaveBeenCalledWith('role', 'manager');
  });

  it('triggers onFilterChange callback when verification select changes', () => {
    const onFilterChange = jest.fn();
    render(<UserFilters {...defaultProps} onFilterChange={onFilterChange} />);
    
    const verifiedSelect = screen.getByText('All Verification').closest('select');
    fireEvent.change(verifiedSelect, { target: { value: 'verified' } });
    
    expect(onFilterChange).toHaveBeenCalledWith('verified', 'verified');
  });

  it('triggers onFilterChange callback when activity select changes', () => {
    const onFilterChange = jest.fn();
    render(<UserFilters {...defaultProps} onFilterChange={onFilterChange} />);
    
    const activeSelect = screen.getByText('All Activity').closest('select');
    fireEvent.change(activeSelect, { target: { value: 'active' } });
    
    expect(onFilterChange).toHaveBeenCalledWith('active', 'active');
  });

  it('triggers onCreateClick callback when create button is clicked', () => {
    const onCreateClick = jest.fn();
    render(<UserFilters {...defaultProps} isSuperuser={true} onCreateClick={onCreateClick} />);
    
    const createButton = screen.getByText('Create User');
    fireEvent.click(createButton);
    
    expect(onCreateClick).toHaveBeenCalled();
  });

  it('displays initial filter values correctly', () => {
    const initialFilters = {
      search: 'test',
      role: 'cashier',
      verified: 'verified',
      active: 'inactive'
    };
    
    render(<UserFilters {...defaultProps} filters={initialFilters} />);
    
    // Verify input and select values
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cashier', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Verified', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Inactive', selected: true })).toBeInTheDocument();
  });

  it('adjusts layout correctly on small screens', () => {
    // Mock small screen environment
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    render(<UserFilters {...defaultProps} isSuperuser={true} />);
    
    // Verify elements are in correct container
    const header = screen.getByText('User Management').parentElement;
    const createButton = screen.getByText('Create User');
    
    // Verify element hierarchy
    expect(header).toContainElement(createButton);
  });
});
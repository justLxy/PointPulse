/**
 * Core User Flow: Data table interactions including sorting, pagination, and row actions
 * Validates essential table functionality for data management workflows
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Table from '../../../components/common/Table';

// Mock theme module
jest.mock('../../../styles/theme', () => ({
  colors: {
    primary: { main: '#007bff', dark: '#0056b3', contrastText: '#ffffff' },
    background: { paper: '#ffffff', default: '#f8f9fa' },
    text: { primary: '#212529', secondary: '#6c757d' },
    border: { light: '#e9ecef', main: '#dee2e6' }
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  radius: { sm: '4px', md: '8px' },
  shadows: { sm: '0 1px 3px rgba(0,0,0,0.12)' },
  typography: {
    fontSize: { sm: '14px' },
    fontWeights: { regular: 400, medium: 500, semiBold: 600 }
  }
}));

jest.mock('react-icons/bs', () => ({
  BsArrowUp: () => <span data-testid="arrow-up">↑</span>,
  BsArrowDown: () => <span data-testid="arrow-down">↓</span>
}));

describe('Table - Essential Data Management', () => {
  const sampleColumns = [
    { key: 'id', title: 'ID', sortable: true },
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email' },
    { 
      key: 'actions', 
      title: 'Actions', 
      render: (row) => <button data-testid={`edit-${row.id}`}>Edit</button>
    }
  ];

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  ];

  test('displays data and handles sorting interactions', async () => {
    const onSort = jest.fn();
    
    render(
      <Table 
        columns={sampleColumns} 
        data={sampleData} 
        onSort={onSort}
        sortColumn="name"
        sortDirection="asc"
      />
    );

    // Verify data display
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('edit-1')).toBeInTheDocument();

    // Verify sorting visual indicator
    expect(screen.getByTestId('arrow-up')).toBeInTheDocument();

    // Test sorting interaction
    await userEvent.click(screen.getByText('Name'));
    expect(onSort).toHaveBeenCalledWith('name', 'desc');

    // Test sorting on different column
    await userEvent.click(screen.getByText('ID'));
    expect(onSort).toHaveBeenCalledWith('id', 'asc');
  });

  test('handles pagination workflow correctly', async () => {
    const onPageChange = jest.fn();
    const pagination = {
      page: 2,
      totalItems: 25,
      limit: 10,
      onPageChange
    };

    render(
      <Table 
        columns={sampleColumns} 
        data={sampleData} 
        pagination={pagination}
      />
    );

    // Verify pagination info display
    expect(screen.getByText('Showing 11-20 of 25 items')).toBeInTheDocument();

    // Test page navigation
    await userEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await userEvent.click(screen.getByText('Prev'));
    expect(onPageChange).toHaveBeenCalledWith(1);

    // Test direct page navigation
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  test('handles row interactions and empty states', async () => {
    const onRowClick = jest.fn();

    const { rerender } = render(
      <Table 
        columns={sampleColumns} 
        data={sampleData} 
        onRowClick={onRowClick}
      />
    );

    // Test row click
    const firstRow = screen.getByText('John Doe').closest('tr');
    await userEvent.click(firstRow);
    expect(onRowClick).toHaveBeenCalledWith(sampleData[0]);

    // Test empty state
    rerender(
      <Table 
        columns={sampleColumns} 
        data={[]} 
        emptyMessage="No users found"
      />
    );

    expect(screen.getByText('No users found')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  test('gracefully handles missing data', () => {
    const incompleteData = [
      { id: 1, name: 'John Doe' }, // missing email
      { id: 2, email: 'jane@example.com' } // missing name
    ];

    // Should not throw when data properties are missing
    expect(() => {
      render(<Table columns={sampleColumns} data={incompleteData} />);
    }).not.toThrow();

    // Verify data is still displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  test('handles non-sortable column interactions', () => {
    const onSort = jest.fn();
    
    render(<Table columns={sampleColumns} data={sampleData} onSort={onSort} />);
    
    // Email column is not sortable - get the header specifically
    const emailHeader = screen.getByRole('columnheader', { name: 'Email' });
    userEvent.click(emailHeader);
    expect(onSort).not.toHaveBeenCalled();
  });
}); 
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from '../DataTable';

const mockData = [
  { id: 1, name: 'Item 1', status: 'Active', value: 100 },
  { id: 2, name: 'Item 2', status: 'Inactive', value: 200 },
  { id: 3, name: 'Item 3', status: 'Active', value: 150 },
];

const mockColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'value', label: 'Value', sortable: true },
];

describe('DataTable Component', () => {
  it('renders table with data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(
      <DataTable columns={mockColumns} data={[]} emptyMessage="No data found" />
    );
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders table title when provided', () => {
    render(
      <DataTable columns={mockColumns} data={mockData} title="Test Table" />
    );
    expect(screen.getByText('Test Table')).toBeInTheDocument();
  });

  it('handles sorting by column', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    // After first click, should be sorted ascending
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Item 1'); // First row after header
  });

  it('toggles sort direction', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    const nameHeader = screen.getByText('Name');

    // First click: ascending
    fireEvent.click(nameHeader);
    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Item 1');

    // Second click: descending
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Item 3');
  });

  it('paginates data correctly', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      name: `Item ${i + 1}`,
      status: 'Active',
      value: (i + 1) * 100,
    }));

    render(
      <DataTable columns={mockColumns} data={largeData} rowsPerPage={10} />
    );

    // First page should show items 1-10
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 10')).toBeInTheDocument();
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument();
  });

  it('handles row click callback', () => {
    const handleRowClick = jest.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onRowClick={handleRowClick}
      />
    );

    const row = screen.getByText('Item 1').closest('tr');
    fireEvent.click(row!);
    expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('renders custom column with render function', () => {
    const columnsWithRender = [
      {
        key: 'status',
        label: 'Status',
        render: (value: string) => <span className="status-badge">{value}</span>,
      },
    ];

    render(
      <DataTable
        columns={columnsWithRender}
        data={[{ id: 1, status: 'Active' }]}
      />
    );

    expect(screen.getByText('Active')).toHaveClass('status-badge');
  });

  it('handles row selection when selectable is true', () => {
    render(
      <DataTable columns={mockColumns} data={mockData} selectable={true} />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // First checkbox is "select all", rest are row checkboxes
    expect(checkboxes.length).toBe(4); // 1 select all + 3 rows
  });

  it('applies different variants', () => {
    const { container, rerender } = render(
      <DataTable columns={mockColumns} data={mockData} variant="default" />
    );
    let table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    rerender(
      <DataTable columns={mockColumns} data={mockData} variant="striped" />
    );
    table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  it('displays pagination info', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      name: `Item ${i + 1}`,
      status: 'Active',
      value: (i + 1) * 100,
    }));

    render(
      <DataTable columns={mockColumns} data={largeData} rowsPerPage={10} />
    );

    // Should show "1-10 / 25" or similar
    expect(screen.getByText(/1-10 \/ 25/)).toBeInTheDocument();
  });

  it('handles page navigation', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      name: `Item ${i + 1}`,
      status: 'Active',
      value: (i + 1) * 100,
    }));

    render(
      <DataTable columns={mockColumns} data={largeData} rowsPerPage={10} />
    );

    // Click next button
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);

    // Should now show items 11-20
    expect(screen.getByText('Item 11')).toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });
});

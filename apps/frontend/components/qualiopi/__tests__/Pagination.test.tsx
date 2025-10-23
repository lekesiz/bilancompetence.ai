import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it('does not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders pagination controls when totalPages > 1', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays previous and next buttons', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when previous button is clicked', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    const prevButton = screen.getByLabelText('Previous page');
    fireEvent.click(prevButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when next button is clicked', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when specific page is clicked', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    const page3Button = screen.getByText('3');
    fireEvent.click(page3Button);
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('highlights current page', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    const currentPageButton = screen.getByText('2').closest('button');
    expect(currentPageButton).toHaveClass('bg-blue-600', 'text-white');
  });

  it('shows ellipsis for many pages', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );
    const ellipsis = screen.getByText('...');
    expect(ellipsis).toBeInTheDocument();
  });

  it('displays item count in detailed variant', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
        variant="detailed"
        totalItems={50}
        rowsPerPage={10}
      />
    );
    expect(screen.getByText(/1-10 \/ 50/)).toBeInTheDocument();
  });

  it('displays item count for current page in detailed variant', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
        variant="detailed"
        totalItems={50}
        rowsPerPage={10}
      />
    );
    expect(screen.getByText(/11-20 \/ 50/)).toBeInTheDocument();
  });

  it('does not display item count in basic variant', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
        variant="basic"
        totalItems={50}
      />
    );
    expect(container.textContent).not.toMatch(/\d+-\d+ \/ \d+/);
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    const currentPageButton = screen.getByText('2').closest('button');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('handles edge cases correctly', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={2}
        onPageChange={mockOnPageChange}
      />
    );
    // Should show pages 1 and 2
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

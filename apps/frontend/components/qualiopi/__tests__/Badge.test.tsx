import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Badge from '../Badge';

describe('Badge Component', () => {
  it('renders badge with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    const { container } = render(<Badge>Primary</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('applies success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('applies warning variant', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('applies danger variant', () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('applies info variant', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-cyan-100', 'text-cyan-800');
  });

  it('applies gray variant', () => {
    const { container } = render(<Badge variant="gray">Gray</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('applies size variants', () => {
    const { rerender, container } = render(<Badge size="sm">Small</Badge>);
    let badge = container.firstChild;
    expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');

    rerender(<Badge size="md">Medium</Badge>);
    badge = container.firstChild;
    expect(badge).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<Badge size="lg">Large</Badge>);
    badge = container.firstChild;
    expect(badge).toHaveClass('px-4', 'py-2', 'text-base');
  });

  it('renders with icon', () => {
    render(<Badge icon="✓">Approved</Badge>);
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('shows dismiss button when dismissible is true', () => {
    render(<Badge dismissible={true}>Dismissible</Badge>);
    const dismissButton = screen.getByLabelText('Remove badge');
    expect(dismissButton).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const handleDismiss = jest.fn();
    render(
      <Badge dismissible={true} onDismiss={handleDismiss}>
        Dismissible
      </Badge>
    );
    const dismissButton = screen.getByLabelText('Remove badge');
    fireEvent.click(dismissButton);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('has proper role and aria-label for accessibility', () => {
    const { container } = render(<Badge>Test Badge</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveAttribute('role', 'status');
  });
});

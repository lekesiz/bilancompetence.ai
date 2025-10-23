import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('renders COMPLIANT status', () => {
    render(<StatusBadge status="COMPLIANT" />);
    expect(screen.getByText('Uyumlu')).toBeInTheDocument();
  });

  it('renders MISSING status', () => {
    render(<StatusBadge status="MISSING" />);
    expect(screen.getByText('Eksik')).toBeInTheDocument();
  });

  it('renders UNDER_REVIEW status', () => {
    render(<StatusBadge status="UNDER_REVIEW" />);
    expect(screen.getByText('İnceleme Altında')).toBeInTheDocument();
  });

  it('applies correct color for COMPLIANT status', () => {
    const { container } = render(<StatusBadge status="COMPLIANT" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('applies correct color for MISSING status', () => {
    const { container } = render(<StatusBadge status="MISSING" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('applies correct color for UNDER_REVIEW status', () => {
    const { container } = render(<StatusBadge status="UNDER_REVIEW" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('applies small size variant', () => {
    const { container } = render(<StatusBadge status="COMPLIANT" size="sm" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');
  });

  it('applies medium size variant', () => {
    const { container } = render(<StatusBadge status="COMPLIANT" size="md" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });

  it('applies large size variant', () => {
    const { container } = render(<StatusBadge status="COMPLIANT" size="lg" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('px-4', 'py-2', 'text-base');
  });

  it('applies badge variant', () => {
    const { container } = render(
      <StatusBadge status="COMPLIANT" variant="badge" />
    );
    const badge = container.firstChild;
    expect(badge).toHaveClass('rounded-full');
  });

  it('applies pill variant', () => {
    const { container } = render(
      <StatusBadge status="COMPLIANT" variant="pill" />
    );
    const badge = container.firstChild;
    expect(badge).toBeInTheDocument();
  });

  it('applies solid variant', () => {
    const { container } = render(
      <StatusBadge status="COMPLIANT" variant="solid" />
    );
    const badge = container.firstChild;
    expect(badge).toBeInTheDocument();
  });

  it('displays icon for status', () => {
    const { rerender } = render(<StatusBadge status="COMPLIANT" />);
    expect(screen.getByText('✅')).toBeInTheDocument();

    rerender(<StatusBadge status="MISSING" />);
    expect(screen.getByText('❌')).toBeInTheDocument();

    rerender(<StatusBadge status="UNDER_REVIEW" />);
    expect(screen.getByText('🔄')).toBeInTheDocument();
  });

  it('has proper accessibility role', () => {
    const { container } = render(<StatusBadge status="COMPLIANT" />);
    const badge = container.firstChild;
    expect(badge).toHaveAttribute('role', 'status');
  });

  it('combines all properties correctly', () => {
    render(
      <StatusBadge
        status="COMPLIANT"
        size="lg"
        variant="solid"
      />
    );
    const badge = screen.getByText('COMPLIANT').closest('div');
    expect(badge).toHaveClass('px-4', 'py-2', 'text-base');
    expect(badge).toHaveClass('bg-green-100');
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MetricCard from '../MetricCard';

describe('MetricCard Component', () => {
  it('renders title and value', () => {
    render(
      <MetricCard title="Total Users" value={1234} />
    );
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <MetricCard title="Active" value={45} icon="👥" />
    );
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <MetricCard title="Revenue" value="$50K" subtitle="This month" />
    );
    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('applies green variant', () => {
    const { container } = render(
      <MetricCard title="Success" value={100} variant="green" />
    );
    const card = container.querySelector('.bg-gradient-to-br');
    expect(card?.className).toMatch(/from-green-50/);
  });

  it('applies blue variant', () => {
    const { container } = render(
      <MetricCard title="Info" value={50} variant="blue" />
    );
    const card = container.querySelector('.bg-gradient-to-br');
    expect(card?.className).toMatch(/from-blue-50/);
  });

  it('applies yellow variant', () => {
    const { container } = render(
      <MetricCard title="Warning" value={20} variant="yellow" />
    );
    const card = container.querySelector('.bg-gradient-to-br');
    expect(card?.className).toMatch(/from-yellow-50/);
  });

  it('applies red variant', () => {
    const { container } = render(
      <MetricCard title="Error" value={5} variant="red" />
    );
    const card = container.querySelector('.bg-gradient-to-br');
    expect(card?.className).toMatch(/from-red-50/);
  });

  it('applies purple variant', () => {
    const { container } = render(
      <MetricCard title="Custom" value={15} variant="purple" />
    );
    const card = container.querySelector('.bg-gradient-to-br');
    expect(card?.className).toMatch(/from-purple-50/);
  });

  it('applies orange variant', () => {
    const { container } = render(
      <MetricCard title="Alert" value={8} variant="orange" />
    );
    const card = container.querySelector('.bg-gradient-to-br');
    expect(card?.className).toMatch(/from-orange-50/);
  });

  it('applies cyan variant', () => {
    const { container } = render(
      <MetricCard title="Info" value={30} variant="cyan" />
    );
    const card = container.querySelector('.bg-gradient-to-br');
    expect(card?.className).toMatch(/from-cyan-50/);
  });

  it('renders progress bar when showProgress is true', () => {
    const { container } = render(
      <MetricCard
        title="Progress"
        value="70%"
        showProgress={true}
        progressValue={70}
        progressMax={100}
      />
    );
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('does not render progress bar when showProgress is false', () => {
    const { container } = render(
      <MetricCard
        title="No Progress"
        value={100}
        showProgress={false}
      />
    );
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const handleAction = jest.fn();
    render(
      <MetricCard
        title="Action"
        value={10}
        action={{ label: 'View More', onClick: handleAction }}
      />
    );
    const button = screen.getByText('View More');
    expect(button).toBeInTheDocument();
  });

  it('calls action callback when button is clicked', () => {
    const handleAction = jest.fn();
    render(
      <MetricCard
        title="Action"
        value={10}
        action={{ label: 'Click', onClick: handleAction }}
      />
    );
    const button = screen.getByText('Click');
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders different value types', () => {
    const { rerender } = render(
      <MetricCard title="Number" value={123} />
    );
    expect(screen.getByText('123')).toBeInTheDocument();

    rerender(
      <MetricCard title="String" value="Active" />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('sets progress bar width correctly', () => {
    const { container } = render(
      <MetricCard
        title="Progress"
        value="50%"
        showProgress={true}
        progressValue={50}
        progressMax={100}
      />
    );
    const progressFill = container.querySelector('[style*="width"]');
    expect(progressFill).toBeInTheDocument();
  });

  it('displays all content together', () => {
    render(
      <MetricCard
        title="Compliance"
        value="75%"
        icon="✅"
        subtitle="Q1 2024"
        variant="green"
        showProgress={true}
        progressValue={75}
        progressMax={100}
        action={{ label: 'Details', onClick: jest.fn() }}
      />
    );
    expect(screen.getByText('Compliance')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
    expect(screen.getByText('Q1 2024')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
});

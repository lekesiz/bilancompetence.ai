import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '../Alert';

describe('Alert Component', () => {
  it('renders alert with message', () => {
    render(<Alert type="info" message="This is an info alert" />);
    expect(screen.getByText('This is an info alert')).toBeInTheDocument();
  });

  it('renders success alert', () => {
    const { container } = render(
      <Alert type="success" message="Operation successful" />
    );
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('renders error alert', () => {
    const { container } = render(
      <Alert type="error" message="An error occurred" />
    );
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('renders warning alert', () => {
    const { container } = render(
      <Alert type="warning" message="Please be careful" />
    );
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveClass('bg-yellow-50', 'border-yellow-200');
  });

  it('renders info alert', () => {
    const { container } = render(
      <Alert type="info" message="Note this information" />
    );
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('renders title when provided', () => {
    render(
      <Alert
        type="success"
        title="Success"
        message="Your changes have been saved"
      />
    );
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('displays default icon for success', () => {
    render(<Alert type="success" message="Success message" />);
    const icon = screen.getByText('✅');
    expect(icon).toBeInTheDocument();
  });

  it('displays default icon for error', () => {
    render(<Alert type="error" message="Error message" />);
    const icon = screen.getByText('❌');
    expect(icon).toBeInTheDocument();
  });

  it('displays default icon for warning', () => {
    render(<Alert type="warning" message="Warning message" />);
    const icon = screen.getByText('⚠️');
    expect(icon).toBeInTheDocument();
  });

  it('displays default icon for info', () => {
    render(<Alert type="info" message="Info message" />);
    const icon = screen.getByText('ℹ️');
    expect(icon).toBeInTheDocument();
  });

  it('uses custom icon when provided', () => {
    render(
      <Alert type="success" message="Success" icon="🎉" />
    );
    expect(screen.getByText('🎉')).toBeInTheDocument();
    expect(screen.queryByText('✅')).not.toBeInTheDocument();
  });

  it('shows close button when dismissible is true', () => {
    render(
      <Alert
        type="info"
        message="Dismissible alert"
        dismissible={true}
        onClose={jest.fn()}
      />
    );
    const closeButton = screen.getByLabelText('Close alert');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <Alert
        type="info"
        message="Alert"
        dismissible={true}
        onClose={handleClose}
      />
    );
    const closeButton = screen.getByLabelText('Close alert');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when dismissible is false', () => {
    render(
      <Alert
        type="info"
        message="Non-dismissible alert"
        dismissible={false}
      />
    );
    expect(screen.queryByLabelText('Close alert')).not.toBeInTheDocument();
  });

  it('has proper ARIA role for accessibility', () => {
    const { container } = render(
      <Alert type="success" message="Success" />
    );
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveAttribute('role', 'alert');
  });

  it('renders with title and message together', () => {
    render(
      <Alert
        type="error"
        title="Validation Error"
        message="Please fix the following errors"
      />
    );
    expect(screen.getByText('Validation Error')).toBeInTheDocument();
    expect(screen.getByText('Please fix the following errors')).toBeInTheDocument();
  });
});

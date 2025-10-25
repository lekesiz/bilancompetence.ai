import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from '../FormInput';

describe('FormInput Component', () => {
  it('renders input element', () => {
    render(<FormInput />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<FormInput label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows required asterisk when required is true', () => {
    render(<FormInput label="Email" required={true} />);
    const label = screen.getByText('Email');
    expect(label.parentElement).toHaveTextContent('*');
  });

  it('displays error message', () => {
    render(
      <FormInput
        label="Password"
        error="Password must be at least 8 characters"
      />
    );
    expect(
      screen.getByText('Password must be at least 8 characters')
    ).toBeInTheDocument();
  });

  it('displays helper text when no error', () => {
    render(
      <FormInput
        label="Password"
        helperText="Must contain uppercase, lowercase, and numbers"
      />
    );
    expect(
      screen.getByText('Must contain uppercase, lowercase, and numbers')
    ).toBeInTheDocument();
  });

  it('applies default variant', () => {
    render(<FormInput variant="default" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-gray-300', 'bg-white dark:bg-gray-800');
  });

  it('applies filled variant', () => {
    render(<FormInput variant="filled" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('bg-gray-100');
  });

  it('applies different sizes', () => {
    const { rerender } = render(<FormInput size="sm" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<FormInput size="md" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-4', 'py-2', 'text-base');

    rerender(<FormInput size="lg" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-4', 'py-3', 'text-lg');
  });

  it('disables input when disabled prop is true', () => {
    render(<FormInput disabled={true} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('updates value on input change', () => {
    render(<FormInput />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(input.value).toBe('test value');
  });

  it('supports placeholder', () => {
    render(<FormInput placeholder="Enter your name" />);
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('applies error styles when error is present', () => {
    render(
      <FormInput error="This field is required" />
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('has proper aria-describedby for error', () => {
    render(
      <FormInput id="username" error="Username is required" />
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'username-error');
  });

  it('has proper aria-describedby for helper text', () => {
    render(
      <FormInput
        id="password"
        helperText="Min 8 characters"
      />
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'password-helper');
  });

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    render(
      <FormInput
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('supports type attribute', () => {
    render(<FormInput type="email" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('email');
  });

  it('applies custom className', () => {
    render(<FormInput className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });
});

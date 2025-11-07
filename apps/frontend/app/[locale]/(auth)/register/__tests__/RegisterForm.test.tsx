/**
 * RegisterForm Component Unit Tests
 * 
 * Tests for:
 * - Form rendering
 * - Input validation
 * - Form submission
 * - Error handling
 * - Role selection
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../components/RegisterForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('RegisterForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/nom complet/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /inscription/i })).toBeInTheDocument();
    });

    it('should render role selection', () => {
      render(<RegisterForm />);

      expect(screen.getByText(/bénéficiaire/i)).toBeInTheDocument();
      expect(screen.getByText(/consultant/i)).toBeInTheDocument();
    });

    it('should have link to login page', () => {
      render(<RegisterForm />);

      const loginLink = screen.getByText(/se connecter/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });
  });

  describe('Input Validation', () => {
    it('should show error for invalid email', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.queryByText(/email invalide/i)).toBeInTheDocument();
      });
    });

    it('should show error for short password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/mot de passe/i);
      await user.type(passwordInput, '123');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/minimum 6 caractères/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty full name', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nom complet/i);
      await user.type(nameInput, '  ');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/nom requis/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          user: { id: '1', email: 'test@example.com', role: 'BENEFICIARY' },
          token: 'mock-token'
        }),
      });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/nom complet/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /inscription/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/register'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('John Doe'),
          })
        );
      });
    });

    it('should disable submit button during submission', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/nom complet/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /inscription/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it('should handle registration error', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/nom complet/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /inscription/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role Selection', () => {
    it('should select beneficiary role by default', () => {
      render(<RegisterForm />);

      const beneficiaryRadio = screen.getByRole('radio', { name: /bénéficiaire/i });
      expect(beneficiaryRadio).toBeChecked();
    });

    it('should allow switching to consultant role', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const consultantRadio = screen.getByRole('radio', { name: /consultant/i });
      await user.click(consultantRadio);

      expect(consultantRadio).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/nom complet/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/email/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/mot de passe/i)).toHaveAccessibleName();
    });

    it('should associate errors with inputs using aria-describedby', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        const errorId = emailInput.getAttribute('aria-describedby');
        expect(errorId).toBeTruthy();
        if (errorId) {
          expect(document.getElementById(errorId)).toBeInTheDocument();
        }
      });
    });
  });
});

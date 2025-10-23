/**
 * BeneficiaryBookingForm Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BeneficiaryBookingForm from '@/components/scheduling/BeneficiaryBookingForm';
import { useCreateSessionBooking } from '@/hooks/useScheduling';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

jest.mock('@/hooks/useScheduling');
jest.mock('@/hooks/useAuth');
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('BeneficiaryBookingForm', () => {
  const mockProps = {
    bilanId: 'bilan-123',
    consultantId: 'consultant-456',
    selectedDate: '2025-01-20',
    selectedStartTime: '09:00',
    selectedEndTime: '10:00',
    durationMinutes: 60,
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      organizationId: 'org-123',
    });
    (useCreateSessionBooking as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ data: { id: 'booking-123' } }),
    });
  });

  describe('Rendering', () => {
    it('should render the booking form with all fields', () => {
      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Complete Your Booking')).toBeInTheDocument();
      expect(screen.getByText('Session Type *')).toBeInTheDocument();
      expect(screen.getByText('Meeting Format *')).toBeInTheDocument();
      expect(screen.getByText('Notes or Topics to Discuss (Optional)')).toBeInTheDocument();
      expect(screen.getByText('Preparation Materials (Optional)')).toBeInTheDocument();
    });

    it('should display booking summary with correct date and time', () => {
      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/2025-01-20 from 09:00 to 10:00/)).toBeInTheDocument();
      expect(screen.getByText(/60 minutes/)).toBeInTheDocument();
    });

    it('should have session type dropdown with all options', () => {
      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const sessionTypeSelect = screen.getByDisplayValue('Initial Meeting');
      expect(sessionTypeSelect).toBeInTheDocument();

      fireEvent.click(sessionTypeSelect);
      expect(screen.getByText('Initial Meeting')).toBeInTheDocument();
      expect(screen.getByText('Follow-up')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('should have meeting format dropdown with all options', () => {
      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const meetingFormatSelect = screen.getByDisplayValue('Video Call');
      expect(meetingFormatSelect).toBeInTheDocument();

      fireEvent.click(meetingFormatSelect);
      expect(screen.getByText('Video Call')).toBeInTheDocument();
      expect(screen.getByText('Phone Call')).toBeInTheDocument();
      expect(screen.getByText('In Person')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show meeting location field when in-person is selected', async () => {
      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const meetingFormatSelect = screen.getByDisplayValue('Video Call');
      await userEvent.selectOptions(meetingFormatSelect, 'IN_PERSON');

      expect(screen.getByPlaceholderText(/e.g., Office Building/)).toBeInTheDocument();
    });

    it('should show meeting link field when video is selected', async () => {
      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const meetingFormatSelect = screen.getByDisplayValue('Video Call');
      await userEvent.selectOptions(meetingFormatSelect, 'VIDEO');

      expect(screen.getByPlaceholderText(/https:\/\/meet.google.com/)).toBeInTheDocument();
    });

    it('should not show conditional fields for phone format', async () => {
      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const meetingFormatSelect = screen.getByDisplayValue('Video Call');
      await userEvent.selectOptions(meetingFormatSelect, 'PHONE');

      expect(screen.queryByPlaceholderText(/e.g., Office Building/)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/https:\/\/meet.google.com/)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with correct data', async () => {
      const mockMutate = jest.fn().mockResolvedValue({ data: { id: 'booking-123' } });
      (useCreateSessionBooking as jest.Mock).mockReturnValue({
        mutateAsync: mockMutate,
      });

      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const notesField = screen.getByPlaceholderText(/Share any topics/);
      await userEvent.type(notesField, 'I have some concerns to discuss');

      const submitButton = screen.getByRole('button', { name: /Confirm Booking/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it('should show success toast on successful booking', async () => {
      (useCreateSessionBooking as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn().mockResolvedValue({ data: { id: 'booking-123' } }),
      });

      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Confirm Booking/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Session booked successfully!');
      });
    });

    it('should call onSuccess with booking ID', async () => {
      const mockMutate = jest.fn().mockResolvedValue({ data: { id: 'booking-123' } });
      (useCreateSessionBooking as jest.Mock).mockReturnValue({
        mutateAsync: mockMutate,
      });

      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Confirm Booking/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('booking-123');
      });
    });

    it('should show error toast on submission failure', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Slot no longer available',
          },
        },
      };

      (useCreateSessionBooking as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn().mockRejectedValue(mockError),
      });

      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Confirm Booking/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Slot no longer available');
      });
    });

    it('should disable submit button while loading', async () => {
      const mockMutate = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { id: 'booking-123' } }), 100)
          )
      );
      (useCreateSessionBooking as jest.Mock).mockReturnValue({
        mutateAsync: mockMutate,
      });

      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Confirm Booking/ });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Form Cancellation', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should disable cancel button while loading', async () => {
      (useCreateSessionBooking as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: { id: 'booking-123' } }), 100)
            )
        ),
      });

      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Confirm Booking/ });
      fireEvent.click(submitButton);

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Form Fields', () => {
    it('should allow typing in notes field', async () => {
      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const notesField = screen.getByPlaceholderText(/Share any topics/);
      await userEvent.type(notesField, 'Test notes');

      expect(notesField).toHaveValue('Test notes');
    });

    it('should allow typing in preparation materials field', async () => {
      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const materialsField = screen.getByPlaceholderText(/Any documents/);
      await userEvent.type(materialsField, 'Test materials');

      expect(materialsField).toHaveValue('Test materials');
    });

    it('should require organization context', () => {
      (useAuth as jest.Mock).mockReturnValue({
        organizationId: null,
      });

      render(
        <BeneficiaryBookingForm
          {...mockProps}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Confirm Booking/ });
      fireEvent.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Organization context not available');
    });
  });
});
